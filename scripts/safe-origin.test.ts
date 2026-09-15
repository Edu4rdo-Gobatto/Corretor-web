import { describe, expect, it } from 'vitest';
import { assertSafeLocalApiOrigin } from './safe-origin.mjs';

describe('local API origin guard', () => {
  it('accepts localhost and loopback origins', () => {
    expect(() => assertSafeLocalApiOrigin({ mode: 'development', apiOrigin: 'http://localhost:3000' })).not.toThrow();
    expect(() => assertSafeLocalApiOrigin({ mode: 'preview', apiOrigin: 'http://127.0.0.1:3000' })).not.toThrow();
  });
  it('rejects remote origins by default', () => {
    expect(() => assertSafeLocalApiOrigin({ mode: 'development', apiOrigin: 'https://api.example.com' })).toThrow(/API_ORIGIN local/i);
  });
  it('does not expose credentials in the error', () => {
    const secretOrigin = 'https://user:secret@production.example.com';
    expect(() => assertSafeLocalApiOrigin({ mode: 'preview', apiOrigin: secretOrigin })).toThrow(/API_ORIGIN local/i);
    expect(() => assertSafeLocalApiOrigin({ mode: 'preview', apiOrigin: secretOrigin })).not.toThrow(/secret/);
  });
});
