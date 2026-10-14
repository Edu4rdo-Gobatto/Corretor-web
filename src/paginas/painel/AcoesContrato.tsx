import { useState, type FormEvent } from 'react';
import Aviso from '../../componentes/Aviso';
import Campo from '../../componentes/Campo';
import Dialogo from '../../componentes/Dialogo';
import { api } from '../../servicos/api';
import { dataCivil, mensagemErro } from '../../servicos/formato';
import type { Contrato } from '../../servicos/locacoes';

/** Soma dias a uma data civil `AAAA-MM-DD` sem passar pelo fuso local. */
const somarDias = (data: string, dias: number) => {
  const base = new Date(`${data}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
};
const somarAno = (data: string) => {
  const base = new Date(`${data}T12:00:00Z`);
  base.setUTCFullYear(base.getUTCFullYear() + 1);
  return somarDias(base.toISOString().slice(0, 10), -1);
};

type Propriedades = { contrato: Contrato; aoFechar: () => void; aoConcluir: (contrato: Contrato) => void };

/**
 * Encerramento antecipado: o último dia de vigência passa a ser o fim do contrato e o fim original fica registrado.
 * Comissões e parcelas não mudam sozinhas; ajuste-as na comissão, se for o caso.
 */
export function EncerrarContrato({ contrato, aoFechar, aoConcluir }: Propriedades) {
  const [data, setData] = useState('');
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const ultimoDia = somarDias(contrato.data_fim, -1);
  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!data || data < contrato.data_inicio || data > ultimoDia) { setErro(`Informe uma data entre ${dataCivil(contrato.data_inicio)} e ${dataCivil(ultimoDia)}.`); return; }
    if (motivo.trim().length < 2) { setErro('Informe o motivo do encerramento.'); return; }
    setOcupado(true); setErro('');
    try { aoConcluir(await api.encerrarContrato(contrato.id, { data_encerramento: data, motivo: motivo.trim() })); }
    catch (falha) { setErro(mensagemErro(falha)); }
    finally { setOcupado(false); }
  }
  return <Dialogo titulo="Encerrar contrato antes do fim" tamanho="estreito" ocupado={ocupado} alterado={Boolean(data || motivo)} aoFechar={aoFechar}>
    <form noValidate onSubmit={enviar} className="grid gap-4">
      <p className="m-0">Fim contratado: {dataCivil(contrato.data_fim)}. A data informada passa a ser o último dia de vigência; com data futura, o contrato segue ativo até lá.</p>
      <Campo rotulo="Último dia de vigência" obrigatorio><input type="date" value={data} min={contrato.data_inicio} max={ultimoDia} onChange={(evento) => setData(evento.target.value)} data-foco-inicial /></Campo>
      <Campo rotulo="Motivo" obrigatorio dica="Fica no histórico do contrato."><textarea value={motivo} maxLength={1000} rows={3} onChange={(evento) => setMotivo(evento.target.value)} /></Campo>
      <Aviso tom="atencao">Comissões e parcelas deste contrato não mudam. Ajuste-as na comissão, se necessário.</Aviso>
      {erro && <Aviso tom="erro">{erro}</Aviso>}
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" className="buttonSecondary" disabled={ocupado} onClick={aoFechar}>Cancelar</button>
        <button type="submit" className="button buttonPerigo" disabled={ocupado}>{ocupado ? 'Encerrando…' : 'Encerrar contrato'}</button>
      </div>
    </form>
  </Dialogo>;
}

/**
 * Renovação como contrato novo: mesmas partes, imóvel e condições, com novo número, novo período e, se houver,
 * aluguel reajustado. O contrato atual fica inativo e ligado à renovação.
 */
export function RenovarContrato({ contrato, aoFechar, aoConcluir }: Propriedades) {
  const inicioPadrao = somarDias(contrato.data_fim, 1);
  const [numero, setNumero] = useState('');
  const [inicio, setInicio] = useState(inicioPadrao);
  const [fim, setFim] = useState(somarAno(inicioPadrao));
  const [aluguel, setAluguel] = useState(contrato.valor_aluguel);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!/^[\p{L}\p{N}._-]{3,100}$/u.test(numero.trim())) { setErro('Informe o número do novo contrato (3 a 100 letras, números, ponto, hífen ou sublinhado).'); return; }
    if (!inicio || inicio <= contrato.data_fim) { setErro(`A renovação deve começar depois de ${dataCivil(contrato.data_fim)}.`); return; }
    if (!fim || fim < inicio) { setErro('O fim deve ser igual ou posterior ao início.'); return; }
    const valor = Number(aluguel.replace(',', '.'));
    if (!Number.isFinite(valor) || valor <= 0) { setErro('Informe um aluguel maior que zero.'); return; }
    setOcupado(true); setErro('');
    try { aoConcluir(await api.renovarContrato(contrato.id, { numero_contrato: numero.trim(), data_inicio: inicio, data_fim: fim, valor_aluguel: valor.toFixed(2) })); }
    catch (falha) { setErro(mensagemErro(falha)); }
    finally { setOcupado(false); }
  }
  return <Dialogo titulo="Renovar contrato" tamanho="estreito" ocupado={ocupado} alterado={Boolean(numero)} aoFechar={aoFechar}>
    <form noValidate onSubmit={enviar} className="grid gap-4">
      <p className="m-0">Um contrato novo é criado com as mesmas partes, imóvel e condições de {contrato.numero_contrato}. O contrato atual fica inativo e no histórico.</p>
      <Campo rotulo="Número do novo contrato" obrigatorio><input value={numero} maxLength={100} onChange={(evento) => setNumero(evento.target.value)} data-foco-inicial /></Campo>
      <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
        <Campo rotulo="Início" obrigatorio><input type="date" value={inicio} min={inicioPadrao} onChange={(evento) => setInicio(evento.target.value)} /></Campo>
        <Campo rotulo="Fim" obrigatorio><input type="date" value={fim} min={inicio} onChange={(evento) => setFim(evento.target.value)} /></Campo>
      </div>
      <Campo rotulo="Aluguel (R$)" obrigatorio dica="Atualize se houver reajuste."><input type="number" inputMode="decimal" min="0.01" step="0.01" value={aluguel} onChange={(evento) => setAluguel(evento.target.value)} /></Campo>
      {erro && <Aviso tom="erro">{erro}</Aviso>}
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" className="buttonSecondary" disabled={ocupado} onClick={aoFechar}>Cancelar</button>
        <button type="submit" className="button" disabled={ocupado}>{ocupado ? 'Renovando…' : 'Criar renovação'}</button>
      </div>
    </form>
  </Dialogo>;
}
