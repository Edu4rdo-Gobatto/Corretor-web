import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CasaQuebrada from './CasaQuebrada';

describe('casa quebrada da 404', () => {
  it('renderiza a ruína com rótulo acessível', () => {
    render(<CasaQuebrada animada rotulo="Casa quebrada com bola de feno passando" />);
    expect(screen.getByRole('img', { name: /casa quebrada/i })).toBeInTheDocument();
  });

  it('anima poeira e feno quando ligada', () => {
    const { container } = render(<CasaQuebrada animada rotulo="Casa quebrada" />);
    expect(container.querySelector('.animate-feno')).not.toBeNull();
    expect(container.querySelector('.animate-feno-girar')).not.toBeNull();
    expect(container.querySelector('.animate-poeira')).not.toBeNull();
  });

  it('desliga a animação via prop', () => {
    const { container } = render(<CasaQuebrada animada={false} rotulo="Casa quebrada" />);
    expect(container.querySelector('.animate-feno')).toBeNull();
    expect(container.querySelector('.animate-feno-girar')).toBeNull();
    expect(container.querySelector('.animate-poeira')).toBeNull();
    // A cena continua visível e parada.
    expect(screen.getByRole('img', { name: /casa quebrada/i })).toBeInTheDocument();
  });
});
