import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../services/format';
export function useResource<T>(fetchResource: () => Promise<T>, initialValue?: T) {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const [loading, setLoading] = useState(initialValue === undefined);
  const [error, setError] = useState('');
  const [errorStatus, setErrorStatus] = useState(0);
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision(current => current + 1), []);
  useEffect(() => {
    if (initialValue !== undefined && revision === 0) return;
    let active = true;
    setLoading(true); setError(''); setErrorStatus(0);
    fetchResource().then(result => { if (active) setValue(result); }).catch(reason => { if (active) { setError(errorMessage(reason)); setErrorStatus(reason?.status === 404 ? 404 : 503); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [fetchResource, revision, initialValue]);
  return { value, loading, error, errorStatus, retry };
}
