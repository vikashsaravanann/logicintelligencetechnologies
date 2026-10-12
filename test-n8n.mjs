import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [k, ...v] = line.split('=');
  if (k && v.length) acc[k.trim()] = v.join('=').trim().replace(/^"|"$|^'|'$/g, '');
  return acc;
}, {});
const base = env.N8N_BASE_URL;
const key = env.N8N_API_KEY;

const res = await fetch(base + '/api/v1/workflows?limit=250', { headers: { 'X-N8N-API-KEY': key } });
const data = await res.json();
const wfs = data.data || [];
console.log('Total:', wfs.length);
const inactive = wfs.filter(w => !w.active);
console.log('Inactive count:', inactive.length);

for (const wf of inactive) {
  console.log(`Activating ${wf.name}...`);
  const actRes = await fetch(`${base}/api/v1/workflows/${wf.id}/activate`, {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': key }
  });
  if (actRes.ok) console.log('  Success');
  else console.log('  Failed', await actRes.text());
}
