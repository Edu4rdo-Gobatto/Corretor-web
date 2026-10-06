import type { Corretor, Pessoa, StatusContato } from '../tipos';

type Usuario = Pick<Corretor, 'id' | 'cargo'> | null;

/** Mesma regra de edição da API: ADMIN ou responsável pelo cadastro. */
export function podeEditarPessoa(usuario: Usuario, pessoa: Pick<Pessoa, 'corretor_id'>): boolean {
  return Boolean(usuario && (usuario.cargo === 'ADMIN' || usuario.id === pessoa.corretor_id));
}

/** A restrição de reabertura é de interface; a API ainda não a impõe. */
export function podeAlterarStatusContato(usuario: Usuario, pessoa: Pick<Pessoa, 'corretor_id' | 'status_contato'>, destino: StatusContato): boolean {
  return podeEditarPessoa(usuario, pessoa) && (pessoa.status_contato !== 'FINALIZADO' || destino === 'FINALIZADO' || usuario?.cargo === 'ADMIN');
}
