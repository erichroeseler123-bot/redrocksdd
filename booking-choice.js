let selectedRedRocksDriverId = null;

function bookPage(){
  const opts=days().filter(x=>!tooSoon(x.v));
  $('#app').innerHTML=`<section class="sec white"><div class="w">
    <div class="eyebrow" style="color:#8f3420">1. PICK YOUR SHOW · 2. PICK YOUR DD · 3. RESERVE</div>
    <h2>CHOOSE YOUR RED ROCKS DD.</h2>
    <p class="lead">Pick your show date and group size first. We’ll show only approved drivers who marked themselves available that day and have a vehicle that fits your group.</p>
    <div class="form">
      <div class="fg">
        <div class="f"><label>Show date</label><select id="bd" onchange="loadAvailableRedRocksDrivers()">${opts.map(x=>`<option value="${x.v}">${x.l}</option>`).join('')}</select></div>
        <div class="f"><label>Group size</label><select id="bg" onchange="loadAvailableRedRocksDrivers()">${Array.from({length:12},(_,i)=>i+1).map(n=>`<option value="${n}">${n}</option>`).join('')}</select></div>
      </div>
      <div style="margin-top:24px"><div class="eyebrow" style="color:#8f3420">AVAILABLE FOR YOUR SHOW</div><h3 style="font-size:26px;margin:5px 0 8px">Choose your driver</h3><p class="muted">These are the drivers who are actually available for the selected date and group size.</p><div id="driverchoices" class="results"><div class="note">Checking driver availability…</div></div></div>
      <div id="bookingdetails" class="hide" style="margin-top:28px;border-top:1px solid var(--line);padding-top:24px">
        <h3 style="font-size:26px;margin:0 0 14px">Your pickup details</h3>
        <div class="fg">
          <div class="f"><label>Pickup area</label><select id="ba"><option>Denver / Downtown</option><option>Capitol Hill</option><option>RiNo / Five Points</option><option>Highlands / LoHi</option><option>Lakewood</option><option>Golden</option><option>Boulder</option><option>Arvada / Wheat Ridge</option><option>Other</option></select></div>
          <div class="f"><label>Artist / show (optional)</label><input id="bart" placeholder="Artist or event"></div>
          <div class="f full"><label>Pickup address</label><input id="baddr" placeholder="Home, hotel or Airbnb address"></div>
          <div class="f"><label>Your name</label><input id="bn"></div>
          <div class="f"><label>Phone</label><input id="bp"></div>
          <div class="f full"><label>Email</label><input id="be" type="email"></div>
          <div class="f full"><label>Notes</label><textarea id="bnotes" placeholder="Anything we should know about your group or pickup?"></textarea></div>
        </div>
        <div class="note good" style="margin-top:16px"><b>$299 total.</b> $49 deposit today. $250 balance due on the day of service.</div>
        <label class="consent"><input type="checkbox" id="bok"> I agree to the <a href="#/terms" target="_blank"><u>Terms</u></a> and understand this is a $299 trip: $49 deposit paid now and $250 balance due on the day of service.</label>
        <div id="bmsg"></div>
        <button class="btn red" id="bookbtn" onclick="createBooking()">PAY $49 DEPOSIT & RESERVE THIS DRIVER</button>
        <p class="muted small">Reservations close 24 hours before the standard 4:30 PM pickup window.</p>
      </div>
    </div>
  </div></section>`;
  selectedRedRocksDriverId=null;
  loadAvailableRedRocksDrivers();
}

async function loadAvailableRedRocksDrivers(){
  selectedRedRocksDriverId=null;
  const details=$('#bookingdetails'); if(details) details.classList.add('hide');
  const box=$('#driverchoices'); if(!box)return;
  box.innerHTML='<div class="note">Checking driver availability…</div>';
  const date=$('#bd')?.value, group=+($('#bg')?.value||0);
  const z=await sb.rpc('get_red_rocks_dd_available_drivers',{p_service_date:date,p_group_size:group});
  if(z.error){box.innerHTML=`<div class="note bad">${esc(z.error.message||'Unable to load drivers.')}</div>`;return}
  const drivers=z.data||[];
  if(!drivers.length){box.innerHTML='<div class="note"><b>No available DDs for this date and group size yet.</b><br>Try another show date or group size.</div>';return}
  box.innerHTML=drivers.map(d=>{
    const photo=d.driver_photo_url||d.vehicle_photo_url||'';
    return `<div class="op" id="driver-${d.operator_id}">${photo?`<div class="pic" style="background-image:url('${esc(photo)}')"></div>`:'<div class="pic" style="display:grid;place-items:center;font-size:54px">🚕</div>'}<div class="body"><div class="row"><div><h3>${esc(d.driver_name||'Red Rocks DD driver')}</h3><p class="muted">${esc(d.company_name||'Licensed transportation operator')}</p></div><div class="price">$299</div></div><p><b>${esc(d.vehicle_name||'Vehicle')}</b> · seats up to ${esc(d.vehicle_capacity)}</p><p class="muted">Available for ${esc(date)} and fits your group of ${esc(group)}.</p><button class="btn dark" onclick="chooseRedRocksDriver('${d.operator_id}')">CHOOSE THIS DRIVER</button></div></div>`;
  }).join('');
}

function chooseRedRocksDriver(id){
  selectedRedRocksDriverId=id;
  $$('.op').forEach(x=>x.style.outline='none');
  const chosen=document.getElementById('driver-'+id); if(chosen) chosen.style.outline='3px solid var(--rust)';
  const details=$('#bookingdetails'); if(details){details.classList.remove('hide');details.scrollIntoView({behavior:'smooth',block:'start'});}
}

async function createBooking(){
  if(!selectedRedRocksDriverId)return flash('#bmsg','Choose an available driver first.',true);
  if(!$('#bok').checked)return flash('#bmsg','Please agree to the Terms.',true);
  const args={p_service_date:$('#bd').value,p_artist:$('#bart').value.trim(),p_group_size:+$('#bg').value,p_pickup_area:$('#ba').value,p_pickup_address:$('#baddr').value.trim(),p_customer_name:$('#bn').value.trim(),p_customer_email:$('#be').value.trim(),p_customer_phone:$('#bp').value.trim(),p_notes:$('#bnotes').value.trim(),p_preferred_operator_id:selectedRedRocksDriverId};
  if(!args.p_customer_name||!args.p_customer_email||!args.p_customer_phone||!args.p_pickup_address)return flash('#bmsg','Name, email, phone and pickup address are required.',true);
  const btn=$('#bookbtn');btn.disabled=true;btn.textContent='RESERVING YOUR DRIVER…';
  const z=await sb.rpc('create_red_rocks_dd_booking',args);
  if(z.error){btn.disabled=false;btn.textContent='PAY $49 DEPOSIT & RESERVE THIS DRIVER';if(String(z.error.message||'').includes('no longer available'))await loadAvailableRedRocksDrivers();return flash('#bmsg',z.error.message,true)}
  const r=z.data?.[0];if(!r){btn.disabled=false;return flash('#bmsg','Unable to create reservation.',true)}
  saveBooking(r.request_id,r.guest_token);
  try{const pay=await fetch(CFG.checkoutUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId:r.request_id,guestToken:r.guest_token})});const j=await pay.json().catch(()=>({}));if(!pay.ok||!j.checkoutUrl)throw Error(j.error||'Unable to open checkout.');location.href=j.checkoutUrl}catch(e){location.hash=`#/booking?id=${encodeURIComponent(r.request_id)}&token=${encodeURIComponent(r.guest_token)}&payment=retry`}
}
