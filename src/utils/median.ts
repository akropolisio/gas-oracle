import { percentiles } from './percentiles';

export function median(array: number[]): number {
  return percentiles(array, [50])[0];
}
