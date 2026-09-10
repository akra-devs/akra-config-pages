export const BASE = 'https://akra.kr/akra-config-pages/apps/key-ddal/experience/';
export const STORE = 'https://play.google.com/store/apps/details?id=kr.akra.keyddal';
export function decodeCode(raw, catalog) {
  if (typeof raw !== 'string' || raw.length > 320) throw Error('Invalid code');
  const fields = raw.trim().split('|');
  if (fields.length !== 4 || fields[0] !== 'KD1' || fields.slice(1).some(id => !/^[a-z][a-z0-9_.]{1,95}$/.test(id)) || new Set(fields.slice(1)).size !== 3) throw Error('Invalid code');
  const kinds = ['keycap','switchUnit','spring'];
  if (fields.slice(1).some((id,i) => !Object.hasOwn(catalog,id) || catalog[id].kind !== kinds[i])) throw Error('Unknown parts');
  return {code: fields.join('|'), ids: fields.slice(1)};
}
export function decodeLocation(search, hash, catalog) {
  if (search !== '' && !/^\?variant=(sound|visual)$/.test(search)) throw Error('Invalid campaign');
  if (hash.length > 1100 || !/^#code=[^&#?\s]+$/.test(hash)) throw Error('Invalid link');
  const encoded = hash.slice(6), raw = decodeURIComponent(encoded);
  if (encodeURIComponent(raw) !== encoded) throw Error('Noncanonical link');
  const decoded=decodeCode(raw,catalog);
  if(decoded.code!==raw) throw Error('Noncanonical code in link');
  return {...decoded, variant: search ? search.slice(9) : null};
}
export function appLink(code, catalog) { return `keyddal://experience?code=${encodeURIComponent(decodeCode(code,catalog).code)}`; }
