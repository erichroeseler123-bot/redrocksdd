const CFG=window.RRDD_CONFIG, P=CFG.pricing;
const sb=supabase.createClient(CFG.supabase.url,CFG.supabase.anonKey);
const $=(q)=>document.querySelector(q), $$=(q)=>[...document.querySelectorAll(q)];
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const dollars=c=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format((c||0)/100);
const params=()=>new URLSearchParams(location.hash.includes('?')?location.hash.split('?')[1]:'');
const route=()=>location.hash.replace(/^#\/?/,'').split('?')[0]||'';
function days(n=120){const a=[];for(let i=1;i<=n;i++){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+i);const v=d.toISOString().slice(0,10);a.push({v,l:d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})})}return a}
function tooSoon(v){const [y,m,d]=v.split('-').map(Number);const pickup=new Date(y,m-1,d,16,30);return pickup.getTime()-Date.now()<24*3600e3}
function flash(sel,text,bad=false){const el=$(sel);if(el)el.innerHTML=`<div class="note ${bad?'bad':'good'}">${esc(text)}</div>`}
function saveBooking(id,token){localStorage.setItem('rrdd_booking',JSON.stringify({id,token}))}
function savedBooking(){try{return JSON.parse(localStorage.getItem('rrdd_booking')||'null')}catch{return null}}
function statusLabel(s){return ({reserved:'Reserved',matching:'Matching',assigned:'Driver assigned',confirmed:'Confirmed',pickup:'Pickup',active:'Trip active',completed:'Completed',cancelled:'Cancelled',refunded:'Refunded',requested:'Matching',accepted:'Assigned',declined:'Reassigning'}[s]||s||'Matching')}
