window.finishDriverPage = async function finishDriverPage(){
  const requestedEmail=(params().get('email')||'').trim().toLowerCase();
  const {data:{user}}=await sb.auth.getUser();

  if(!user){
    $('#app').innerHTML=`<section class="sec white"><div class="w" style="max-width:720px"><div class="card"><span class="status">DRIVER PROFILE RECOVERY</span><h2>FINISH YOUR RED ROCKS DESIGNATED DRIVER PROFILE.</h2><p class="lead">A technical error during our original signup process created your driver login but prevented the rest of your profile from saving. The problem is fixed.</p><p><b>You do not need to apply again.</b> Sign in with the email and password you used before, and we’ll take you directly to the information and photos we still need.</p><div class="form" style="margin-top:22px"><div class="f"><label>Email</label><input id="recovery-email" type="email" value="${esc(requestedEmail)}"></div><div class="f"><label>Password you created</label><input id="recovery-password" type="password"></div><div id="recovery-msg"></div><button class="btn red" onclick="rrddRecoveryLogin()">CONTINUE MY DRIVER PROFILE</button></div><p class="small muted" style="margin-top:18px">Questions? Call or text Erich at 720-369-6292 or email erichroeseler123@gmail.com.</p></div></div></section>`;
    return;
  }

  const email=(user.email||'').trim().toLowerCase();
  const existing=(await sb.from('rrdd_driver_applications')
    .select('id,driver_photo_path,vehicle_photo_path,profile_completed_at')
    .eq('email',email)
    .order('created_at',{ascending:false})
    .limit(1)
    .maybeSingle()).data;

  if(existing){
    location.hash='#/dashboard';
    return;
  }

  $('#app').innerHTML=`<section class="sec white"><div class="w" style="max-width:820px"><div class="card"><span class="status">APPROVED TO CONTINUE</span><h2>FINISH YOUR DRIVER PROFILE.</h2><p class="lead">We found your original Red Rocks Designated Driver login. The earlier technical error prevented the details below from being saved, so we need you to enter them one more time.</p><div class="note good"><b>Your founding-driver spot is being held.</b> Complete this page and upload the two photos so we can finish your profile.</div><div class="form" style="margin-top:20px"><div class="fg"><div class="f"><label>Email</label><input value="${esc(email)}" disabled></div><div class="f"><label>Driver name *</label><input id="recover-name"></div><div class="f"><label>Company *</label><input id="recover-company"></div><div class="f"><label>Phone *</label><input id="recover-phone"></div><div class="f"><label>License / authority # *</label><input id="recover-license"></div><div class="f"><label>Insurance carrier</label><input id="recover-insurance"></div><div class="f"><label>Vehicle make/model *</label><input id="recover-vehicle" placeholder="Chevrolet Suburban"></div><div class="f"><label>Passenger capacity *</label><input id="recover-capacity" type="number" min="1" max="20"></div><div class="f"><label>Your photo *</label><input id="recover-driver-photo" type="file" accept="image/jpeg,image/png,image/webp"></div><div class="f"><label>Vehicle photo *</label><input id="recover-vehicle-photo" type="file" accept="image/jpeg,image/png,image/webp"></div><div class="f full"><label>Dates you want to work</label><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:7px;max-height:220px;overflow:auto">${days(95).map(x=>`<label style="font-weight:500"><input class="recover-date" type="checkbox" value="${x.v}" style="width:auto"> ${x.l}</label>`).join('')}</div></div></div><div style="margin:20px 0;padding:18px;border:1px solid var(--line);border-radius:12px"><label style="display:block;font-weight:800;margin-bottom:8px">How can customers pay your $250 balance on the day of service? *</label><div class="muted small" style="margin-bottom:12px">Red Rocks Designated Driver collects the $49 reservation fee online. The customer pays the remaining $250 to you on the service day.</div><div style="display:flex;flex-wrap:wrap;gap:14px"><label><input class="recover-pay" type="checkbox" value="cash" style="width:auto"> Cash</label><label><input class="recover-pay" type="checkbox" value="zelle" style="width:auto"> Zelle</label><label><input class="recover-pay" type="checkbox" value="venmo" style="width:auto"> Venmo</label><label><input class="recover-pay" type="checkbox" value="cash_app" style="width:auto"> Cash App</label><label><input class="recover-pay" type="checkbox" value="card" style="width:auto"> Card / card reader</label></div><label style="display:block;margin-top:14px"><input id="recover-cash-required" type="checkbox" style="width:auto"> <b>CASH REQUIRED</b> — customer must bring the $250 balance in cash.</label></div><label class="consent"><input type="checkbox" id="recover-agree"> I confirm I operate licensed commercial passenger transportation, maintain required insurance and authority, and agree to provide the standard Red Rocks Designated Driver service.</label><div id="recover-save-msg"></div><button id="recover-save-btn" class="btn red" onclick="saveRecoveredRrddProfile()">UPLOAD PHOTOS & FINISH MY PROFILE</button></div><p class="small muted" style="margin-top:18px">Need help? Call or text Erich at 720-369-6292 or email erichroeseler123@gmail.com.</p></div></div></section>`;
};

