import WebSocket from 'ws';
import fs from 'fs';
import { spawn } from 'child_process';

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const cookieToken = fs.readFileSync('/tmp/pm-session.tok','utf8').trim();
const outDir = '/Users/markusholzhauser/Development/Processminer2/public/onepager-assets';
const PORT   = 9242;

const userDir = `/tmp/pm-chrome-comp`;
fs.rmSync(userDir, {recursive:true, force:true});
const proc = spawn(CHROME, ['--headless=new','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${PORT}`,`--user-data-dir=${userDir}`,'--window-size=1440,900','about:blank'], {detached:true, stdio:'ignore'});

for (let i=0;i<40;i++){
  try { const r = await fetch(`http://localhost:${PORT}/json`); const d = await r.json(); if (d.length) break; } catch(e){}
  await new Promise(r=>setTimeout(r,200));
}
const list = await (await fetch(`http://localhost:${PORT}/json`)).json();
const target = list.find(t=>t.type==='page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id=0; const pending=new Map();
const send = (m,p={}) => new Promise((res,rej)=>{const _id=++id; pending.set(_id,{res,rej}); ws.send(JSON.stringify({id:_id,method:m,params:p}));});
ws.on('message',(d)=>{const m=JSON.parse(d.toString()); if(m.id&&pending.has(m.id)){const{res,rej}=pending.get(m.id);pending.delete(m.id);m.error?rej(new Error(JSON.stringify(m.error))):res(m.result);}});
await new Promise(r=>ws.once('open',r));

await send('Page.enable');await send('Network.enable');await send('Runtime.enable');
await send('Network.setCookie',{name:'pm_session',value:cookieToken,domain:'localhost',path:'/',httpOnly:true,secure:false});

const evalP = (e) => send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true}).then(r=>r.result?.value);

await send('Page.navigate',{url:'http://localhost:3000/'});
await new Promise(r=>setTimeout(r,3500));
await evalP(`(async () => { for (let i=0;i<8;i++) { const s=[...document.querySelectorAll('button')].find(b=>/Skip tour|Got it|Done/i.test(b.textContent||'')); if (!s) break; s.click(); await new Promise(r=>setTimeout(r,300)); } return true; })()`);
// Click Bank Guarantee Issuance
await evalP(`(async () => { const el=[...document.querySelectorAll('button, a, [role=button]')].find(b=>/Bank Guarantee Issuance/i.test(b.textContent||'') && !/(Test|Dogfood)/i.test(b.textContent||'')); if(el)el.click(); await new Promise(r=>setTimeout(r,2500)); return location.href; })()`);
await evalP(`(async () => { for (let i=0;i<8;i++) { const s=[...document.querySelectorAll('button')].find(b=>/Skip tour|Got it|Done/i.test(b.textContent||'')); if (!s) break; s.click(); await new Promise(r=>setTimeout(r,300)); } return true; })()`);

// Click Client Experience area (3) — then Competitor CX subsection
await evalP(`(async () => { 
  const cx = [...document.querySelectorAll('button, a, [role=button]')].find(b => /Client Experience|^\\s*3\\s+/i.test(b.textContent||''));
  if (cx) cx.click(); await new Promise(r=>setTimeout(r,2000));
  return location.href;
})()`);
await new Promise(r=>setTimeout(r,1500));
const navItems = await evalP(`[...document.querySelectorAll('button, a')].map(el=>el.textContent?.trim().slice(0,40)).filter(t=>t).slice(0,40)`);
console.log('nav after CX:', JSON.stringify(navItems));

const r = await evalP(`(async () => {
  const link = [...document.querySelectorAll('button, a, [role=button]')].find(b => /Competitor CX|Competitors/i.test(b.textContent||''));
  if (link) { link.click(); await new Promise(r=>setTimeout(r,2500)); return {ok:true, url:location.href}; }
  return {ok:false};
})()`);
console.log('click competitor:', r);
await new Promise(r=>setTimeout(r,1000));
// dismiss tour again
await evalP(`(async () => { for (let i=0;i<8;i++) { const s=[...document.querySelectorAll('button')].find(b=>/Skip tour|Got it|Done/i.test(b.textContent||'')); if (!s) break; s.click(); await new Promise(r=>setTimeout(r,300)); } return true; })()`);

const shot = await send('Page.captureScreenshot',{format:'png'});
fs.writeFileSync(`${outDir}/05-competitor.png`, Buffer.from(shot.data,'base64'));
console.log('wrote 05-competitor.png', fs.statSync(`${outDir}/05-competitor.png`).size);
ws.close();
try{process.kill(proc.pid,'SIGTERM');}catch(e){}
