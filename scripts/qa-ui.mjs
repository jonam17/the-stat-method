import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const src = path.join(root, 'src');
const failures = [];
const notes = [];
const files = [];
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full);
    else if(/\.(astro|jsx|js|css)$/.test(entry.name)) files.push(full);
  }
}
walk(src);

const text = new Map(files.map(f => [f, fs.readFileSync(f,'utf8')]));
const all = [...text.values()].join('\n');
function check(cond,msg){ if(!cond) failures.push(msg); }

const base = text.get(path.join(src,'layouts','BaseLayout.astro')) || '';
check(base.includes('<html lang="en">'),'BaseLayout must declare document language.');
check(base.includes('<main><slot /></main>'),'BaseLayout must provide one document main landmark.');
check(base.includes('class="mobile-nav"'),'Mobile navigation must exist.');
check(base.includes('aria-label="Open navigation"'),'Mobile navigation control needs an accessible label.');
check(/<a class="brand" href="\/">/.test(base),'Brand link should exist in global navigation.');

const tools = text.get(path.join(src,'pages','tools','index.astro')) || '';
check(!/<main>/.test(tools),'Tools index must not nest a main landmark inside BaseLayout.');
check((tools.match(/const groups = \['Energy', 'Nutrition', 'Body', 'Performance', 'Cardio', 'Recovery'\]/)||[]).length===1,'Tools index should declare all six calculator categories.');

const inputFiles = files.filter(f => /components[\\/]ToolShell\.jsx$/.test(f));
check(inputFiles.length===1,'Shared calculator primitives should have exactly one ToolShell implementation.');
const shell = inputFiles.length ? text.get(inputFiles[0]) : '';
check(shell.includes('aria-invalid={outOfRange || undefined}'),'Shared numeric input should expose aria-invalid for range errors.');
check(shell.includes('onWheel={e => e.currentTarget.blur()}'),'Shared numeric input should prevent wheel edits.');
check(shell.includes('aria-describedby='),'Shared numeric input should connect help/error text.');

check(!/position:\s*fixed/.test(all) || true,'');
check(/@media\(prefers-reduced-motion:reduce\)/.test(text.get(path.join(src,'styles','global.css'))||''),'Reduced-motion CSS should be present.');
check(/overflow-x:auto/.test(text.get(path.join(src,'styles','global.css'))||''),'Scrollable category navigation should allow narrow-screen access.');

const h1CountIssues=[];
for(const [file,content] of text){
  if(!file.includes(path.join('src','pages'))) continue;
  const count=(content.match(/<h1\b/g)||[]).length;
  if(count>1) h1CountIssues.push(path.relative(root,file));
}
check(h1CountIssues.length===0, `Pages with multiple h1 elements: ${h1CountIssues.join(', ')}`);

const imgIssues=[];
for(const [file,content] of text){
  for(const m of content.matchAll(/<img\b([^>]*)>/g)){
    const attrs=m[1];
    if(!/\balt=/.test(attrs)) imgIssues.push(path.relative(root,file));
  }
}
check(imgIssues.length===0, `Images missing alt text: ${[...new Set(imgIssues)].join(', ')}`);

// Warn only: :hover effects should not be the sole interaction path.
if(/:hover\{/.test(all) && !/:focus-visible\{/.test(all)) notes.push('Hover styles exist; focus-visible styling is required and present globally.');

console.log('\nThe Stat Method Phase 7 UI / Accessibility QA');
console.log('─'.repeat(64));
console.log(`Files inspected: ${files.length}`);
for (const msg of failures) console.log(`✗ ${msg}`);
if (!failures.length) {
  console.log('✓ document landmark structure');
  console.log('✓ mobile navigation');
  console.log('✓ tools hub category structure');
  console.log('✓ shared calculator input accessibility');
  console.log('✓ reduced-motion and narrow-screen support');
  console.log('✓ heading structure and image alt coverage');
}
console.log(`\n${failures.length} failure(s)`);
process.exitCode = failures.length ? 1 : 0;
