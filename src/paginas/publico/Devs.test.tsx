import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Devs from './Devs';
import { ContextoBootstrap } from '../../seo/context';

describe('página de desenvolvedores', () => {
  it('exibe nomes, papéis e links do Instagram e GitHub em nova aba', () => {
    render(<ContextoBootstrap.Provider value={{ url: '/devs', config: { siteUrl: '', indexable: false }, data: {}, status: 200 }}><MemoryRouter initialEntries={['/devs']}><Devs /></MemoryRouter></ContextoBootstrap.Provider>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Desenvolvedores');
    expect(screen.getByRole('heading', { name: 'Eduardo Gobatto' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fernando Riad' })).toBeInTheDocument();
    const edu = screen.getByRole('link', { name: 'Instagram de Eduardo Gobatto' });
    expect(edu).toHaveAttribute('href', 'https://www.instagram.com/e.gobatto/');
    expect(edu).toHaveAttribute('target', '_blank');
    expect(edu.getAttribute('rel')).toContain('noopener');
    expect(screen.getByRole('link', { name: 'GitHub de Fernando Riad' })).toHaveAttribute('href', 'https://github.com/SHURIKA6');
    expect(screen.getByAltText('Foto de Eduardo Gobatto')).toHaveAttribute('src', '/assets/dev-eduardo.jpg');
  });
});
