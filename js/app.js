/* ================= GITHUB CONFIG ================= */

const GITHUB = {
  clientId: 'TU_WKLEJ_CLIENT_ID',
  owner: 'TWOJ_LOGIN',
  repo: 'NAZWA_REPO',
  path: 'data/events.json',
  branch: 'main'
};

let githubToken = null;

/* ================= OAUTH DEVICE FLOW ================= */

async function githubLogin() {
  const res = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      'Accept':'application/json'
    },
    body: JSON.stringify({
      client_id: GITHUB.clientId,
      scope: 'repo'
    })
  });

  const d = await res.json();
  alert(`Zaloguj się:\n${d.verification_uri}\nKod: ${d.user_code}`);
  pollToken(d.device_code, d.interval);
}

async function pollToken(deviceCode, interval) {
  const t = setInterval(async () => {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Accept':'application/json'
      },
      body:JSON.stringify({
        client_id:GITHUB.clientId,
        device_code:deviceCode,
        grant_type:'urn:ietf:params:oauth:grant-type:device_code'
      })
    });

    const d = await r.json();
    if (d.access_token) {
      githubToken = d.access_token;
      clearInterval(t);
      toast('✔ Połączono z GitHub');
    }
  }, interval*1000);
}

/* ================= EVENTS ================= */

let events = {};
let current = new Date();

async function loadEvents() {
  events = await fetch('data/events.json?_=' + Date.now()).then(r=>r.json());
}

async function getSha() {
  const r = await fetch(
    `https://api.github.com/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${GITHUB.path}`,
    { headers:{Authorization:`Bearer ${githubToken}`} }
  );
  return (await r.json()).sha;
}

async function commitToGitHub() {
  if (!githubToken) return alert('Zaloguj się przez GitHub');

  const sha = await getSha();
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(events,null,2))));
  const msg = `Aktualizacja kalendarza (${new Date().toLocaleString('pl-PL')})`;

  const r = await fetch(
    `https://api.github.com/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${GITHUB.path}`,
    {
      method:'PUT',
      headers:{
        Authorization:`Bearer ${githubToken}`,
        Accept:'application/vnd.github+json'
      },
      body:JSON.stringify({
        message:msg,
        content,
        sha,
        branch:GITHUB.branch
      })
    }
  );

  r.ok ? toast('✔ Zapisano i opublikowano') : toast('✖ Błąd zapisu',true);
}

/* ================= UI ================= */

function toast(msg){
  const t=document.getElementById('saveToast');
  t.textContent=msg;
  t.classList.add('visible');
  setTimeout(()=>t.classList.remove('visible'),2200);
}

function season(d){
  const m=new Date(d).getMonth()+1;
  if ([12,1].includes(m)) return 'advent';
  if ([3,4].includes(m)) return 'lent';
  return 'ordinary';
}

function renderCalendar(){
  days.innerHTML='';
  const y=current.getFullYear(), m=current.getMonth();
  monthYear.textContent=current.toLocaleString('pl',{month:'long',year:'numeric'});
  const f=(new Date(y,m,1).getDay()+6)%7;
  for(let i=0;i<f;i++) days.appendChild(document.createElement('div'));

  for(let d=1;d<=new Date(y,m+1,0).getDate();d++){
    const k=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const div=document.createElement('div');
    div.textContent=d;
    if(events[k]) div.classList.add('has-event');
    div.onclick=()=>showEvents(k);
    days.appendChild(div);
  }
}

function showEvents(date){
  eventList.innerHTML=`<h3>${date}</h3>`;
  (events[date]||[]).forEach((e,i)=>{
    eventList.innerHTML+=`
      <div class="event liturgia ${season(date)}">
        <input value="${e.title}" onchange="events['${date}'][${i}].title=this.value">
        <button onclick="removeEvent('${date}',${i})">🗑</button>
      </div>`;
  });
}

function removeEvent(d,i){
  events[d].splice(i,1);
  if (!events[d].length) delete events[d];
  renderCalendar(); showEvents(d);
}

/* ================= INIT ================= */

window.changeMonth = n => { current.setMonth(current.getMonth()+n); renderCalendar(); };

