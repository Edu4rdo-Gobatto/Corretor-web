import PropertyReadOnly from './PropertyReadOnly';
import { propertyUrl } from '../../services/urls';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import type { Agent, Property } from '../../types';
import { errorMessage, propertyStatuses } from '../../services/format';
import AsyncState from '../../components/AsyncState';
import MediaManager from '../../components/MediaManager';
import { propertySchema, states, type PropertyValues } from './propertySchema';
import type { Classifications } from '../../services/portuguese';
import { clearPropertyDraft, propertyDraftKey, readPropertyDraft, writePropertyDraft } from './propertyDraft';

const formField = '[&_label]:grid [&_label]:gap-[7px] [&_label]:font-semibold [&_input]:w-full [&_select]:w-full [&_textarea]:w-full [&_textarea]:min-h-[130px]';
const errorText = 'm-0 text-[13px] text-error';


export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agent } = useAuth();
  const draftKey = propertyDraftKey(agent?.id ?? 'anonymous', id);
  const draftEnabled = useRef(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftWarning, setDraftWarning] = useState('');
  const [property, setProperty] = useState<Property>();
  const [classifications, setClassifications] = useState<Classifications>({types:[],purposes:[],features:[]});
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, control, handleSubmit, reset, getValues, watch, formState: { errors, isSubmitting } } = useForm<PropertyValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: { title: '', type: '', purpose: '', postalCode:'', addressComplement:'', featureValues:[], status: 'DISPONIVEL', price: 0, condoFee: null, iptuFee: null, usableArea: 0, totalArea: 0, addressStreet: '', addressNumber: '', addressCity: '', addressState: 'MT', neighborhood: '', description: '', agentId: '' },
  });

  const {fields:featureFields,append:appendFeature,remove:removeFeature}=useFieldArray({control,name:'featureValues'});
  const load = useCallback(async () => {
    draftEnabled.current = false;
    setLoadError('');
    const draft = readPropertyDraft(sessionStorage, draftKey);
    setDraftRestored(!!draft);
    setDraftWarning('');
    try { setClassifications(await api.classifications(true)); } catch(cause) { setLoadError(errorMessage(cause)); setLoading(false); return; }
    if (!id) {
      setProperty(undefined);
      if (draft) reset({ ...getValues(), ...draft });
      setLoading(false);
      draftEnabled.current = true;
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      const loaded = await api.getManagedProperty(id);
      setProperty(loaded);
      reset({ ...propertySchema.parse({ ...loaded, type:loaded.typeId??loaded.type, purpose:loaded.purposeId??loaded.purpose }), ...draft });
      draftEnabled.current = true;
    } catch (cause) {
      setLoadError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [id, reset, getValues, draftKey]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const subscription = watch(() => {
      if (!draftEnabled.current) return;
      const result = writePropertyDraft(sessionStorage, draftKey, getValues());
      if (result === 'quota') setDraftWarning('Não foi possível salvar o rascunho: o armazenamento desta aba está cheio. Salve o imóvel para não perder as alterações.');
      if (result === 'too_large') setDraftWarning('Não foi possível salvar o rascunho: use no máximo 100 características com 500 caracteres por valor.');
      if (result === 'unavailable') setDraftWarning('O rascunho não pôde ser salvo nesta aba. Continue editando e salve o imóvel.');
    });
    return () => subscription.unsubscribe();
  }, [watch, draftKey, getValues]);

  useEffect(() => {
    if (agent?.role !== 'ADMIN') return;
    let active = true;
    void (async () => {
      try {
        const list: Agent[] = [];
        let page = 1;
        let total = 1;
        do {
          const result = await api.listAgents(page, 100);
          list.push(...result.items);
          total = result.totalPages;
          page++;
        } while (page <= total);
        if (active) setAgents(list);
      } catch (cause) {
        if (active) setError(`Não foi possível carregar os corretores. ${errorMessage(cause)}`);
      }
    })();
    return () => { active = false; };
  }, [agent?.role]);

  const textField = (name: 'title' | 'addressStreet' | 'addressNumber' | 'addressCity' | 'neighborhood' | 'postalCode' | 'addressComplement', label: string) => (
    <label>{label}<input {...register(name)} aria-invalid={!!errors[name]} />{errors[name] && <span className={errorText}>{errors[name]?.message}</span>}</label>
  );
  const numberField = (name: 'price' | 'condoFee' | 'iptuFee' | 'usableArea' | 'totalArea', label: string, optional = false) => (
    <label>{label}<input type="number" min={name.includes('Area') ? '0.01' : '0'} step="0.01" {...register(name, { setValueAs: (value: string) => optional && value === '' ? null : value === '' ? NaN : Number(value) })} aria-invalid={!!errors[name]} />{errors[name] && <span className={errorText}>{errors[name]?.message}</span>}</label>
  );

  async function save(values: PropertyValues) {
    setError('');
    setSuccess('');
    const { agentId, ...fields } = values;
    try {
      const saved = await api.saveProperty({ ...fields, features: {}, ...(agent?.role === 'ADMIN' ? { agentId: agentId || agent.id } : {}) }, id, property);
      draftEnabled.current = false;
      clearPropertyDraft(sessionStorage, draftKey);
      setDraftRestored(false);
      setDraftWarning('');
      reset(propertySchema.parse({ ...saved, type:saved.typeId??saved.type, purpose:saved.purposeId??saved.purpose }));
      draftEnabled.current = true;
      setProperty(saved);
      setSuccess('Imóvel salvo. Você pode gerenciar as fotos e os vídeos abaixo.');
      if (!id) navigate(`/admin/imoveis/${saved.id}/editar`, { replace: true });
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }

  return <>
    <header className="mb-8 flex flex-wrap items-center justify-between gap-5 max-[560px]:flex-col max-[560px]:items-stretch max-[560px]:[&_.button]:w-full">
      <div>
        <Link to="/admin/imoveis" className="inline-flex min-h-11 items-center">← Imóveis</Link>
        <h1 className="my-2 text-[clamp(26px,3vw,38px)] text-ink">{id ? 'Editar imóvel' : 'Um novo espaço.'}</h1>
        <p className="muted">Conte o que torna este imóvel uma boa oportunidade.</p>
      </div>
      {property && <Link to={propertyUrl(property.slug)} className="buttonSecondary">Ver no site ↗</Link>}
    </header>
    <AsyncState loading={loading} error={loadError} retry={() => void load()} />
    {property && agent?.role !== 'ADMIN' && agent?.id !== property.agentId ? <PropertyReadOnly property={property}/> : !loading && !loadError && <>
      <form className={formField} onSubmit={handleSubmit(save)} noValidate>
        {draftRestored && <p className="rounded bg-[#eaf0e8] p-3.5 text-[#174d3b] dark:bg-white/10 dark:text-white" role="status">Seu rascunho foi restaurado nesta aba. Revise os dados antes de salvar.</p>}
        {draftWarning && <p className="error" role="alert">{draftWarning}</p>}
        <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7">
          <h2 className="mb-6 mt-0 text-[22px] text-ink">01. Apresentação</h2>
          <div className="grid grid-cols-1 gap-[22px] md:grid-cols-2">
            <div className="col-span-full">{textField('title', 'Título do anúncio *')}</div>
            <label>Tipo de imóvel *<select {...register('type')} aria-invalid={!!errors.type}><option value="">Selecione</option>{classifications.types.filter(v=>v.ativo||v.id===property?.typeId).map(v=><option key={v.id} value={v.id}>{v.nome}{!v.ativo?" (inativo)":""}</option>)}</select></label>
            <label>Finalidade *<select {...register('purpose')} aria-invalid={!!errors.purpose}><option value="">Selecione</option>{classifications.purposes.filter(v=>v.ativo||v.id===property?.purposeId).map(v=><option key={v.id} value={v.id}>{v.nome}{!v.ativo?" (inativo)":""}</option>)}</select></label>
            <label>Status *<select {...register('status')}>{Object.entries(propertyStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            {agent?.role === 'ADMIN' && <label>Corretor responsável<select {...register('agentId')}><option value="">Minha conta</option>{agents.filter((item) => item.active || item.id === property?.agentId).map((item) => <option key={item.id} value={item.id}>{item.name}{!item.active ? ' (inativo)' : ''}</option>)}</select></label>}
            <label className="col-span-full">Descrição *<textarea rows={6} {...register('description')} aria-invalid={!!errors.description} />{errors.description && <span className={errorText}>{errors.description.message}</span>}</label>
          </div>
        </section>
        <div className="error" role="alert">{errors.type?.message} {errors.purpose?.message}</div>
        <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7">
          <h2 className="mb-6 mt-0 text-[22px] text-ink">02. Valores e dimensões</h2>
          <div className="grid grid-cols-1 gap-[22px] md:grid-cols-2">
            {numberField('price', 'Preço de venda ou aluguel mensal (R$) *')}
            {numberField('condoFee', 'Condomínio mensal (R$)', true)}
            {numberField('iptuFee', 'IPTU (R$)', true)}
            {numberField('usableArea', 'Área útil (m²) *')}
            {numberField('totalArea', 'Área total (m²) *')}
          </div>
        </section>
        <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7">
          <h2 className="mb-6 mt-0 text-[22px] text-ink">03. Localização</h2>
          <div className="grid grid-cols-1 gap-[22px] md:grid-cols-2">
            {textField('postalCode', 'CEP')}{textField('addressComplement', 'Complemento')}{textField('addressStreet', 'Rua / avenida *')}
            {textField('addressNumber', 'Número *')}
            {textField('neighborhood', 'Bairro *')}
            {textField('addressCity', 'Cidade *')}
            <label>Estado *<select {...register('addressState')}>{states.map((state) => <option key={state}>{state}</option>)}</select></label>
          </div>
        </section>
        <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7">
          <h2 className="mb-6 mt-0 text-[22px] text-ink">04. Características</h2>
          <p className="muted">Selecione as características cadastradas e informe seus valores.</p>
          {featureFields.map((field,index)=><div key={field.id} className="my-3 grid gap-3 md:grid-cols-3"><label>Característica<select {...register(`featureValues.${index}.caracteristica_id`)}><option value="">Selecione</option>{classifications.features.filter(v=>v.ativo).map(v=><option key={v.id} value={v.id}>{v.nome}</option>)}</select></label><label>Valor<input {...register(`featureValues.${index}.valor`)} maxLength={500}/></label><button type="button" className="buttonGhost" onClick={()=>removeFeature(index)}>Remover característica</button></div>)}
          {errors.featureValues&&<p className="error">Revise as características: selecione cada uma apenas uma vez e use até 500 caracteres no valor.</p>}
          <button type="button" className="buttonSecondary" disabled={featureFields.length>=100} onClick={()=>appendFeature({caracteristica_id:'',valor:''})}>Adicionar característica</button>
        </section>
        {error && <p className="error" role="alert">{error}</p>}
        {success && <p className="rounded bg-[#eaf0e8] p-3.5 text-[#174d3b] dark:bg-white/10 dark:text-white" role="status">{success}</p>}
        <div className="my-7 flex flex-wrap items-center gap-3.5 max-[560px]:[&_.button]:w-full">
          <button className="button" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Salvar imóvel'}</button>
          <Link to="/admin/imoveis" className="buttonGhost">Voltar</Link>
        </div>
      </form>
      {property ? (
        <MediaManager property={property} onChange={async () => { setProperty(await api.getManagedProperty(property.id)); }} />
      ) : (
        <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7">
          <h2 className="mb-6 mt-0 text-[22px] text-ink">05. Fotos e vídeos</h2>
          <p className="muted">Salve o imóvel para adicionar fotos e vídeos.</p>
        </section>
      )}
    </>}
  </>;
}
