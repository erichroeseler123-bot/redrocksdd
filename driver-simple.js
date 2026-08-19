async function companyPage(){
  const sr=await sb.rpc('red_rocks_dd_operator_slots_remaining'),slots=sr.error?null:Number(sr.data);
  if(slots===0){
    $('#app').innerHTML=`<section class="sec white"><div class="w"><div class="card" style="text-align:center"><span class="status">FOUNDING GROUP FULL</span><h2>DRIVER SIGNUPS ARE CLOSED FOR NOW.</h2><p>We opened this launch group to 10 founding drivers. Those slots are filled.</p></div></div></section>`;
    return;
  }
  const slotText=slots==null?'10 founding slots total':`${slots} of 10 founding slots remain`;
  $('#app').innerHTML=`<section class="sec white"><div class="w">
    <div class="founding-banner"><div><div class="eyebrow">FOUNDING DRIVER OFFER</div><h2>$350 + TIPS ON YOUR FIRST TRIP.</h2><p><b>$250 trip pay + $100 founding bonus after your first successfully completed trip.</b><br>Every later Red Rocks DD trip pays $250 + tips. ${slotText}.</p></div><div class="founding-money">$350+<small>FIRST TRIP + TIPS</small></div></div>

    <div style="max-width:760px;margin:26px auto 0">
      <div class="eyebrow" style="color:#8f3420">FOR LICENSED TAXI & PASSENGER TRANSPORTATION DRIVERS</div>
      <h2 style="margin-bottom:8px">JOIN RED ROCKS DD.</h2>
      <p class="lead">One pickup. Stay at Red Rocks through the show. One ride home. <b>$250 + tips per trip.</b></p>
      <div class="note good" style="margin:18px 0"><b>Keep signup simple.</b> Tell us who you are, your license/authority number and what you drive. Photos, insurance details and additional profile information can be finished after signup.</div>

      <div class="form">
        <div class="fg">
          <div class="f"><label>Your name *</label><input id="cn" autocomplete="name" placeholder="Driver name"></div>
          <div class="f"><label>Taxi / company name *</label><input id="cc" autocomplete="organization" placeholder="Example: Denver Taxi"></div>
          <div class="f"><label>Email *</label><input id="ce" type="email" autocomplete="email"></div>
          <div class="f"><label>Phone *</label><input id="ct" type="tel" autocomplete="tel"></div>
          <div class="f"><label>Create a password *</label><input id="cp" type="password" autocomplete="new-password" placeholder="6+ characters"></div>
          <div class="f"><label>License / PUC / authority # *</label><input id="cl" placeholder="Your commercial authority number"></div>
          <div class="f"><label>Vehicle *</label><input id="cv" placeholder="Toyota Sienna, Chevy Suburban, etc."></div>
          <div class="f"><label>Passenger capacity *</label><input id="cap" type="number" min="1" max="20" placeholder="Passengers"></div>
          <div class="f full"><label>Insurance carrier <span class="muted">(optional now)</span></label><input id="ci" placeholder="You can finish this after signup"></div>
        </div>

        <div style="margin-top:22px;padding-top:20px;border-top:1px solid var(--line)">
          <div class="row" style="align-items:end"><div><label style="display:block;font-weight:800;margin-bottom:4px">Red Rocks dates you can work <span class="muted">(optional now)</span></label><div class="muted small">Pick some now or set your availability after signup.</div></div><button type="button" class="btn ghost small" onclick="selectAllDriverDates(true)">Select all</button></div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:7px;max-height:190px;overflow:auto;margin-top:12px;padding:4px">${days(95).map(x=>`<label style="font-weight:500"><input class="cd" type="checkbox" value="${x.v}" style="width:auto"> ${x.l}</label>`).join('')}</div>
        </div>

        <label class="consent"><input type="checkbox" id="agree"> I confirm I operate licensed commercial passenger transportation, maintain required insurance and legal authority, and can provide the standard Red Rocks DD service.</label>
        <div id="cm"></div>
        <button class="btn red" id="driverSignupBtn" onclick="signupDriver()">JOIN RED ROCKS DD</button>
        <p class="muted small" style="margin-top:10px">We review your commercial authority before your profile goes live. No fake profiles and no unlicensed drivers.</p>
      </div>
    </div>
  </div></section>`;
}

function selectAllDriverDates(on){$$('.cd').forEach(x=>x.checked=on)}

async function signupDriver(){
  if(!$('#agree').checked)return flash('#cm','Please confirm the licensing and service requirements.',true);
  const values={
    company:$('#cc').value.trim(),name:$('#cn').value.trim(),email:$('#ce').value.trim(),phone:$('#ct').value.trim(),password:$('#cp').value,
    license:$('#cl').value.trim(),insurance:$('#ci').value.trim(),vehicle:$('#cv').value.trim(),capacity:+$('#cap').value
  };
  if(!values.name||!values.company||!values.email||!values.phone||!values.license||!values.vehicle||!values.capacity)return flash('#cm','Please complete the required fields.',true);
  if(values.password.length<6)return flash('#cm','Create a password of at least 6 characters.',true);
  if(values.capacity<1||values.capacity>20)return flash('#cm','Enter the number of passengers your vehicle can legally carry.',true);
  const btn=$('#driverSignupBtn');btn.disabled=true;btn.textContent='CREATING YOUR DRIVER ACCOUNT…';
  flash('#cm','Creating your driver account…');
  try{
    const auth=await sb.auth.signUp({email:values.email,password:values.password,options:{emailRedirectTo:location.origin+'/#/login'}});
    if(auth.error)throw auth.error;
    const uid=auth.data.user?.id;if(!uid)throw Error('Account could not be created.');
    const op=await sb.from('caddy_operators').insert({user_id:uid,company_name:values.company,driver_name:values.name,email:values.email,phone:values.phone,license_number:values.license,insurance_carrier:values.insurance||null,price_cents:P.transportation,approved:false,active:false}).select('id').single();
    if(op.error)throw op.error;
    const veh=await sb.from('caddy_vehicles').insert({operator_id:op.data.id,make_model:values.vehicle,capacity:values.capacity,active:true});
    if(veh.error)throw veh.error;
    const selected=$$('.cd:checked').map(x=>({operator_id:op.data.id,service_date:x.value,available:true}));
    if(selected.length){const av=await sb.from('caddy_availability').insert(selected);if(av.error)throw av.error}
    $('#app').innerHTML=`<section class="sec white"><div class="w"><div class="card" style="max-width:650px;margin:auto;text-align:center"><span class="status">APPLICATION RECEIVED</span><h2>YOU'RE IN THE REVIEW QUEUE.</h2><p class="lead">We have your driver account. We’ll verify your commercial authority before your profile becomes bookable.</p><p>You can use the driver dashboard to update the dates you want to work.</p><a class="btn dark" href="#/login">GO TO DRIVER LOGIN</a></div></div></section>`;
  }catch(e){btn.disabled=false;btn.textContent='JOIN RED ROCKS DD';flash('#cm',e.message||'Unable to submit application.',true)}
}

