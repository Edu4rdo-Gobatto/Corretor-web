import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Devs from './Devs';
import { BootstrapContext } from '../../seo/context';

describe('página de desenvolvedores', () => {
  it('exibe nomes, papéis e links do Instagram em nova aba', () => {
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
    expect(screen.getByAltText('Foto de Eduardo Gobatto')).toHaveAttribute(
      'src',
      'https://avatars.githubusercontent.com/u/215524121?v=4',
    );
    expect(screen.getByAltText('Foto de Fernando Riad')).toHaveAttribute(
      'src',
      'https://avatars.githubusercontent.com/u/65686336?v=4',
    );
  });
});
