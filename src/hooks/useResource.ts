import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../services/format';
export function useResource<T>(fetchResource: () => Promise<T>) {
  const [value, setValue] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision(current => current + 1), []);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    fetchResource().then(result => { if (active) setValue(result); }).catch(reason => { if (active) setError(errorMessage(reason)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [fetchResource, revision]);
  return { value, loading, error, retry };
}
