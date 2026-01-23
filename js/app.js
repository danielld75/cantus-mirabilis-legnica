const DAYS_EL=document.getElementById('days');
const MONTHYEAR_EL=document.getElementById('monthYear');
const EVENTLIST_EL=document.getElementById('eventList');
const TOAST_EL=document.getElementById('saveToast');
const EVENTS_PATH='data/events.json';
const GITHUB_BRANCH='main';

let events={}, currentDate=new Date();

async function loadEvents(){
  events=await fetch(EVENTS_PATH+'?_='+Date.now()).then(r=>r.json());
}

function season(date){
  const m=new Date(date).getMonth()+1;
  if([12,1].includes(m)) return 'advent';
  if([3,4].includes(m)) return 'lent';
  return 'ordinary';
}

function renderCalendar(){
  DAYS_EL.innerHTML='';
  const y=currentDate.getFullYear(), m=currentDate.getMonth();
  MONTHYEAR_EL.textContent=currentDate.toLocaleString('pl',{month:'long',year:'numeric'});
  let f=(new Date(y,m,1).getDay()+6)%7;
  for(let i=0;i<f;i++) DAYS_EL.appendChild(document.createElement('div'));
  for(let d=1;d<=new Date(y,m+1,0).getDate();d++){
    const k=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const div=document.createElement('div'); div.textContent=d; div.className='day';
    if(events[k]) div.classList.add('has-event');
    const today=new Date();
    if(today.getFullYear()===y && today.getMonth()===m && today.getDate()===d) div.classList.add('today');
    div.onclick=()=>showEvents(k);
    DAYS_EL.appendChild(div);
  }
}

function showEvents(date){
  EVENTLIST_EL.innerHTML=`<h3>${date}</h3>`;
  (events[date]||[]).forEach((e,i)=>{
    const div=document.createElement('div');
    div.className='event liturgia '+season(date);
    div.innerHTML=`<input value="${e.title}" onchange="events['${date}'][${i}].title=this.value"> <button onclick="removeEvent('${date}',${i})">🗑</button>`;
    EVENTLIST_EL.appendChild(div);
  });
}

function removeEvent(d,i){
  events[d].splice(i,1);
  if(!events[d].length) delete events[d];
  renderCalendar(); showEvents(d);
}

function changeMonth(n){ currentDate.setMonth(currentDate.getMonth()+n); renderCalendar(); }

function toast(msg){
  TOAST_EL.textContent=msg;
  TOAST_EL.classList.add('visible');
  setTimeout(()=>TOAST_EL.classList.remove('visible'),2200);
}

async function getFileSha(token){
  const r=await fetch(`https://api.github.com/repos/danielld75/cantus-mirabilis-legnica/contents/${EVENTS_PATH}`,{
    headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json'}
  });
  const d=await r.json(); return d.sha;
}

async function commitEventsToGitHub(){
  const token=document.getElementById('ghToken').value.trim();
  if(!token) return alert('Wklej token GitHub');
  try{
    const sha=await getFileSha(token);
    const content=btoa(unescape(encodeURIComponent(JSON.stringify(events,null,2))));
    const msg=`Aktualizacja kalendarza (${new Date().toLocaleString('pl-PL')})`;
    const r=await fetch(`https://api.github.com/repos/YOUR_GITHUB/YOUR_REPO/contents/${EVENTS_PATH}`,{
      method:'PUT',
      headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json'},
      body:JSON.stringify({message:msg,content,sha,branch:GITHUB_BRANCH})
    });
    r.ok ? toast('✔ Zapisano i opublikowano') : toast('✖ Błąd zapisu',true);
  }catch(e){toast('✖ Błąd zapisu',true);}
}

(async()=>{await loadEvents(); renderCalendar();})();
