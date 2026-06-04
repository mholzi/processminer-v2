import WebSocket from 'ws';
import fs from 'fs';
import { spawn } from 'child_process';

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL    = 'http://localhost:3000/onepager-deck.html?print=1';
const OUT    = '/Users/markusholzhauser/Development/Processminer2/public/onepager-deck.pdf';
const PORT   = 9240;

const userDir = `/tmp/pm-chrome-pdf`;
fs.rmSync(userDir, {recursive:true, force:true});
const proc = spawn(CHROME, [
  '--headless=new','--disable-gpu','--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${userDir}`,
  '--window-size=1920,1080','about:blank'
], {detached:true, stdio:'ignore'});

for (let i=0;i<40;i++){
  try { const r = await fetch(`http://localhost:${PORT}/json`); const d = await r.json(); if (d.length) break; } catch(e){}
  await new Promise(r=>setTimeout(r,200));
}
const list = await (await fetch(`http://localhost:${PORT}/json`)).json();
const target = list.find(t=>t.type==='page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id=0; const pending=new Map(); const listeners=[];
const send = (m,p={}) => new Promise((res,rej)=>{const _id=++id; pending.set(_id,{res,rej}); ws.send(JSON.stringify({id:_id,method:m,params:p}));});
ws.on('message',(d)=>{const m=JSON.parse(d.toString()); if(m.id&&pending.has(m.id)){const{res,rej}=pending.get(m.id);pending.delete(m.id);m.error?rej(new Error(JSON.stringify(m.error))):res(m.result);} listeners.forEach(fn=>fn(m));});
await new Promise(r=>ws.once('open',r));

await send('Page.enable');
await send('Network.enable');
await send('Page.navigate', {url: URL});

// Wait for load
await new Promise((resolve)=>{
  const t = setTimeout(resolve, 8000);
  ws.on('message', (d) => {
    const m = JSON.parse(d.toString());
    if (m.method === 'Page.loadEventFired') { clearTimeout(t); resolve(); }
  });
});
// Extra wait for fonts + layout
await new Promise(r=>setTimeout(r,2000));

// 1920x1080 at 96 DPI → 20 x 11.25 inches
const pdf = await send('Page.printToPDF', {
  paperWidth: 20,
  paperHeight: 11.25,
  marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
  printBackground: true,
  preferCSSPageSize: false,
  displayHeaderFooter: false,
  landscape: false,
  pageRanges: '',
  scale: 1,
});
fs.writeFileSync(OUT, Buffer.from(pdf.data, 'base64'));
console.log(`wrote ${OUT}  (${fs.statSync(OUT).size} bytes)`);
ws.close();
try { process.kill(proc.pid, 'SIGTERM'); } catch(e){}
