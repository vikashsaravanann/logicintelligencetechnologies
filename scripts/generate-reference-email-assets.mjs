/** Original vector artwork rasterized for HTML email; regenerate with Node.js. */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'public/email-assets/reference');
await fs.mkdir(target, { recursive: true });
const svg = (body, bg = '#FFFFFF') => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 600 300"><rect width="600" height="300" fill="${bg}"/>${body}</svg>`;
const smile = (x, y, size = 1, ink = '#665014') => `<g transform="translate(${x} ${y}) scale(${size})" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"><path d="M-18 -5q5 10 10 0m16 0q5 10 10 0"/><path d="M-28 13q28 20 56 0"/></g>`;
const sparkle = (x, y, s = 1, c = '#FFFFFF') => `<path d="M${x} ${y-14*s}q0 ${14*s} ${14*s} ${14*s}q-${14*s} 0 -${14*s} ${14*s}q0 -${14*s} -${14*s} -${14*s}q${14*s} 0 ${14*s} -${14*s}" fill="${c}"/>`;
const cloud = (x, y, s=1, c='#BDE2FA') => `<path d="M${x-45*s} ${y}a${20*s} ${20*s} 0 0 1 ${20*s} -${27*s}a${29*s} ${29*s} 0 0 1 ${54*s} ${2*s}a${20*s} ${20*s} 0 0 1 ${10*s} ${40*s}h-${68*s}a${13*s} ${13*s} 0 0 1 -${16*s} -${15*s}" fill="${c}"/>`;
const waves = `<path d="M0 245Q160 170 300 232T600 230V300H0" fill="#FFE35B"/><path d="M0 282Q180 212 340 277T600 270V300H0" fill="#FFFDF8"/>`;
const art = {
  verification: svg(`<path d="M0 190Q250 55 600 160V300H0" fill="#FFD000"/><circle cx="430" cy="130" r="70" fill="#FF8424"/>${smile(430,126,1.3)}${sparkle(228,92,1.1)}${sparkle(304,151,.7,'#FFEFA4')}<path d="M0 285Q235 160 600 278V300H0" fill="#FAF7F2"/>`, '#FFE65C'),
  welcome: svg(`<circle cx="300" cy="262" r="228" fill="#FFD400"/><path d="M126 300Q100 220 160 119Q104 214 174 300" fill="#F0BC08"/>${smile(300,132,1.65)}${sparkle(93,94,.9,'#FFE5B1')}${sparkle(505,165,.65,'#FFE5B1')}`, '#FF710B'),
  campaign: svg(`<path d="M0 75Q250 0 600 65V300H0" fill="#EF6500"/><ellipse cx="315" cy="300" rx="370" ry="235" fill="#FFD400"/>${smile(270,142,1.6,'#E79B0C')}<path d="M0 270q25-30 54-3q29-32 60-1q30-30 61 4q29-28 60 4q31-29 62 0q31-27 61 0q32-33 64-3q30-35 64-2q32-39 60-7q30-31 54 2v36H0" fill="#FFFFFF"/>`, '#FF710B'),
  night: svg(`<ellipse cx="290" cy="275" rx="265" ry="146" fill="#28205A"/><path d="M356 47a103 103 0 1 0 85 151a99 99 0 0 1-85-151" fill="#9960BC"/>${sparkle(356,126,.7,'#FFD75C')}${sparkle(177,85,.48,'#B995E0')}${sparkle(448,58,.35,'#B995E0')}<path d="M0 300v-40q38-42 76-4q31-49 83-9q53-56 99 8q64-57 113 0q43-66 100-12q65-25 129 15v42" fill="#17153D"/>`, '#17153D'),
  onboarding: svg(`${cloud(134,72,.85)}${cloud(481,123,1.35)}<path d="M0 226Q80 194 168 236Q310 279 414 232T600 242V300H0" fill="#FBF8F3"/><ellipse cx="300" cy="276" rx="102" ry="12" fill="#E9E3D9"/><rect x="213" y="150" width="174" height="113" rx="20" fill="#F88624"/><rect x="225" y="161" width="150" height="88" rx="11" fill="#FFE385"/>${smile(300,196,1.1)}<path d="M201 257h198l-15 17H215z" fill="#48566C"/>${sparkle(424,190,.65)}${sparkle(185,120,.55)}`, '#7ABAE9'),
  workspace: svg(`<circle cx="300" cy="150" r="111" fill="#FFD400"/><rect x="224" y="94" width="152" height="112" rx="17" fill="#FFFFFF"/><path d="M224 119h152" stroke="#F3E8CF" stroke-width="4"/><circle cx="240" cy="107" r="3" fill="#FF8225"/><circle cx="251" cy="107" r="3" fill="#FFD400"/><path d="M247 144h37m-37 16h62m-62 16h49" stroke="#C0CBD4" stroke-width="5" stroke-linecap="round"/><circle cx="360" cy="207" r="32" fill="#FF8424"/><path d="m346 207 10 10 19-24" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>${sparkle(155,116,.75)}${sparkle(443,183,.55)}${waves}`, '#FFF1AD'),
  milestone: svg(`<path d="M95 253Q185 257 225 175T414 113Q461 112 515 61" fill="none" stroke="#E3C546" stroke-width="12" stroke-linecap="round" stroke-dasharray="1 22"/><circle cx="265" cy="164" r="79" fill="#FFD400"/>${smile(265,167,1.1)}<path d="M404 67v147" stroke="#58616C" stroke-width="6" stroke-linecap="round"/><path d="M407 68h88l-22 26 22 24h-88" fill="#FF8424"/>${sparkle(146,109,.8)}${waves}`, '#FFF1AD'),
  payment: svg(`<circle cx="292" cy="148" r="116" fill="#FFD400"/><rect x="236" y="69" width="116" height="166" rx="12" fill="#FFFFFF"/><path d="M256 96h58m-58 18h36m-36 25h75m-75 19h75m-75 19h43" stroke="#DDD9CE" stroke-width="5" stroke-linecap="round"/><circle cx="351" cy="209" r="38" fill="#FF8424"/><path d="m334 208 12 12 23-28" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>${sparkle(143,128,.8)}${sparkle(449,80,.6)}${waves}`, '#FFF1AD'),
  support: svg(`<circle cx="300" cy="151" r="109" fill="#FFD400"/><path d="M220 167v-22a80 80 0 0 1 160 0v22" stroke="#6C7381" stroke-width="13" fill="none"/><rect x="207" y="145" width="28" height="60" rx="13" fill="#FF8424"/><rect x="365" y="145" width="28" height="60" rx="13" fill="#FF8424"/>${smile(300,163,1.3)}<path d="M379 197q0 34-56 34" fill="none" stroke="#6C7381" stroke-width="6" stroke-linecap="round"/><rect x="303" y="223" width="28" height="13" rx="6" fill="#6C7381"/>${sparkle(153,96,.7)}${sparkle(454,167,.55)}${waves}`, '#FFF1AD'),
  maintenance: svg(`<circle cx="300" cy="150" r="110" fill="#FFD400"/><path d="m300 69 71 28v50q0 61-71 94q-71-33-71-94V97z" fill="#FFFFFF"/><path d="m267 146 23 24 45-55" fill="none" stroke="#F88624" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>${sparkle(145,124,.85)}${sparkle(446,93,.65)}${waves}`, '#FFF1AD'),
};
for (const [name, source] of Object.entries(art)) {
  await fs.writeFile(path.join(target, `${name}.svg`), source);
  await sharp(Buffer.from(source)).png({ compressionLevel: 9, palette: true }).toFile(path.join(target, `${name}.png`));
}
const marks = {
  linkedin: '<path d="M3 8h4v13H3zm2-6a2.3 2.3 0 1 1 0 4.6A2.3 2.3 0 0 1 5 2m5 6h4v1.8c.8-1.3 2-2.1 3.8-2.1 3.5 0 4.2 2.2 4.2 5.5V21h-4v-7c0-1.7-.2-3.1-2-3.1-1.8 0-2 1.6-2 3V21h-4z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="17.6" cy="6.5" r="1.25"/>',
  x: '<path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-7.4L5.6 22H2.4l8.2-9.4L2 2h6.4l4.4 6.7zm-1.1 18h1.7L7.5 4H5.7z"/>',
  youtube: '<path d="M21.5 6.3a2.8 2.8 0 0 0-2-2C17.8 4 12 4 12 4s-5.8 0-7.5.3a2.8 2.8 0 0 0-2 2A30 30 0 0 0 2 12a30 30 0 0 0 .5 5.7 2.8 2.8 0 0 0 2 2C6.2 20 12 20 12 20s5.8 0 7.5-.3a2.8 2.8 0 0 0 2-2A30 30 0 0 0 22 12a30 30 0 0 0-.5-5.7M10 15.5v-7l6 3.5z" fill-rule="evenodd"/>',
};
for (const [name, body] of Object.entries(marks)) for (const light of [false, true]) {
  const c = light ? '#F4F0FC' : '#393939';
  const source = `<svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" viewBox="0 0 24 24" color="${c}" fill="${c}">${body}</svg>`;
  await sharp(Buffer.from(source)).png().toFile(path.join(target, `social-${name}${light ? '-light' : ''}.png`));
}
console.log(`Generated ${Object.keys(art).length} original email illustrations and 8 social icons.`);
