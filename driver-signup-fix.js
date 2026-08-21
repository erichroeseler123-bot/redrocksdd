const rrddOriginalDashboardPage = window.dashboardPage;
const rrddOriginalCompanyPage = window.companyPage;

window.companyPage = async function companyPageWithPaymentPreferences(){
  await rrddOriginalCompanyPage();
  const agree=$('#agree');
  if(!agree||$('#rrdd-payment-box'))return;
  agree.closest('label')?.insertAdjacentHTML('beforebegin',`
    <div id="rrdd-payment-box" style="margin:22px 0;padding:18px;border:1px solid var(--line);border-radius:12px">
      <label style="display:block;font-weight:800;margin-bottom:8px">How can customers pay your $250 day-of-service balance? *</label>
      <div class="muted small" style="margin-bottom:12px">Choose every method you accept. Red Rocks Designated Driver collects the $49 reservation fee online; the customer pays your $250 balance on the service day.</div>
      <div style="display:flex;flex-wrap:wrap;gap:14px">
        <label><input class="rrdd-pay" type="checkbox" value="cash" style="width:auto"> Cash</label>
        <label><input class="rrdd-pay" type="checkbox" value="zelle" style="width:auto"> Zelle</label>
        <label><input class="rrdd-pay" type="checkbox" value="venmo" style="width:auto"> Venmo</label>
        <label><input class="rrdd-pay" type="checkbox" value="cash_app" style="width:auto"> Cash App</label>
        <label><input class="rrdd-pay" type="checkbox" value="card" style="width:auto"> Card / card reader</label>
      </div>
      <label style="display:block;margin-top:14px"><input id="rrdd-cash-required" type="checkbox" style="width:auto"> <b>CASH REQUIRED</b> — customers must bring the $250 balance in cash.</label>
    </div>`);
};

window.signupDriver = async function signupDriverFixed(){
  if(!$('#agree').checked)return flash('#cm','Please confirm the licensing and service requirements.',true);

  const paymentMethods=$$('.rrdd-pay:checked').map(x=>x.value);
  const cashRequired=!!$('#rrdd-cash-required')?.checked;
  if(cashRequired&&!paymentMethods.includes('cash'))paymentMethods.push('cash');
  if(!paymentMethods.length)return flash('#cm','Please choose at least one way customers can pay your $250 balance.',true);

  const values={
    company:$('#cc').value.trim(),
    name:$('#cn').value.trim(),
    email:$('#ce').value.trim().toLowerCase(),
    phone:$('#ct').value.trim(),
    password:$('#cp').value,
    license:$('#cl').value.trim(),
    insurance:$('#ci').value.trim(),
    vehicle:$('#cv').value.trim(),
    capacity:+$('#cap').value
  };

  if(!values.name||!values.company||!values.email||!values.phone||!values.license||!values.vehicle||!values.capacity){
    return flash('#cm','Please complete the required fields.',true);
  }
  if(!values.email.includes('@'))return flash('#cm','Enter a valid email address.',true);
  if(values.password.length<6)return flash('#cm','Create a password of at least 6 characters.',true);
  if(values.capacity<1||values.capacity>20)return flash('#cm','Enter the number of passengers your vehicle can legally carry.',true);

  const selectedDates=$$('.cd:checked').map(x=>x.value);
  const btn=$('#driverSignupBtn');
  btn.disabled=true;
  btn.textContent='SAVING YOUR APPLICATION…';
  flash('#cm','Saving your driver application…');

  try{
    const saved=await sb.from('rrdd_driver_applications').insert({
      driver_name:values.name,
      company_name:values.company,
      email:values.email,
      phone:values.phone,
      license_number:values.license,
      insurance_carrier:values.insurance||null,
      vehicle:values.vehicle,
      capacity:values.capacity,
      availability_dates:selectedDates,
      payment_methods:paymentMethods,
      cash_required:cashRequired,
      status:'review_pending',
      source:'redrocksdd_driver_signup'
    });
    if(saved.error)throw saved.error;

    btn.textContent='CREATING YOUR DRIVER LOGIN…';
    flash('#cm','Application saved. Creating your driver login…');

    const auth=await sb.auth.signUp({
      email:values.email,
      password:values.password,
      options:{emailRedirectTo:location.origin+'/#/login'}
    });

    let accountMessage='Your application is safely saved. We’ll contact you at the email and phone number you provided.';
    if(!auth.error&&auth.data.user){
      accountMessage=auth.data.session
        ? 'Your driver login is ready. Sign in to upload your driver and vehicle photos.'
        : 'Check your email to confirm your driver login, then sign in to upload your driver and vehicle photos.';
    }else if(auth.error){
      accountMessage='Your application is safely saved. This email may already have a Red Rocks Designated Driver login from your earlier signup attempt. Use Driver Login with the password you created.';
    }

    $('#app').innerHTML=`<section class="sec white"><div class="w"><div class="card" style="max-width:650px;margin:auto;text-align:center"><span class="status">APPLICATION SAVED</span><h2>ONE LAST STEP: ADD YOUR PHOTOS.</h2><p class="lead">We saved your contact information, commercial authority, vehicle, work dates and payment preferences.</p><p>${esc(accountMessage)}</p><a class="btn dark" href="#/login">DRIVER LOGIN</a></div></div></section>`;
  }catch(e){
    btn.disabled=false;
    btn.textContent='JOIN RED ROCKS DD';
    flash('#cm',e.message||'Unable to save your application. Please try again.',true);
  }
};

