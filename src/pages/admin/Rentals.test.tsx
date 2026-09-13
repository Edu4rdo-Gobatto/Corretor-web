import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RentalGuard, Parties } from './Rentals';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
vi.mock('../../hooks/useAuth',()=>({useAuth:vi.fn()}));
afterEach(()=>{cleanup();vi.restoreAllMocks();});
describe('rental authorization',()=>{
  it('does not mount rental data loaders for AGENT',()=>{
    vi.mocked(useAuth).mockReturnValue({agent:{id:'a',name:'Agent',role:'AGENT',email:'a@example.test',active:true,avatarUrl:null,creci:null,whatsappNumber:'5565999999999',createdAt:''},loading:false,login:vi.fn(),logout:vi.fn()});
    const list=vi.spyOn(api,'listRentalParties');
    render(<MemoryRouter initialEntries={['/admin/proprietarios']}><Routes><Route path="/admin" element={<p>Painel</p>}/><Route path="/admin/proprietarios" element={<RentalGuard><Parties kind="OWNER"/></RentalGuard>}/></Routes></MemoryRouter>);
    expect(screen.getByText('Painel')).toBeInTheDocument();
    expect(list).not.toHaveBeenCalled();
  });
});
