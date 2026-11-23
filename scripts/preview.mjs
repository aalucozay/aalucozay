// Writes preview.html: the README as GitHub's profile column shows it, light and dark
// side by side. A small converter that covers only what this README uses.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const md = readFileSync(join(root, 'README.md'), 'utf8');

const inline = (s) => s
  .replace(/\[\*\*(.+?)\*\*\]\((.+?)\)/g, '<a href="$2"><strong>$1</strong></a>')
  .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

let html = '';
let list = false;
let raw = false;
for (const line of md.split('\n')) {
  if (/^<(picture|p)>/.test(line) || line.startsWith('<picture')) raw = true;
  if (raw) { html += line + '\n'; if (/^<\/(picture|p)>/.test(line)) raw = false; continue; }
  if (line.startsWith('- ')) { if (!list) { html += '<ul>'; list = true; } html += `<li>${inline(line.slice(2))}</li>`; continue; }
  if (list) { html += '</ul>'; list = false; }
  if (line.startsWith('## ')) html += `<h2>${line.slice(3)}</h2>`;
  else if (line.trim()) html += `<p>${inline(line)}</p>`;
}
if (list) html += '</ul>';

// Each pane forces its own colour scheme so the <picture> sources switch inside it.
const pane = (scheme) => `<iframe title="${scheme}" srcdoc="${`<!doctype html><meta name=color-scheme content=${scheme}><base href='file://${root}/'><style>
body{margin:0;padding:24px;background:${scheme === 'dark' ? '#0d1117' : '#fff'};color:${scheme === 'dark' ? '#e6edf3' : '#1f2328'};font:16px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}
a{color:${scheme === 'dark' ? '#4493f8' : '#0969da'};text-decoration:none}h2{font-size:1.5em;font-weight:600;border-bottom:1px solid ${scheme === 'dark' ? '#3d444d' : '#d1d9e0'};padding-bottom:.3em;margin:24px 0 16px}
img{max-width:100%}ul{padding-left:2em}li+li{margin-top:.25em}</style>${scheme === "dark" ? html.replace(/-light\.svg/g, "-dark.svg") : html}`.replace(/"/g, '&quot;')}"></iframe>`;

writeFileSync(join(root, 'preview.html'), `<!doctype html><title>Profile preview</title><style>
body{margin:0;display:flex;gap:16px;padding:16px;background:#888}iframe{width:830px;height:1700px;border:0;flex:none}</style>
${pane('light')}${pane('dark')}`);
console.log('wrote preview.html');
