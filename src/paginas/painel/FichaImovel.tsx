import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { FichaImovel as Ficha } from '../../tipos';
import GaleriaMidia from '../../componentes/GaleriaMidia';
import { area, dataCivil, dinheiroExato, rotuloCaracteristica, rotulosStatusImovel, valorCaracteristica } from '../../servicos/formato';
import { urlFichaCorretor } from '../../servicos/urls';
import { useSessao } from '../../hooks/useSessao';
import { estilos } from '../../componentes/estilosPainel';
import Etiqueta from '../../componentes/Etiqueta';

/** Consulta compartilhada pela ficha própria e pela edição sem permissão. */
export default function FichaImovel({ imovel }: { imovel: Ficha }) {
  const { corretor } = useSessao();
  const linha = (rotulo: string, valor: ReactNode) => <div><dt>{rotulo}</dt><dd>{valor || 'Não informado'}</dd></div>;
  const moeda = (valor: string | null) => valor === null ? 'Não informado' : dinheiroExato(valor);
  return <>
    <section className={estilos.painel}>
      <h2 className={estilos.tituloPainel}>Fotos e vídeos</h2>
      <GaleriaMidia midias={imovel.midias} titulo={imovel.titulo} />
    </section>
    <section className={estilos.painel}>
      <h2 className={estilos.tituloPainel}>Dados do imóvel</h2>
      <div className="mb-5 flex flex-wrap gap-2"><Etiqueta>{rotulosStatusImovel[imovel.status]}</Etiqueta>{!imovel.ativo && <Etiqueta tom="alerta">Arquivado</Etiqueta>}{imovel.destaque && <Etiqueta tom="atencao">Destaque</Etiqueta>}</div>
      <dl className="ficha-dados">
        {linha('Tipo', imovel.tipo?.nome)}{linha('Finalidade', imovel.finalidade?.nome)}
        {linha('Valor de venda', moeda(imovel.valor_venda))}{linha('Locação mensal', moeda(imovel.valor_locacao))}
        {linha('Condomínio', moeda(imovel.valor_condominio))}{linha('IPTU', moeda(imovel.valor_iptu))}
        {linha('Área útil', area(imovel.area_util))}{linha('Área total', area(imovel.area_total))}
        {linha('Endereço', `${imovel.logradouro}, ${imovel.numero} ${imovel.complemento ?? ''}, ${imovel.bairro}, ${imovel.cidade}/${imovel.estado}`)}{linha('CEP', imovel.cep)}
        {linha('Responsável', <Link to={urlFichaCorretor(imovel.corretor_id, corretor?.id)}>{imovel.corretor?.nome ?? `Corretor #${imovel.corretor_id}`}</Link>)}
        {linha('Proprietário', imovel.proprietario && <Link to={`/admin/pessoas/${imovel.proprietario.id}`}>{imovel.proprietario.nome}</Link>)}
      </dl>
      <h3 className="mt-7 text-[22px]">Descrição</h3><p className="whitespace-pre-wrap">{imovel.descricao}</p>
      <h3 className="mt-7 text-[22px]">Características</h3>
      {imovel.caracteristicas.length ? <ul>{imovel.caracteristicas.map((item) => <li key={item.caracteristica_id}>{rotuloCaracteristica(item.nome)}: {valorCaracteristica(item.valor)}</li>)}</ul> : <p className="campo-dica">Nenhuma característica cadastrada.</p>}
    </section>
    <section className={estilos.painel}>
      <h2 className={estilos.tituloPainel}>Ficha interna</h2>
      <dl className="ficha-dados">
        {linha('Exclusividade', imovel.exclusividade ? 'Sim' : 'Não')}{linha('Exclusividade até', dataCivil(imovel.exclusividade_ate))}
        {linha('Captação', dataCivil(imovel.data_captacao))}{linha('Chaves', imovel.chaves)}
        {linha('Matrícula', imovel.matricula)}{linha('Inscrição municipal', imovel.inscricao_municipal)}
        {linha('Motivo da baixa', imovel.motivo_baixa)}
      </dl>
      {imovel.observacoes_internas && <><h3 className="mt-7 text-[22px]">Observações internas</h3><p className="whitespace-pre-wrap">{imovel.observacoes_internas}</p></>}
    </section>
  </>;
}
