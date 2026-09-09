let seq = Date.now() % 1e9;

export function makeId(prefix = '') {
  seq += 1;
  return `${prefix}${seq}`;
}