window.rrddRecoveryLogin = async function rrddRecoveryLogin(){
  const email=$('#recovery-email').value.trim().toLowerCase();
  const password=$('#recovery-password').value;
  if(!email||password.length<6)return flash('#recovery-msg','Enter the email and password you used when you first signed up.',true);
  flash('#recovery-msg','Checking your driver account…');
  const login=await sb.auth.signInWithPassword({email,password});
  if(!login.error){
    finishDriverPage();
    return;
  }
  const msg=(login.error.message||'').toLowerCase();
  if(msg.includes('email not confirmed')){
    const returnUrl=location.origin+'/#/finish-profile?email='+encodeURIComponent(email);
    const resent=await sb.auth.resend({type:'signup',email,options:{emailRedirectTo:returnUrl}});
    if(resent.error)return flash('#recovery-msg','Your account still needs email confirmation. Please contact Erich at 720-369-6292 and we’ll get you in.',true);
    return flash('#recovery-msg','We sent you a new confirmation email. Confirm it, then return to this page and continue your profile.');
  }
  flash('#recovery-msg','We found the signup email, but that password did not sign you in. Try the password you created originally, or call/text Erich at 720-369-6292 for help.',true);
};

window.saveRecoveredRrddProfile = async function saveRecoveredRrddProfile(){
  const {data:{user}}=await sb.auth.getUser();
  if(!user)return location.hash='#/finish-profile';
  if(!$('#recover-agree').checked)return flash('#recover-save-msg','Please confirm the licensing and service requirements.',true);

  const values={
    name:$('#recover-name').value.trim(),
    company:$('#recover-company').value.trim(),
    phone:$('#recover-phone').value.trim(),
    license:$('#recover-license').value.trim(),
    insurance:$('#recover-insurance').value.trim(),
    vehicle:$('#recover-vehicle').value.trim(),
    capacity:+$('#recover-capacity').value
  };
  if(!values.name||!values.company||!values.phone||!values.license||!values.vehicle||!values.capacity)return flash('#recover-save-msg','Please complete the required fields.',true);
  if(values.capacity<1||values.capacity>20)return flash('#recover-save-msg','Enter the number of passengers your vehicle can legally carry.',true);

  const methods=$$('.recover-pay:checked').map(x=>x.value);
  const cashRequired=!!$('#recover-cash-required').checked;
  if(cashRequired&&!methods.includes('cash'))methods.push('cash');
  if(!methods.length)return flash('#recover-save-msg','Choose at least one way customers can pay your $250 balance.',true);

  const driverFile=$('#recover-driver-photo').files?.[0];
  const vehicleFile=$('#recover-vehicle-photo').files?.[0];
  if(!driverFile||!vehicleFile)return flash('#recover-save-msg','Please upload one photo of yourself and one photo of your vehicle.',true);

  const dates=$$('.recover-date:checked').map(x=>x.value);
  const btn=$('#recover-save-btn');
  btn.disabled=true;btn.textContent='UPLOADING & SAVING…';flash('#recover-save-msg','Uploading your photos and finishing your profile…');
  try{
    const [driverPath,vehiclePath]=await Promise.all([
      rrddUploadPhoto(user,driverFile,'driver'),
      rrddUploadPhoto(user,vehicleFile,'vehicle')
    ]);
    const saved=await sb.from('rrdd_driver_applications').insert({
      driver_name:values.name,
      company_name:values.company,
      email:(user.email||'').trim().toLowerCase(),
      phone:values.phone,
      license_number:values.license,
      insurance_carrier:values.insurance||null,
      vehicle:values.vehicle,
      capacity:values.capacity,
      availability_dates:dates,
      payment_methods:methods,
      cash_required:cashRequired,
      driver_photo_path:driverPath,
      vehicle_photo_path:vehiclePath,
      profile_completed_at:new Date().toISOString(),
      status:'review_pending',
      source:'redrocksdd_driver_signup'
    });
    if(saved.error)throw saved.error;
    $('#app').innerHTML=`<section class="sec white"><div class="w" style="max-width:700px"><div class="card" style="text-align:center"><span class="status">PROFILE COMPLETE</span><h2>WELCOME TO RED ROCKS DESIGNATED DRIVER.</h2><p class="lead">Your driver information, photos, availability and payment preferences are saved.</p><p>We’ll finish the commercial-authority review and contact you if we need anything else.</p><p><b>Questions?</b><br>Call or text 720-369-6292<br>erichroeseler123@gmail.com</p><a class="btn dark" href="#/dashboard">OPEN DRIVER DASHBOARD</a></div></div></section>`;
  }catch(e){
    btn.disabled=false;btn.textContent='UPLOAD PHOTOS & FINISH MY PROFILE';
    flash('#recover-save-msg',e.message||'Unable to finish your profile. Please try again or contact Erich.',true);
  }
};
