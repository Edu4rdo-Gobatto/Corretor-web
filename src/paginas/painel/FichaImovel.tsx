import type { FichaImovel as Ficha } from '../../tipos';
import GaleriaMidia from '../../componentes/GaleriaMidia';
import { area, codigoImovel, dinheiro, rotuloCaracteristica, rotulosStatusImovel, valorCaracteristica } from '../../servicos/formato';

/** Leitura da ficha de um imóvel de outro corretor: sem edição. */
export default function FichaImovel({ imovel }: { imovel: Ficha }) {
  return (
    <section className="grid gap-6 rounded border border-line bg-paper p-5 lg:p-7">
      <div>
        <h2>{imovel.titulo} <small className="text-muted">{codigoImovel(imovel.id)}</small></h2>
        <p>{imovel.tipo?.nome} · {imovel.finalidade?.nome} · {rotulosStatusImovel[imovel.status]}{imovel.ativo ? '' : ' · Inativo'}</p>
        <p className="muted">Responsável: {imovel.corretor?.nome ?? 'não informado'}. A edição está disponível para o responsável e administradores.</p>
      </div>
      <GaleriaMidia midias={imovel.midias} titulo={imovel.titulo} />
      <dl className="grid gap-3 [&_dd]:m-0 [&_dt]:font-semibold">
        <div><dt>Valor de venda</dt><dd>{imovel.valor_venda === null ? 'Não informado' : dinheiro(imovel.valor_venda)}</dd></div>
        <div><dt>Valor de locação</dt><dd>{imovel.valor_locacao === null ? 'Não informado' : `${dinheiro(imovel.valor_locacao)} / mês`}</dd></div>
        <div><dt>Condomínio / IPTU</dt><dd>{imovel.valor_condominio === null ? 'Não informado' : dinheiro(imovel.valor_condominio)} / {imovel.valor_iptu === null ? 'Não informado' : dinheiro(imovel.valor_iptu)}</dd></div>
        <div><dt>Área útil / total</dt><dd>{area(imovel.area_util)} / {area(imovel.area_total)}</dd></div>
        <div><dt>Endereço</dt><dd>{imovel.logradouro}, {imovel.numero} {imovel.complemento} · {imovel.bairro}, {imovel.cidade}/{imovel.estado} · {imovel.cep}</dd></div>
        {imovel.proprietario && <div><dt>Proprietário</dt><dd>{imovel.proprietario.nome}</dd></div>}
      </dl>
      <p className="whitespace-pre-wrap">{imovel.descricao}</p>
      <ul>{imovel.caracteristicas.map((item) => <li key={item.caracteristica_id}>{rotuloCaracteristica(item.nome)}: {valorCaracteristica(item.valor)}</li>)}</ul>
    </section>
  );
}