(async()=>{
  await loadEvents();
  renderCalendar();
})();/* ================= GITHUB CONFIG ================= */

const GITHUB = {
  clientId: 'TU_WKLEJ_CLIENT_ID',
  owner: 'TWOJ_LOGIN',
  repo: 'NAZWA_REPO',
  path: 'data/events.json',
  branch: 'main'
};

let githubToken = null;

/* ================= OAUTH DEVICE FLOW ================= */

async function githubLogin() {
  const res = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      'Accept':'application/json'
    },
    body: JSON.stringify({
      client_id: GITHUB.clientId,
      scope: 'repo'
    })
  });

  const d = await res.json();
  alert(`Zaloguj się:\n${d.verification_uri}\nKod: ${d.user_code}`);
  pollToken(d.device_code, d.interval);
}

async function pollToken(deviceCode, interval) {
  const t = setInterval(async () => {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Accept':'application/json'
      },
      body:JSON.stringify({
        client_id:GITHUB.clientId,
        device_code:deviceCode,
        grant_type:'urn:ietf:params:oauth:grant-type:device_code'
      })
    });

    const d = await r.json();
    if (d.access_token) {
      githubToken = d.access_token;
      clearInterval(t);
      toast('✔ Połączono z GitHub');
    }
  }, interval*1000);
}

/* ================= EVENTS ================= */

let events = {};
let current = new Date();

async function loadEvents() {
  events = await fetch('data/events.json?_=' + Date.now()).then(r=>r.json());
}

async function getSha() {
  const r = await fetch(
    `https://api.github.com/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${GITHUB.path}`,
    { headers:{Authorization:`Bearer ${githubToken}`} }
  );
  return (await r.json()).sha;
}

async function commitToGitHub() {
  if (!githubToken) return alert('Zaloguj się przez GitHub');

  const sha = await getSha();
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(events,null,2))));
  const msg = `Aktualizacja kalendarza (${new Date().toLocaleString('pl-PL')})`;

  const r = await fetch(
    `https://api.github.com/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${GITHUB.path}`,
    {
      method:'PUT',
      headers:{
        Authorization:`Bearer ${githubToken}`,
        Accept:'application/vnd.github+json'
      },
      body:JSON.stringify({
        message:msg,
        content,
        sha,
        branch:GITHUB.branch
      })
    }
  );

  r.ok ? toast('✔ Zapisano i opublikowano') : toast('✖ Błąd zapisu',true);
}

/* ================= UI ================= */

function toast(msg){
  const t=document.getElementById('saveToast');
  t.textContent=msg;
  t.classList.add('visible');
  setTimeout(()=>t.classList.remove('visible'),2200);
}

function season(d){
  const m=new Date(d).getMonth()+1;
  if ([12,1].includes(m)) return 'advent';
  if ([3,4].includes(m)) return 'lent';
  return 'ordinary';
}

function renderCalendar(){
  days.innerHTML='';
  const y=current.getFullYear(), m=current.getMonth();
  monthYear.textContent=current.toLocaleString('pl',{month:'long',year:'numeric'});
  const f=(new Date(y,m,1).getDay()+6)%7;
  for(let i=0;i<f;i++) days.appendChild(document.createElement('div'));

  for(let d=1;d<=new Date(y,m+1,0).getDate();d++){
    const k=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const div=document.createElement('div');
    div.textContent=d;
    if(events[k]) div.classList.add('has-event');
    div.onclick=()=>showEvents(k);
    days.appendChild(div);
  }
}

function showEvents(date){
  eventList.innerHTML=`<h3>${date}</h3>`;
  (events[date]||[]).forEach((e,i)=>{
    eventList.innerHTML+=`
      <div class="event liturgia ${season(date)}">
        <input value="${e.title}" onchange="events['${date}'][${i}].title=this.value">
        <button onclick="removeEvent('${date}',${i})">🗑</button>
      </div>`;
  });
}

function removeEvent(d,i){
  events[d].splice(i,1);
  if (!events[d].length) delete events[d];
  renderCalendar(); showEvents(d);
}

/* ================= INIT ================= */

window.changeMonth = n => { current.setMonth(current.getMonth()+n); renderCalendar(); };

(async()=>{
  await loadEvents();
  renderCalendar();
})();