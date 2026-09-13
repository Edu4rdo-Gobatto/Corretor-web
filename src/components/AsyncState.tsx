import { LoaderCircle, CircleAlert } from 'lucide-react';
import styles from './Shared.module.css';
export default function AsyncState({ loading, error, retry, skeleton }: { loading: boolean; error?: string; retry?: () => void; skeleton?: 'cards' | 'detail' }) {
  if (loading) {
    if (skeleton === 'cards') return <div className={styles.skeletonGrid} role="status" aria-label="Carregando imóveis">{[0, 1, 2, 3, 4, 5].map(item => <div key={item} className={styles.skeletonCard}><span/><span/></div>)}</div>;
    if (skeleton === 'detail') return <div className={styles.skeletonDetail} role="status" aria-label="Carregando imóvel"><span/><span/><span/></div>;
    return <div className={styles.state} role="status"><LoaderCircle aria-hidden="true"/><p>Carregando…</p></div>;
  }
  if (error) return <div className={styles.state} role="alert"><CircleAlert aria-hidden="true"/><p>{error}</p>{retry && <button className="buttonSecondary" onClick={retry}>Tentar novamente</button>}</div>;
  return null;
}
