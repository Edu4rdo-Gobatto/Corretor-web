import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Devs from './Devs';
import { BootstrapContext } from '../../seo/context';

describe('página de desenvolvedores', () => {
  it('exibe nomes, papéis e links do Instagram e GitHub em nova aba', () => {
    render(
      <BootstrapContext.Provider value={{ url: '/devs', config: { siteUrl: '', indexable: false }, data: {}, status: 200 }}>
        <MemoryRouter initialEntries={['/devs']}>
          <Devs />
        </MemoryRouter>
      </BootstrapContext.Provider>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Desenvolvedores');
    expect(screen.getByRole('heading', { name: 'Eduardo Gobatto' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fernando Riad' })).toBeInTheDocument();
    const edu = screen.getByRole('link', { name: 'Instagram de Eduardo Gobatto' });
    const fer = screen.getByRole('link', { name: 'Instagram de Fernando Riad' });
    expect(edu).toHaveAttribute('href', 'https://www.instagram.com/e.gobatto/');
    expect(fer).toHaveAttribute('href', 'https://www.instagram.com/_riad777/');
    expect(edu).toHaveAttribute('target', '_blank');
    expect(fer).toHaveAttribute('target', '_blank');
    expect(edu.getAttribute('rel')).toContain('noopener');
    const eduGh = screen.getByRole('link', { name: 'GitHub de Eduardo Gobatto' });
    const ferGh = screen.getByRole('link', { name: 'GitHub de Fernando Riad' });
    expect(eduGh).toHaveAttribute('href', 'https://github.com/Edu4rdo-Gobatto');
    expect(ferGh).toHaveAttribute('href', 'https://github.com/SHURIKA6');
    expect(eduGh).toHaveAttribute('target', '_blank');
    expect(ferGh).toHaveAttribute('target', '_blank');
    expect(eduGh.getAttribute('rel')).toContain('noopener');
    expect(screen.getByAltText('Foto de Eduardo Gobatto')).toHaveAttribute(
      'src',
      '/assets/dev-eduardo.jpg',
    );
    expect(screen.getByAltText('Foto de Fernando Riad')).toHaveAttribute(
      'src',
      '/assets/dev-fernando.jpg',
    );
  });
});
