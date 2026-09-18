const fs = require('fs');

let content = fs.readFileSync('src/app/api/admin/invoices/route.ts', 'utf8');

content = content.replace(
  `    await sendEmail({`,
  `    const emailResult = await sendEmail({`
);

content = content.replace(
  `    return NextResponse.json({ success: true, invoice });`,
  `    return NextResponse.json({ success: true, invoice, emailStatus: emailResult.status });`
);

fs.writeFileSync('src/app/api/admin/invoices/route.ts', content);
