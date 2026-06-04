import WebSocket from 'ws';
import fs from 'fs';
import { spawn } from 'child_process';

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const cookieToken = fs.readFileSync('/tmp/pm-session.tok','utf8').trim();
const outDir = '/Users/markusholzhauser/Development/Processminer2/public/onepager-assets';

const userDir = `/tmp/pm-chrome-arch`;
fs.rmSync(userDir, {recursive:true, force:true});
const proc = spawn(CHROME, ['--headless=new','--disable-gpu','--hide-scrollbars','--remote-debugging-port=9230',`--user-data-dir=${userDir}`,'--window-size=1440,900','about:blank'], {detached:true, stdio:'ignore'});
for (let i=0;i<30;i++){ try { const r = await fetch('http://localhost:9230/json'); const d = await r.json(); if (d.length) break; } catch(e){} await new Promise(r=>setTimeout(r,200)); }
const list = await (await fetch('http://localhost:9230/json')).json();
const target = list.find(t=>t.type==='page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id=0; const pending=new Map(); const listeners=[];
const send = (m,p={}) => new Promise((res,rej)=>{const _id=++id; pending.set(_id,{res,rej}); ws.send(JSON.stringify({id:_id,method:m,params:p}));});
ws.on('message',(d)=>{const m=JSON.parse(d.toString()); if(m.id&&pending.has(m.id)){const{res,rej}=pending.get(m.id);pending.delete(m.id);m.error?rej(new Error(JSON.stringify(m.error))):res(m.result);} listeners.forEach(fn=>fn(m));});
await new Promise(r=>ws.once('open',r));
await send('Network.enable');await send('Page.enable');await send('Runtime.enable');
await send('Network.setCookie',{name:'pm_session',value:cookieToken,domain:'localhost',path:'/',httpOnly:true,secure:false});

const evalP = (e) => send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true}).then(r=>r.result?.value);

await send('Page.navigate',{url:'http://localhost:3000/'});
await new Promise(r=>setTimeout(r,3500));
// dismiss tour
await evalP(`(async () => { for (let i=0;i<8;i++) { const s=[...document.querySelectorAll('button')].find(b=>/Skip tour|Got it|Done/i.test(b.textContent||'')); if (!s) break; s.click(); await new Promise(r=>setTimeout(r,300)); } return true; })()`);
// click Sepa Payments
await evalP(`(async () => { const el = [...document.querySelectorAll('button, a, [role=button]')].find(b => /Sepa Payments/i.test(b.textContent || '')); if (el) el.click(); await new Promise(r=>setTimeout(r,2500)); return location.href; })()`);
await evalP(`(async () => { for (let i=0;i<8;i++) { const s=[...document.querySelectorAll('button')].find(b=>/Skip tour|Got it|Done/i.test(b.textContent||'')); if (!s) break; s.click(); await new Promise(r=>setTimeout(r,300)); } return true; })()`);
// click "Target Architecture" or "IT Architecture" in left nav
const navInfo = await evalP(`(async () => {
  const all = [...document.querySelectorAll('button, a, [role=button]')].map(el => el.textContent?.trim().slice(0,40)).filter(t=>t);
  return all.slice(0,40);
})()`);
console.log('nav items:', JSON.stringify(navInfo));
const clicked = await evalP(`(async () => {
  const el = [...document.querySelectorAll('button, a, [role=button]')].find(b => /Target Architecture/i.test(b.textContent || ''));
  if (el) { el.click(); await new Promise(r=>setTimeout(r,2000)); return {ok:true, url:location.href}; }
  return {ok:false};
})()`);
console.log('clicked target arch:', clicked);
// drill into a subsection
await evalP(`(async () => { for (let i=0;i<8;i++) { const s=[...document.querySelectorAll('button')].find(b=>/Skip tour|Got it|Done/i.test(b.textContent||'')); if (!s) break; s.click(); await new Promise(r=>setTimeout(r,300)); } return true; })()`);
await new Promise(r=>setTimeout(r,1500));
const shot = await send('Page.captureScreenshot',{format:'png'});
fs.writeFileSync(`${outDir}/04-target-arch.png`, Buffer.from(shot.data,'base64'));
console.log('04-target-arch ok', fs.statSync(`${outDir}/04-target-arch.png`).size);
ws.close();
try{process.kill(proc.pid,'SIGTERM');}catch(e){}