async function dashboardPage(){
  const {data:{user}}=await sb.auth.getUser();if(!user){location.hash='#/login';return}
  const op=(await sb.from('caddy_operators').select('*').eq('user_id',user.id).maybeSingle()).data;
  if(!op){$('#app').innerHTML=`<section class="sec white"><div class="w"><div class="card">No driver profile is attached to this account.</div></div></section>`;return}
  const req=(await sb.from('caddy_requests').select('*').eq('operator_id',op.id).order('service_date')).data||[];
  const veh=(await sb.from('caddy_vehicles').select('*').eq('operator_id',op.id)).data||[];
  const av=(await sb.from('caddy_availability').select('service_date,available').eq('operator_id',op.id)).data||[];
  const selected=new Set(av.filter(x=>x.available).map(x=>x.service_date));
  $('#app').innerHTML=`<section class="sec white"><div class="w">
    <div class="row"><div><span class="status">${op.approved?'APPROVED & BOOKABLE':'UNDER REVIEW'}</span><h2>${esc(op.driver_name)}</h2><p class="muted">${esc(op.company_name)} · $250 per completed trip + tips</p></div><button class="btn ghost" onclick="logout()">Log out</button></div>
    ${!op.approved?`<div class="note" style="margin:18px 0"><b>Your profile is not public yet.</b> We’re reviewing your commercial authority. You can set availability now so you are ready to appear as soon as you are approved.</div>`:''}
    <div class="grid"><div class="card"><h3>Vehicle</h3><p>${veh.map(v=>`${esc(v.make_model)} · capacity ${v.capacity}`).join('<br>')||'No active vehicle'}</p></div><div class="card"><h3>Pay</h3><p><b>$250 + tips</b> per completed trip.${op.founding_bonus_eligible?' Plus your $100 founding bonus after the first completed trip.':''}</p></div><div class="card"><h3>Trips</h3><p>${req.length} assigned / historical trip${req.length===1?'':'s'}.</p></div></div>

    <div class="card" style="margin-top:24px"><div class="row"><div><h3 style="margin:0">WHEN DO YOU WANT TO DRIVE?</h3><p class="muted" style="margin:5px 0 0">Customers only see you on dates you mark available.</p></div><div><button class="btn ghost small" onclick="dashboardSelectDates(true)">Select all</button> <button class="btn ghost small" onclick="dashboardSelectDates(false)">Clear</button></div></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:8px;max-height:260px;overflow:auto;margin:18px 0">${days(95).map(x=>`<label style="font-weight:500"><input class="dav" type="checkbox" value="${x.v}" style="width:auto" ${selected.has(x.v)?'checked':''}> ${x.l}</label>`).join('')}</div><div id="avmsg"></div><button class="btn red" onclick="saveDriverAvailability('${op.id}')">SAVE MY AVAILABLE DATES</button></div>

    <h3 style="margin-top:30px">TRIPS</h3><div class="tablewrap"><table class="table"><thead><tr><th>Date</th><th>Group</th><th>Pickup</th><th>Status</th><th>Action</th></tr></thead><tbody>${req.map(r=>`<tr><td>${esc(r.service_date)}</td><td>${r.group_size}</td><td>${esc(r.pickup_area||'')}</td><td>${esc(statusLabel(r.status))}</td><td>${['assigned','requested'].includes(r.status)?`<button class="btn small red" onclick="driverConfirm('${r.id}')">Confirm</button>`:''}</td></tr>`).join('')||'<tr><td colspan="5">No trips yet.</td></tr>'}</tbody></table></div>
  </div></section>`;
}

function dashboardSelectDates(on){$$('.dav').forEach(x=>x.checked=on)}

async function saveDriverAvailability(operatorId){
  const wanted=new Set($$('.dav:checked').map(x=>x.value));
  flash('#avmsg','Saving availability…');
  const existing=(await sb.from('caddy_availability').select('id,service_date,available').eq('operator_id',operatorId)).data||[];
  const byDate=new Map(existing.map(x=>[x.service_date,x]));
  const rows=days(95).map(x=>({operator_id:operatorId,service_date:x.v,available:wanted.has(x.v)}));
  const z=await sb.from('caddy_availability').upsert(rows,{onConflict:'operator_id,service_date'});
  if(z.error)return flash('#avmsg',z.error.message,true);
  flash('#avmsg',`Saved. You are available on ${wanted.size} date${wanted.size===1?'':'s'}.`);
}
