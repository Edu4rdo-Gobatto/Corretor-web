// Ponto único da identidade do site. Trocar o negócio de dono ou de região
// deve exigir mudança apenas aqui — nenhum texto de marca fica espalhado no código.
export const brand = {
  name: 'Lucas Gobatto',
  credential: 'Corretor de imóveis — CRECI 15776',
  creci: '15776',
  // Partes do logotipo no cabeçalho; a segunda é destacada visualmente.
  logo: { first: 'LUCAS GOBATTO', second: 'CORRETOR DE IMÓVEIS — CRECI 15776', asset: '/assets/brand-logo.png' },
  tagline: 'Imóveis comerciais em Juara e região.',
  closing: 'Juara, Mato Grosso — atendimento com corretor responsável.',
  // Região de atuação: aparece em títulos, descrições e no JSON-LD.
  region: { name: 'Juara, Mato Grosso', city: 'Juara', state: 'MT', schemaType: 'City' as const },
  privacy: { controller: 'Lucas Bergamin Gobatto', contactEmail: 'Lucas.gobatto@outlook.com', address: 'Rua Corumbá, 192w, sala 03 Lucas Gobatto, Centro.', version: 'v1.0' },
  // Dados comerciais confirmados pelo proprietário; campos vazios não são publicados.
  contact: { whatsapp: '(66) 98434-6427', email: 'Lucas.gobatto@outlook.com', hours: '7h30 às 11h e 13h às 18h', address: 'Rua Corumbá, 192w, sala 03 Lucas Gobatto, Centro.', creci: 'CRECI 15776F' },
};