async function rrddUploadPhoto(user,file,kind){
  if(!file)throw Error(`Please choose your ${kind==='driver'?'driver':'vehicle'} photo.`);
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Photos must be JPG, PNG or WebP.');
  if(file.size>5*1024*1024)throw Error('Each photo must be under 5 MB.');
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
  const path=`${user.id}/rrdd-${kind}-${Date.now()}.${ext||'jpg'}`;
  const uploaded=await sb.storage.from('driver-media').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
  if(uploaded.error)throw uploaded.error;
  return path;
}

window.finishRrddProfile = async function finishRrddProfile(applicationId){
  const {data:{user}}=await sb.auth.getUser();
  if(!user)return location.hash='#/login';
  const methods=$$('.rrdd-finish-pay:checked').map(x=>x.value);
  const cashRequired=!!$('#finish-cash-required')?.checked;
  if(cashRequired&&!methods.includes('cash'))methods.push('cash');
  if(!methods.length)return flash('#finishmsg','Choose at least one payment method.',true);
  const driverFile=$('#finish-driver-photo')?.files?.[0];
  const vehicleFile=$('#finish-vehicle-photo')?.files?.[0];
  const btn=$('#finishProfileBtn');
  btn.disabled=true;btn.textContent='UPLOADING…';flash('#finishmsg','Uploading your photos…');
  try{
    const [driverPath,vehiclePath]=await Promise.all([
      rrddUploadPhoto(user,driverFile,'driver'),
      rrddUploadPhoto(user,vehicleFile,'vehicle')
    ]);
    const updated=await sb.from('rrdd_driver_applications').update({
      driver_photo_path:driverPath,
      vehicle_photo_path:vehiclePath,
      payment_methods:methods,
      cash_required:cashRequired,
      profile_completed_at:new Date().toISOString()
    }).eq('id',applicationId).eq('email',(user.email||'').toLowerCase());
    if(updated.error)throw updated.error;
    flash('#finishmsg','Profile complete. Welcome to Red Rocks Designated Driver.');
    setTimeout(()=>dashboardPage(),600);
  }catch(e){
    btn.disabled=false;btn.textContent='FINISH MY DRIVER PROFILE';
    flash('#finishmsg',e.message||'Unable to finish your profile.',true);
  }
};

