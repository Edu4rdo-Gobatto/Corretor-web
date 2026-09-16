/** Regras de validação iguais às da API, para o formulário recusar antes de enviar. */
export function documentoValido(valor: string): boolean {
  if (!/^\d{11}$|^\d{14}$/.test(valor) || /^(\d)\1+$/.test(valor)) return false;
  const digitos = [...valor].map(Number);
  for (let posicao = digitos.length - 2; posicao < digitos.length; posicao++) {
    let soma = 0;
    for (let indice = 0; indice < posicao; indice++) soma += digitos[indice] * (digitos.length === 11 ? posicao + 1 - indice : (posicao - 1 - indice) % 8 + 2);
    const resto = soma % 11;
    if (digitos[posicao] !== (resto < 2 ? 0 : 11 - resto)) return false;
  }
  return true;
}

export function telefoneValido(valor: string): boolean {
  if (!/^[+\d() .-]+$/.test(valor)) return false;
  let numero = valor.replace(/\D/g, '');
  if ((numero.length === 12 || numero.length === 13) && numero.startsWith('55')) numero = numero.slice(2);
  return /^[1-9]\d(?:[2-5]\d{7}|9\d{8})$/.test(numero);
}

export const somenteDigitos = (valor: string) => valor.replace(/\D/g, '');
