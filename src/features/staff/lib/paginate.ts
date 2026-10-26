import type { Paginated } from '../types';

export const PAGE_SIZE = 10;

export async function fetchAllPages<T>(
  load: (page: number, pageSize: number) => Promise<Paginated<T>>,
): Promise<T[]> {
  const first = await load(1, PAGE_SIZE);
  const rows = [...first.data];
  const pages = Math.max(1, Math.ceil(first.meta.total / first.meta.pageSize));
  for (let page = 2; page <= pages; page += 1) {
    rows.push(...(await load(page, PAGE_SIZE)).data);
  }
  return rows;
}
