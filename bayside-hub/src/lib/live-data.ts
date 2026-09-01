export function preferLiveData<T>(live: T[], fallback: T[]): T[] {
  return live.length > 0 ? live : fallback;
}

export function normalizeRecordId(id: string | number): string {
  return String(id);
}
