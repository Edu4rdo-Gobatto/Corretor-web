type Propriedades = { ativo: boolean; ocupado?: boolean; aoAlternar: () => void };

/** Interruptor de publicação: o estado vale na hora, sem depender de salvar o formulário. */
export default function InterruptorSite({ ativo, ocupado = false, aoAlternar }: Propriedades) {
  return (
    <button type="button" role="switch" aria-checked={ativo} aria-busy={ocupado} aria-describedby="interruptor-site-dica" disabled={ocupado} className="interruptor-site" onClick={aoAlternar}>
      <span className="interruptor-trilho" aria-hidden="true"><span className="interruptor-bola" /></span>
      <span className="interruptor-texto">
        <strong>Exibir no site</strong>
        <small id="interruptor-site-dica">{ativo
          ? 'Desmarcado, o anúncio sai do site e o imóvel fica arquivado. Histórico e mídias são preservados.'
          : 'O anúncio está fora do site e o imóvel está arquivado. Histórico e mídias são preservados.'}</small>
      </span>
    </button>
  );
}
