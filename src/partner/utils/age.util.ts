/**
 * Generates a deterministic, natural age in the 21–26 range
 * based on user id and name.
 */
export function getPartnerAge(identifier?: string, name?: string): number {
  const str = `${identifier || ''}_${name || ''}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return 21 + (Math.abs(hash) % 6);
}
