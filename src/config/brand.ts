// Ponto único da identidade do site. Trocar o negócio de dono ou de região
// deve exigir mudança apenas aqui — nenhum texto de marca fica espalhado no código.
export const brand = {
  name: 'Lucas Gobatto',
  credential: 'Corretor de imóveis — CRECI 15776',
  creci: '15776',
  // Partes do logotipo no cabeçalho; a segunda é destacada visualmente.
  logo: { first: 'LUCAS GOBATTO', second: 'CORRETOR DE IMÓVEIS — CRECI 15776' },
  tagline: 'Imóveis comerciais em Juara e região.',
  closing: 'Juara, Mato Grosso — atendimento com corretor responsável.',
  // Região de atuação: aparece em títulos, descrições e no JSON-LD.
  region: { name: 'Juara, Mato Grosso', city: 'Juara', state: 'MT', schemaType: 'City' as const },
  privacy: { controller: '', contactEmail: '', address: '', version: 'v1.0' },
};
