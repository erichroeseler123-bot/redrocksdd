const rrddPreviousCompanyPage = window.companyPage;

window.companyPage = async function professionalCompanyPage(){
  await rrddPreviousCompanyPage();
  const passwordInput=$('#cp');
  if(passwordInput){
    const wrap=passwordInput.closest('.f');
    if(wrap)wrap.remove();
  }
  const note=$('#cm');
  const button=$('#driverSignupBtn') || document.querySelector('button[onclick="signupDriver()"]');
  if(button){
    button.textContent='SAVE MY APPLICATION & EMAIL ME ACCESS';
    button.id='driverSignupBtn';
  }
  if(note && !$('#rrdd-access-note')){
    note.insertAdjacentHTML('beforebegin',`<div id="rrdd-access-note" class="note good" style="margin:18px 0"><b>No password to remember.</b> We save your application first, then email you a secure access link. If anything goes wrong, your contact and vehicle information are still preserved so we can help you finish.</div>`);
  }
};

async function rrddTrack(stage,error,values,extra={}){
  if(!values?.email || !values.email.includes('@'))return;
  try{
    await sb.rpc('save_driver_signup_recovery',{
      p_program:'rrdd',p_email:values.email,p_full_name:values.name||null,p_phone:values.phone||null,
      p_company_name:values.company||null,p_license_number:values.license||null,p_insurance_carrier:values.insurance||null,
      p_island_served:null,p_vehicle:values.vehicle||null,p_vehicle_capacity:values.capacity||null,p_driver_price_cents:null,
      p_availability:extra.availability||{},p_payment_methods:extra.paymentMethods||[],p_cash_required:!!extra.cashRequired,
      p_stage:stage,p_last_error:error||null,p_source:'redrocksdd_driver_signup',p_extra:extra,p_completed:stage==='profile_complete'
    });
  }catch(_e){}
}

window.signupDriver = async function professionalRrddSignup(){
  const agree=$('#agree');
  if(!agree?.checked)return flash('#cm','Please confirm the licensing and service requirements.',true);
  const paymentMethods=$$('.rrdd-pay:checked').map(x=>x.value);
  const cashRequired=!!$('#rrdd-cash-required')?.checked;
  if(cashRequired&&!paymentMethods.includes('cash'))paymentMethods.push('cash');
  if(!paymentMethods.length)return flash('#cm','Please choose at least one way customers can pay your $250 balance.',true);

  const values={
    company:$('#cc')?.value.trim()||'',name:$('#cn')?.value.trim()||'',email:($('#ce')?.value||'').trim().toLowerCase(),
    phone:$('#ct')?.value.trim()||'',license:$('#cl')?.value.trim()||'',insurance:$('#ci')?.value.trim()||'',
    vehicle:$('#cv')?.value.trim()||'',capacity:+($('#cap')?.value||0)
  };
  const selectedDates=$$('.cd:checked').map(x=>x.value);

  if(!values.name||!values.company||!values.email||!values.phone||!values.license||!values.vehicle||!values.capacity){
    await rrddTrack('validation_failed','Required driver information is missing',values,{availability:selectedDates,paymentMethods,cashRequired});
    return flash('#cm','Please complete the required fields.',true);
  }
  if(!values.email.includes('@'))return flash('#cm','Enter a valid email address.',true);
  if(values.capacity<1||values.capacity>20)return flash('#cm','Enter the number of passengers your vehicle can legally carry.',true);

  const btn=$('#driverSignupBtn');
  if(btn){btn.disabled=true;btn.textContent='SAVING YOUR APPLICATION…';}
  flash('#cm','Saving your application before we create access…');

  await rrddTrack('form_submitted',null,values,{availability:selectedDates,paymentMethods,cashRequired});
  try{
    const saved=await sb.rpc('submit_rrdd_driver_application',{
      p_driver_name:values.name,p_company_name:values.company,p_email:values.email,p_phone:values.phone,
      p_license_number:values.license,p_insurance_carrier:values.insurance||null,p_vehicle:values.vehicle,p_capacity:values.capacity,
      p_availability_dates:selectedDates,p_payment_methods:paymentMethods,p_cash_required:cashRequired,p_source:'redrocksdd_driver_signup'
    });
    if(saved.error)throw saved.error;

    if(btn)btn.textContent='EMAILING YOUR SECURE ACCESS LINK…';
    flash('#cm','Application saved. Sending your secure driver access link…');
    const access=await sb.auth.signInWithOtp({
      email:values.email,
      options:{emailRedirectTo:location.origin+'/?driver_access=1',shouldCreateUser:true}
    });
    if(access.error){
      await rrddTrack('access_email_failed',access.error.message,values,{applicationId:saved.data,availability:selectedDates,paymentMethods,cashRequired});
      if(btn){btn.disabled=false;btn.textContent='EMAIL MY ACCESS LINK AGAIN';}
      return flash('#cm','Your application is safely saved. We could not send the access email just now. Try again or contact us and we can recover your application.',true);
    }
    await rrddTrack('access_email_sent',null,values,{applicationId:saved.data,availability:selectedDates,paymentMethods,cashRequired});
    $('#app').innerHTML=`<section class="sec white"><div class="w" style="max-width:700px"><div class="card" style="text-align:center"><span class="status">APPLICATION SAVED</span><h2>CHECK YOUR EMAIL.</h2><p class="lead">We saved your driver application before sending the access link.</p><p>Open the secure Red Rocks DD email sent to <b>${esc(values.email)}</b>. You will return here to add one clear vehicle photo and finish your profile.</p><div class="note good" style="margin:20px 0"><b>You will not have to start over.</b> Your contact, company, authority, vehicle, dates and payment preferences are saved.</div><a class="btn dark" href="#/login">DRIVER ACCESS</a></div></div></section>`;
  }catch(e){
    await rrddTrack('application_save_failed',e.message||'Unable to save application',values,{availability:selectedDates,paymentMethods,cashRequired});
    if(btn){btn.disabled=false;btn.textContent='SAVE MY APPLICATION & EMAIL ME ACCESS';}
    flash('#cm','We kept your recovery record, but the application could not be finalized. Please try again or contact us so we can finish it with you.',true);
  }
};

