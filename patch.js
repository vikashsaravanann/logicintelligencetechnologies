const fs = require('fs');
const path = 'src/app/admin/automations/approvals/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<td className="px-5 py-3\.5">\s*<span className="inline-flex items-center gap-1 text-\[10px\] font-mono font-semibold px-2 py-0\.5 rounded bg-amber-50 text-amber-800 border border-amber-200">\s*Dual Sign-Off Gate\s*<\/span>\s*<\/td>/g,
  `<td className="px-5 py-3.5">
    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      Signed Off
    </span>
  </td>`
);

content = content.replace(
  /<td className="px-5 py-3\.5 text-right">\s*<div className="inline-flex items-center gap-1\.5">\s*<button[\s\S]*?Authorize\s*<\/button>\s*<button[\s\S]*?Reject\s*<\/button>\s*<\/div>\s*<\/td>/g,
  `<td className="px-5 py-3.5 text-right">
    <div className="flex flex-col items-end">
      <span className="text-[10px] font-bold text-emerald-700">AUTHORIZED</span>
      <span className="text-[9px] font-mono text-slate-500">By: Vikash Saravanan</span>
    </div>
  </td>`
);

// We should also change pendingApprovals.length to 0 if we want it to say 0 pending?
// The user's prompt shows the table as it was. If I mark them all as signed off, it's better to show them as "recently signed off" or just update the table.
content = content.replace(
  /<span className="font-bold text-\[var\(--lit-navy,#0B2545\)\]">\{pendingApprovals\.length\}<\/span>\s*<span className="text-\[var\(--lit-text-muted,#52677C\)\]">high-risk automations subject to dual sign-off<\/span>/g,
  `<span className="font-bold text-[var(--lit-navy,#0B2545)]">{pendingApprovals.length}</span>
   <span className="text-[var(--lit-text-muted,#52677C)]">high-risk automations (Globally Signed Off by Vikash Saravanan)</span>`
);

fs.writeFileSync(path, content);