window.dashboardPage = async function dashboardPageFixed(){
  const {data:{user}}=await sb.auth.getUser();
  if(!user){location.hash='#/login';return;}

  const op=(await sb.from('caddy_operators').select('id').eq('user_id',user.id).maybeSingle()).data;
  if(op&&rrddOriginalDashboardPage)return rrddOriginalDashboardPage();

  const email=(user.email||'').trim().toLowerCase();
  const application=(await sb.from('rrdd_driver_applications')
    .select('id,driver_name,company_name,vehicle,capacity,status,created_at,driver_photo_path,vehicle_photo_path,payment_methods,cash_required,profile_completed_at')
    .eq('email',email)
    .order('created_at',{ascending:false})
    .limit(1)
    .maybeSingle()).data;

  if(application){
    const methods=Array.isArray(application.payment_methods)?application.payment_methods:[];
    const complete=!!(application.driver_photo_path&&application.vehicle_photo_path&&application.profile_completed_at);
    if(!complete){
      $('#app').innerHTML=`<section class="sec white"><div class="w" style="max-width:760px"><div class="row"><div><span class="status">APPLICATION SAVED</span><h2>FINISH YOUR DRIVER PROFILE.</h2><p class="muted">${esc(application.driver_name)} · ${esc(application.company_name)}</p></div><button class="btn ghost" onclick="logout()">Log out</button></div><div class="note good" style="margin:18px 0"><b>Your application is safe.</b> Add these two photos and confirm how customers can pay your $250 day-of-service balance.</div><div class="form"><div class="fg"><div class="f"><label>Your photo *</label><input id="finish-driver-photo" type="file" accept="image/jpeg,image/png,image/webp"></div><div class="f"><label>Vehicle photo *</label><input id="finish-vehicle-photo" type="file" accept="image/jpeg,image/png,image/webp"></div></div><div style="margin:20px 0;padding:18px;border:1px solid var(--line);border-radius:12px"><label style="display:block;font-weight:800;margin-bottom:8px">Accepted payment methods for your $250 balance *</label><div style="display:flex;flex-wrap:wrap;gap:14px"><label><input class="rrdd-finish-pay" type="checkbox" value="cash" style="width:auto" ${methods.includes('cash')?'checked':''}> Cash</label><label><input class="rrdd-finish-pay" type="checkbox" value="zelle" style="width:auto" ${methods.includes('zelle')?'checked':''}> Zelle</label><label><input class="rrdd-finish-pay" type="checkbox" value="venmo" style="width:auto" ${methods.includes('venmo')?'checked':''}> Venmo</label><label><input class="rrdd-finish-pay" type="checkbox" value="cash_app" style="width:auto" ${methods.includes('cash_app')?'checked':''}> Cash App</label><label><input class="rrdd-finish-pay" type="checkbox" value="card" style="width:auto" ${methods.includes('card')?'checked':''}> Card / card reader</label></div><label style="display:block;margin-top:14px"><input id="finish-cash-required" type="checkbox" style="width:auto" ${application.cash_required?'checked':''}> <b>CASH REQUIRED</b> — customer must bring the $250 balance in cash.</label></div><div id="finishmsg"></div><button id="finishProfileBtn" class="btn red" onclick="finishRrddProfile('${application.id}')">FINISH MY DRIVER PROFILE</button></div></div></section>`;
      return;
    }
    const payText=application.cash_required?'$250 CASH REQUIRED':methods.map(x=>x==='cash_app'?'Cash App':x.charAt(0).toUpperCase()+x.slice(1)).join(', ');
    $('#app').innerHTML=`<section class="sec white"><div class="w"><div class="row"><div><span class="status">PROFILE COMPLETE</span><h2>${esc(application.driver_name)}</h2><p class="muted">${esc(application.company_name)}</p></div><button class="btn ghost" onclick="logout()">Log out</button></div><div class="note good" style="margin:18px 0"><b>Congratulations — your driver profile is complete.</b> Red Rocks Designated Driver has your photos and payment preferences. Your commercial authority review controls when the profile becomes bookable.</div><div class="grid"><div class="card"><h3>Vehicle</h3><p>${esc(application.vehicle)} · capacity ${Number(application.capacity)||0}</p></div><div class="card"><h3>Day-of balance</h3><p>${esc(payText)}</p></div><div class="card"><h3>Trip pay</h3><p><b>$250 + tips</b> per completed standard trip, plus the founding bonus when eligible.</p></div></div></div></section>`;
    return;
  }

  $('#app').innerHTML=`<section class="sec white"><div class="w"><div class="card" style="max-width:650px;margin:auto;text-align:center"><h2>FINISH YOUR DRIVER APPLICATION.</h2><p>We found your Red Rocks Designated Driver login, but the earlier technical issue prevented the rest of your application from saving. The problem is fixed.</p><a class="btn red" href="#/company">COMPLETE DRIVER PROFILE</a></div></div></section>`;
};
