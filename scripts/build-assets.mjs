// Builds every SVG in assets/ in a light (silver) and a dark (ink) variant.
// GitHub shows SVGs through <img>, which cannot fetch web fonts, so each file
// carries the Astoria faces as base64 @font-face. Run: node scripts/build-assets.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fontDir = join(root, 'fonts');
const out = join(root, 'assets');
mkdirSync(out, { recursive: true });

const font = (file, family, style = 'normal', weight = '100 900') =>
  `@font-face{font-family:'${family}';font-style:${style};font-weight:${weight};` +
  `src:url(data:font/woff2;base64,${readFileSync(join(fontDir, file)).toString('base64')}) format('woff2')}`;

const FONTS = {
  serif: font('libre-caslon-text-400-latin.woff2', 'Caslon', 'normal', '400'),
  sans: font('schibsted-grotesk-400-latin.woff2', 'Schibsted'),
  mono: font('martian-mono-400-latin.woff2', 'Martian'),
};

// Astoria tokens. Silver is the site as it ships; ink is its dark panel.
const THEMES = {
  light: { page: '#DCDEE1', lift: '#E6E8EA', text: '#15161A', body: '#43464C', faint: '#5C6067', gold: '#7A5E27', rule: '#B9BCC1' },
  dark:  { page: '#15161A', lift: '#1D1F24', text: '#DCDEE1', body: '#A9ADB3', faint: '#8A8E95', gold: '#C2A15D', rule: '#33363C' },
};

const svg = (w, h, fonts, css, body, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">` +
  `<style>${fonts.map((f) => FONTS[f]).join('')}` +
  `.serif{font-family:Caslon,Georgia,serif}.sans{font-family:Schibsted,Helvetica,sans-serif}.mono{font-family:Martian,Menlo,monospace}${css}</style>` +
  body + `</svg>`;

const write = (name, content) => writeFileSync(join(out, name), content);

// Names only: client domains stay off the profile on purpose.
const SHIPPED = ['Pamir Ventures', 'Hypogenica', 'Alabama Biolabs', 'Astoria Design'];

for (const [mode, t] of Object.entries(THEMES)) {
  // Banner: the name set large, the studio line under it, and a colophon of
  // shipped work on the right, the way a printed book lists its plates.
  const colophon = SHIPPED.map(
    (d, i) => `<text x="924" y="${170 + i * 34}" class="sans" font-size="17" fill="${t.body}">${d}</text>`,
  ).join('');
  write(`banner-${mode}.svg`, svg(1280, 360, ['serif', 'sans', 'mono'], '',
    `<rect width="1280" height="360" rx="14" fill="${t.page}"/>` +
    `<text x="80" y="92" class="mono" font-size="14" fill="${t.faint}">Astoria Design</text>` +
    `<text x="74" y="218" class="serif" font-size="128" fill="${t.text}" letter-spacing="-2">Abdullah</text>` +
    `<rect x="80" y="246" width="56" height="3" fill="${t.gold}"/>` +
    `<text x="80" y="292" class="sans" font-size="22" fill="${t.body}">Design and strategy for companies doing difficult science.</text>` +
    `<line x1="880" y1="84" x2="880" y2="296" stroke="${t.rule}" stroke-width="1"/>` +
    `<text x="924" y="118" class="sans" font-size="15" fill="${t.gold}">Shipped</text>` +
    colophon,
    'Abdullah. Astoria Design: design and strategy for companies doing difficult science.'));

  // Terminal line with a caret that blinks unless the reader asked for less motion.
  write(`tagline-${mode}.svg`, svg(1280, 64, ['mono'],
    `.caret{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}` +
    `@media (prefers-reduced-motion:reduce){.caret{animation:none}}`,
    `<text x="80" y="39" class="mono" font-size="17"><tspan fill="${t.gold}">~/astoria</tspan>` +
    `<tspan fill="${t.faint}">  $ </tspan><tspan fill="${t.text}">design --for deep-tech --for biotech</tspan></text>` +
    `<rect class="caret" x="664" y="24" width="10" height="20" fill="${t.gold}"/>`,
    'design --for deep-tech --for biotech'));

  // Link buttons: square cornered, outlined, so they sit with the type rather than shout.
  const button = (name, label, w, filled) =>
    write(`button-${name}-${mode}.svg`, svg(w, 48, ['sans'], '',
      `<rect x="0.5" y="0.5" width="${w - 1}" height="47" rx="4" fill="${filled ? t.text : 'none'}" stroke="${t.text}"/>` +
      `<text x="22" y="30" class="sans" font-size="16" font-weight="500" fill="${filled ? t.page : t.text}">${label}</text>` +
      `<path d="M${w - 32} 30 l8 -8 m-6 0 h6 v6" fill="none" stroke="${filled ? t.gold : t.gold}" stroke-width="1.6"/>`,
      label));
  button('site', 'astoriadesignlab.com', 236, true);
  button('contact', 'Start a project', 184, false);
}

// Work tiles for the highlight row. Lines come from each site's own description.
const WORK = [
  { slug: 'pamir', name: 'Pamir', kind: 'Venture fund', lines: ['First check for', 'technical pioneers'] },
  { slug: 'hypogenica', name: 'Hypogenica', kind: 'Materials', lines: ['Carbon negative', 'calcium carbonate'] },
  { slug: 'alabama', name: 'Alabama', kind: 'Biomanufacturing', lines: ['Biomanufacturing,', 'lab to market'] },
  { slug: 'astoria', name: 'Astoria', kind: 'Design studio', lines: ['The studio’s', 'own site'] },
];
for (const [mode, t] of Object.entries(THEMES)) {
  for (const w of WORK) {
    write(`work-${w.slug}-${mode}.svg`, svg(220, 176, ['serif', 'sans', 'mono'], '',
      `<rect x="0.5" y="0.5" width="219" height="175" rx="8" fill="${t.lift}" stroke="${t.rule}"/>` +
      `<text x="18" y="34" class="mono" font-size="11" fill="${t.faint}">${w.kind}</text>` +
      `<text x="17" y="82" class="serif" font-size="32" fill="${t.text}">${w.name}</text>` +
      `<rect x="18" y="98" width="26" height="2" fill="${t.gold}"/>` +
      w.lines.map((l, i) => `<text x="18" y="${132 + i * 22}" class="sans" font-size="17" fill="${t.body}">${l}</text>`).join(''),
      `${w.name}, ${w.kind}: ${w.lines.join(' ')}`));
  }
}
console.log('built assets');
