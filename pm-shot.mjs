import WebSocket from 'ws';
import fs from 'fs';
import { spawn } from 'child_process';

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const cookieToken = fs.readFileSync('/tmp/pm-session.tok','utf8').trim();
const outDir = '/Users/markusholzhauser/Development/Processminer2/public/onepager-assets';

async function startChrome(port) {
  const userDir = `/tmp/pm-chrome-${port}`;
  fs.rmSync(userDir, {recursive:true, force:true});
  const proc = spawn(CHROME, [
    '--headless=new','--disable-gpu','--hide-scrollbars',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDir}`,
    '--window-size=1440,900','about:blank'
  ], {detached:true, stdio:'ignore'});
  for (let i=0;i<30;i++){
    try { const r = await fetch(`http://localhost:${port}/json`); const d = await r.json(); if (d.length) break; } catch(e){}
    await new Promise(r=>setTimeout(r,200));
  }
  const list = await (await fetch(`http://localhost:${port}/json`)).json();
  const target = list.find(t=>t.type==='page');
  return {proc, wsUrl: target.webSocketDebuggerUrl};
}

function openWs(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id=0; const pending=new Map(); const listeners = [];
  const send = (method, params={}) => new Promise((resolve,reject)=>{const _id=++id; pending.set(_id,{resolve,reject}); ws.send(JSON.stringify({id:_id,method,params}));});
  ws.on('message', (data)=>{
    const m = JSON.parse(data.toString());
    if (m.id && pending.has(m.id)){const {resolve,reject}=pending.get(m.id); pending.delete(m.id); m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result);}
    listeners.forEach(fn=>fn(m));
  });
  const onEvent = (fn) => { listeners.push(fn); return () => { const i=listeners.indexOf(fn); if (i>=0) listeners.splice(i,1); }; };
  return { ws, send, onEvent };
}

async function waitForLoad(send, onEvent, timeoutMs=10000) {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, timeoutMs);
    const off = onEvent((m) => { if (m.method==='Page.loadEventFired') { clearTimeout(t); off(); resolve(); } });
  });
}

async function evalInPage(send, expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  return r.result?.value;
}

async function main() {
  const {proc, wsUrl} = await startChrome(9224);
  const {ws, send, onEvent} = openWs(wsUrl);
  await new Promise(r => ws.once('open', r));
  await send('Network.enable');
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.setCookie', { name:'pm_session', value:cookieToken, domain:'localhost', path:'/', httpOnly:true, secure:false });

  const dismissTour = async () => {
    await evalInPage(send, `(async () => {
      for (let i=0;i<6;i++) {
        const skip = [...document.querySelectorAll('button')].find(b => /Skip tour|Got it|Done/i.test(b.textContent||''));
        if (!skip) break;
        skip.click();
        await new Promise(r=>setTimeout(r,300));
      }
      return true;
    })()`);
  };

  // 1. Dashboard
  await send('Page.navigate', {url:'http://localhost:3000/'});
  await waitForLoad(send, onEvent);
  await new Promise(r=>setTimeout(r,2000));
  await dismissTour();
  await new Promise(r=>setTimeout(r,500));
  let shot = await send('Page.captureScreenshot', {format:'png'});
  fs.writeFileSync(`${outDir}/01-dashboard.png`, Buffer.from(shot.data,'base64'));
  console.log('01-dashboard ok');

  // 2. Click Sepa Payments → Triage
  await evalInPage(send, `(async () => {
    const el = [...document.querySelectorAll('button, a, [role=button]')]
      .find(b => /Sepa Payments/i.test(b.textContent || ''));
    if (el) el.click();
    await new Promise(r=>setTimeout(r,2500));
    return location.href;
  })()`);
  await new Promise(r=>setTimeout(r,1500));
  await dismissTour();
  await new Promise(r=>setTimeout(r,500));
  shot = await send('Page.captureScreenshot', {format:'png'});
  fs.writeFileSync(`${outDir}/02-triage.png`, Buffer.from(shot.data,'base64'));
  console.log('02-triage ok');

  // 3. Click Process Steps section
  await evalInPage(send, `(async () => {
    const el = [...document.querySelectorAll('button, a')]
      .find(b => /^\\s*Process Steps\\s*$/i.test(b.textContent || '') || /Process Steps/i.test(b.textContent || ''));
    if (el) el.click();
    await new Promise(r=>setTimeout(r,2500));
    return location.href;
  })()`);
  await new Promise(r=>setTimeout(r,1500));
  await dismissTour();
  await new Promise(r=>setTimeout(r,500));
  shot = await send('Page.captureScreenshot', {format:'png'});
  fs.writeFileSync(`${outDir}/03-steps.png`, Buffer.from(shot.data,'base64'));
  console.log('03-steps ok');

  ws.close();
  try { process.kill(proc.pid, 'SIGTERM'); } catch(e){}
}

main().catch(e => { console.error('error:', e); process.exit(1); });