window.loginPage = function professionalRrddLoginPage(){
  $('#app').innerHTML=`<section class="sec white"><div class="w" style="max-width:600px"><div class="form" style="margin:auto"><span class="status">SECURE DRIVER ACCESS</span><h2>OPEN YOUR DRIVER PROFILE.</h2><p class="lead">Enter the email you used when you applied. We’ll send a secure sign-in link — no password required.</p><div class="f"><label>Email</label><input id="le" type="email" autocomplete="email" placeholder="you@example.com"></div><div id="lm"></div><button id="rrdd-email-access" class="btn dark" onclick="login()">EMAIL ME A SECURE ACCESS LINK</button><p class="small muted" style="margin-top:16px">Already applied? Use the same email. We preserve incomplete applications and will take you back to the next step instead of making you start over.</p></div></div></section>`;
};

window.login = async function professionalRrddLogin(){
  const email=($('#le')?.value||'').trim().toLowerCase();
  if(!email||!email.includes('@'))return flash('#lm','Enter the email address you used for your driver application.',true);
  const btn=$('#rrdd-email-access');if(btn){btn.disabled=true;btn.textContent='SENDING…';}
  flash('#lm','Sending your secure access link…');
  await rrddTrack('access_requested',null,{email},{source:'driver_login'});
  const result=await sb.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+'/?driver_access=1',shouldCreateUser:false}});
  if(result.error){
    await rrddTrack('access_request_failed',result.error.message,{email},{source:'driver_login'});
    if(btn){btn.disabled=false;btn.textContent='EMAIL ME A SECURE ACCESS LINK';}
    return flash('#lm','We could not send the access link. If you have not applied yet, use Drive Red Rocks first. If you already applied, contact us and we can recover your record.',true);
  }
  flash('#lm','Check your email. Open the secure Red Rocks DD link to continue your driver profile.');
};

window.finishDriverPage = async function professionalFinishDriverPage(){
  const requestedEmail=(params().get('email')||'').trim().toLowerCase();
  const {data:{user}}=await sb.auth.getUser();
  if(!user){
    $('#app').innerHTML=`<section class="sec white"><div class="w" style="max-width:650px"><div class="form" style="margin:auto"><span class="status">DRIVER PROFILE RECOVERY</span><h2>CONTINUE YOUR DRIVER PROFILE.</h2><p class="lead">Enter the email you used before. We’ll send a secure access link. You do not need your old password and you do not need to apply again.</p><div class="f"><label>Email</label><input id="le" type="email" value="${esc(requestedEmail)}"></div><div id="lm"></div><button id="rrdd-email-access" class="btn dark" onclick="login()">EMAIL ME A SECURE ACCESS LINK</button></div></div></section>`;
    return;
  }
  const email=(user.email||'').trim().toLowerCase();
  await rrddTrack('access_confirmed',null,{email},{authUserId:user.id});
  const existing=(await sb.from('rrdd_driver_applications').select('id').eq('email',email).order('created_at',{ascending:false}).limit(1).maybeSingle()).data;
  location.hash=existing?'#/dashboard':'#/company';
};

sb.auth.onAuthStateChange((event,session)=>{
  if(event==='SIGNED_IN' && session?.user){
    const url=new URL(location.href);
    if(url.searchParams.get('driver_access')==='1'){
      url.searchParams.delete('driver_access');
      history.replaceState(null,'',url.pathname+(url.search||'')+'#/dashboard');
      setTimeout(()=>dashboardPage(),0);
    }
  }
});
