// Ponto único da identidade do site. Trocar o negócio de dono ou de região
// deve exigir mudança apenas aqui — nenhum texto de marca fica espalhado no código.
export const brand = {
  name: 'Corretor Comercial',
  // Partes do logotipo no cabeçalho; a segunda é destacada visualmente.
  logo: { first: 'CORRETOR', second: 'COMERCIAL' },
  tagline: 'Espaços para novos negócios.',
  closing: 'Um novo espaço. Novas possibilidades.',
  // Região de atuação: aparece em títulos, descrições e no JSON-LD.
  region: { name: 'Mato Grosso', schemaType: 'State' },
  privacy: { controller: '', contactEmail: '', address: '', version: 'v1.0' },
};
