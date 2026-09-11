import { LoaderCircle, CircleAlert } from 'lucide-react';
import styles from './Shared.module.css';
export default function AsyncState({ loading, error, retry }: { loading: boolean; error?: string; retry?: () => void }) {
  if (loading) return <div className={styles.state} role="status"><LoaderCircle aria-hidden="true"/><p>Carregando…</p></div>;
  if (error) return <div className={styles.state} role="alert"><CircleAlert aria-hidden="true"/><p>{error}</p>{retry && <button className="buttonSecondary" onClick={retry}>Tentar novamente</button>}</div>;
  return null;
}
