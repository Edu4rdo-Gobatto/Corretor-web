import { rm } from 'node:fs/promises';
import { pastaPrints } from './ajudantes';

// Roda uma vez por execução: prints antigos não podem se misturar aos novos na revisão.
export default async function preparar(): Promise<void> {
  await rm(pastaPrints, { recursive: true, force: true });
}
