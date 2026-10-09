import { api } from '../../servicos/api';
import type { CadastroContrato, CategoriaCadastro, Classificacao, Pagina } from '../../tipos';
import { EditorCadastroContrato } from './EditorCadastroContrato';
import { EditorClassificacao } from './EditorClassificacao';
import { ehCategoriaContrato } from './categoriasCadastro';

/** Registro de qualquer categoria; cada uma usa só os seus campos. */
export type ItemCadastro = Classificacao & Partial<CadastroContrato>;

/** Leitura e ativação comuns às cinco categorias de Cadastros. */
export const cadastrosApi = {
  listar: (categoria: CategoriaCadastro, pagina: number): Promise<Pagina<ItemCadastro>> => ehCategoriaContrato(categoria) ? api.listarCadastrosContrato(categoria, pagina) : api.listarClassificacoes(categoria, pagina),
  obter: (categoria: CategoriaCadastro, id: number): Promise<ItemCadastro> => ehCategoriaContrato(categoria) ? api.obterCadastroContrato(categoria, id) : api.obterClassificacao(categoria, id),
  ativar: (categoria: CategoriaCadastro, id: number, ativo: boolean): Promise<unknown> => ehCategoriaContrato(categoria) ? api.salvarCadastroContrato(categoria, { ativo }, id) : api.salvarClassificacao(categoria, { ativo }, id),
};

export function EditorCadastro({ categoria, item, aoFechar, aoSalvar }: { categoria: CategoriaCadastro; item: ItemCadastro | null; aoFechar: () => void; aoSalvar: () => void }) {
  return ehCategoriaContrato(categoria)
    ? <EditorCadastroContrato categoria={categoria} item={item} aoFechar={aoFechar} aoSalvar={aoSalvar} />
    : <EditorClassificacao categoria={categoria} item={item} aoFechar={aoFechar} aoSalvar={aoSalvar} />;
}
