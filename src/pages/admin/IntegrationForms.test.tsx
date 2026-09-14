import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Commissions from './Commissions';
import ClientEditor from './ClientEditor';
import PropertyForm from './PropertyForm';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { sampleClassifications, sampleWireProperty } from '../../seo/fixture';
import { propertyFromWire } from '../../services/portuguese';
import type { Commission } from './rentalSchema';
vi.mock('../../hooks/useAuth',()=>({useAuth:vi.fn()}));
const id='11111111-1111-4111-8111-111111111111';
const admin={id,name:'Admin',role:'ADMIN' as const,email:'admin@example.test',active:true,avatarUrl:null,creci:null,whatsappNumber:'5565999999999',createdAt:''};
function auth(role:'ADMIN'|'AGENT'='ADMIN'){vi.mocked(useAuth).mockReturnValue({agent:{...admin,role},loading:false,login:vi.fn(),logout:vi.fn(),refresh:vi.fn()});}
beforeAll(()=>{HTMLDialogElement.prototype.showModal=vi.fn(function(this:HTMLDialogElement){this.setAttribute('open','');});HTMLDialogElement.prototype.close=vi.fn(function(this:HTMLDialogElement){this.removeAttribute('open');});});
afterEach(()=>{cleanup();vi.restoreAllMocks();sessionStorage.clear();});
describe('fluxos integrados do painel',()=>{
 it('exige confirmação e comprovante antes de marcar parcela como paga',async()=>{
  auth();let commission:Commission={id,tipo_operacao:'VENDA',contrato_id:null,imovel_id:id,cliente_id:id,valor_total:'100.00',quantidade_parcelas:1,observacoes:null,ativo:true,parcelas:[{id,numero_parcela:1,data_vencimento:'2026-09-20',valor:'100.00',status:'PENDENTE',pago_em:null,observacao_pagamento:null,ativo:true}]};
  vi.spyOn(api,'listCommissions').mockImplementation(async()=>({itens:[commission],total:1,pagina:1,limite:15}));vi.spyOn(api,'getCommission').mockImplementation(async()=>commission);vi.spyOn(api,'rentalPropertyOption').mockResolvedValue({id,nome:'Sala do teste'});vi.spyOn(api,'rentalClientOption').mockResolvedValue({id,nome:'Cliente do teste'});
  const pay=vi.spyOn(api,'payCommissionInstallment').mockImplementation(async(_,input)=>{const parcel={...commission.parcelas[0],status:'PAGO' as const,pago_em:'2026-09-14T12:00:00Z',observacao_pagamento:input.observacao_pagamento};commission={...commission,parcelas:[parcel],valor_pago:'100.00',saldo_pendente:'0.00'};return parcel;});
  render(<MemoryRouter><Commissions/></MemoryRouter>);fireEvent.click(await screen.findByRole('button',{name:'Ver 1 parcela(s)'}));fireEvent.click(await screen.findByRole('button',{name:'Registrar recebimento'}));fireEvent.click(screen.getByRole('button',{name:'Confirmar recebimento'}));expect(await screen.findByText('Confirme que o pagamento foi recebido.')).toBeInTheDocument();expect(pay).not.toHaveBeenCalled();fireEvent.change(screen.getByLabelText(/Referência do comprovante/),{target:{value:'PIX comprovante 123'}});fireEvent.click(screen.getByRole('checkbox'));fireEvent.click(screen.getByRole('button',{name:'Confirmar recebimento'}));await waitFor(()=>expect(pay).toHaveBeenCalledWith(id,{confirmar_pagamento:true,observacao_pagamento:'PIX comprovante 123'}));expect(await screen.findByText('Pago')).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Registrar recebimento'})).toBeNull();
 });
 it('normaliza telefone recebido com máscara e atribui Minha conta explicitamente',async()=>{
  auth();vi.spyOn(api,'listProperties').mockResolvedValue({items:[],total:0,page:1,limit:15,totalPages:0});vi.spyOn(api,'listAgents').mockResolvedValue({items:[admin],total:1,page:1,limit:20,totalPages:0});const client={id,leadName:'Cliente',leadPhone:'(65) 99999-9999',leadEmail:null,message:null,propertyId:null,agentId:'22222222-2222-4222-8222-222222222222',consentGiven:true,consentTimestamp:'',consentIp:'',termsVersion:'',createdAt:'',active:true};const save=vi.spyOn(api,'saveLead').mockResolvedValue(client);
  render(<MemoryRouter><ClientEditor client={client} close={()=>{}} saved={()=>{}}/></MemoryRouter>);expect(screen.getByLabelText('Telefone')).toHaveValue('65999999999');fireEvent.change(screen.getByLabelText('Corretor responsável'),{target:{value:''}});fireEvent.click(screen.getByRole('button',{name:'Salvar cliente'}));await waitFor(()=>expect(save).toHaveBeenCalledWith(expect.objectContaining({agentId:id,phone:'65999999999'}),id,client));
 });
 it('mostra imóvel alheio reservado em modo interno de leitura',async()=>{
  auth('AGENT');vi.spyOn(api,'classifications').mockResolvedValue(sampleClassifications);vi.spyOn(api,'getManagedProperty').mockResolvedValue(propertyFromWire({...sampleWireProperty,status:'RESERVADO'}));
  render(<MemoryRouter initialEntries={['/admin/imoveis/imovel/editar']}><Routes><Route path="/admin/imoveis/:id/editar" element={<PropertyForm/>}/></Routes></MemoryRouter>);expect(await screen.findByRole('heading',{name:sampleWireProperty.titulo})).toBeInTheDocument();expect(screen.getByText(/Responsável: Corretor de teste/)).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Salvar imóvel'})).toBeNull();expect(screen.getByText(sampleWireProperty.descricao)).toBeInTheDocument();
 });
});

