const rrddOriginalDashboardPage = window.dashboardPage;

window.signupDriver = async function signupDriverFixed(){
  if(!$('#agree').checked)return flash('#cm','Please confirm the licensing and service requirements.',true);

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
    // Save the business application first. This intake table permits INSERT only
    // for public applicants, so email confirmation can never erase the lead.
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
        ? 'Your driver login is ready. You can sign in now.'
        : 'Check your email to confirm your driver login. Your application is already safely in our review queue.';
    }else if(auth.error){
      accountMessage='Your application is safely saved. If this email already has a Red Rocks DD account, use Driver Login; otherwise we’ll contact you to finish account access.';
    }

    $('#app').innerHTML=`<section class="sec white"><div class="w"><div class="card" style="max-width:650px;margin:auto;text-align:center"><span class="status">APPLICATION RECEIVED</span><h2>YOU'RE IN THE REVIEW QUEUE.</h2><p class="lead">We saved your name, company, contact information, commercial authority, vehicle and selected work dates.</p><p>${esc(accountMessage)}</p><p>We’ll verify your commercial authority before your profile becomes bookable.</p><a class="btn dark" href="#/login">DRIVER LOGIN</a></div></div></section>`;
  }catch(e){
    btn.disabled=false;
    btn.textContent='JOIN RED ROCKS DD';
    flash('#cm',e.message||'Unable to save your application. Please try again.',true);
  }
};

window.dashboardPage = async function dashboardPageFixed(){
  const {data:{user}}=await sb.auth.getUser();
  if(!user){location.hash='#/login';return;}

  const op=(await sb.from('caddy_operators').select('id').eq('user_id',user.id).maybeSingle()).data;
  if(op&&rrddOriginalDashboardPage)return rrddOriginalDashboardPage();

  const email=(user.email||'').trim().toLowerCase();
  const application=(await sb.from('rrdd_driver_applications')
    .select('driver_name,company_name,vehicle,capacity,status,created_at')
    .eq('email',email)
    .order('created_at',{ascending:false})
    .limit(1)
    .maybeSingle()).data;

  if(application){
    $('#app').innerHTML=`<section class="sec white"><div class="w"><div class="row"><div><span class="status">APPLICATION RECEIVED</span><h2>${esc(application.driver_name)}</h2><p class="muted">${esc(application.company_name)}</p></div><button class="btn ghost" onclick="logout()">Log out</button></div><div class="note good" style="margin:18px 0"><b>Your application is safely in the review queue.</b> We’re verifying your commercial authority before your driver profile becomes bookable.</div><div class="grid"><div class="card"><h3>Vehicle</h3><p>${esc(application.vehicle)} · capacity ${Number(application.capacity)||0}</p></div><div class="card"><h3>Status</h3><p>${esc((application.status||'review_pending').replaceAll('_',' '))}</p></div><div class="card"><h3>Pay</h3><p><b>$250 + tips</b> per completed Red Rocks DD trip. Founding-driver bonus eligibility is confirmed during review.</p></div></div></div></section>`;
    return;
  }

  $('#app').innerHTML=`<section class="sec white"><div class="w"><div class="card" style="max-width:650px;margin:auto;text-align:center"><h2>NO DRIVER APPLICATION FOUND.</h2><p>This login is not attached to a Red Rocks DD application yet.</p><a class="btn red" href="#/company">COMPLETE DRIVER APPLICATION</a></div></div></section>`;
};
