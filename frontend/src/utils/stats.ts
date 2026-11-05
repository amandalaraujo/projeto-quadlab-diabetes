/** Pequenos agregados usados nas interpretações dos gráficos. */

export const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

/** Item com o maior valor de `value` (undefined se a lista estiver vazia). */
export function maxBy<T>(items: T[], value: (item: T) => number): T | undefined {
  return items.reduce<T | undefined>((best, item) => (best === undefined || value(item) > value(best) ? item : best), undefined);
}

export function minBy<T>(items: T[], value: (item: T) => number): T | undefined {
  return maxBy(items, (item) => -value(item));
}

/** Pares [x, y] de um traço do Plotly (x categórico, y numérico). */
export function points(trace: { x?: Array<string | number>; y?: number[] } | undefined) {
  return (trace?.x ?? []).map((x, i) => ({ x: String(x), y: trace?.y?.[i] ?? 0 }));
}
