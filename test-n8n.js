require('dotenv').config({ path: '.env.local' });
fetch(process.env.N8N_BASE_URL + '/api/v1/workflows?limit=250', {
  headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY }
}).then(r => r.json()).then(d => {
  const wfs = d.data || [];
  console.log('Total:', wfs.length);
  console.log('Active:', wfs.filter(w => w.active).length);
  console.log('Inactive:', wfs.filter(w => !w.active).length);
  
  // Activate inactive
  const inactive = wfs.filter(w => !w.active);
  console.log('Inactive workflows:', inactive.map(w => w.name).join(', '));
}).catch(console.error);
