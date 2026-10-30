export type RecordItem = {
  id: string;
  section: string;
  values: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};
export const recordsKey = (profileId: string) => `ia-curriculum:records:${profileId}:v1`;
export function loadRecords(profileId: string, section: string): RecordItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const all = loadAllRecords(profileId);
    return all.filter((item) => item.section === section);
  } catch {
    return [];
  }
}
export function saveRecord(profileId: string, record: RecordItem): void {
  const all = loadAllRecords(profileId).filter((item) => item.id !== record.id);
  localStorage.setItem(recordsKey(profileId), JSON.stringify([...all, record]));
}
export function deleteRecord(profileId: string, recordId: string): void {
  localStorage.setItem(
    recordsKey(profileId),
    JSON.stringify(loadAllRecords(profileId).filter((item) => item.id !== recordId)),
  );
}
function loadAllRecords(profileId: string): RecordItem[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(recordsKey(profileId)) ?? '[]');
    return Array.isArray(value) ? value.filter(isRecordItem) : [];
  } catch {
    return [];
  }
}
function isRecordItem(value: unknown): value is RecordItem {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<RecordItem>;
  if (
    typeof record.id !== 'string' ||
    typeof record.section !== 'string' ||
    !record.values ||
    typeof record.values !== 'object' ||
    Array.isArray(record.values) ||
    typeof record.createdAt !== 'string' ||
    typeof record.updatedAt !== 'string'
  ) {
    return false;
  }
  return Object.values(record.values).every((item) => typeof item === 'string');
}
export function createRecord(section: string, values: Record<string, string>): RecordItem {
  const now = new Date().toISOString();
  return {
    id: `record-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    section,
    values,
    createdAt: now,
    updatedAt: now,
  };
}
