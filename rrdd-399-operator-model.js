function rrddRewrite399(root=document.getElementById('app')){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
    node.nodeValue=node.nodeValue
      .replace(/\$299/g,'$399')
      .replace(/\$250/g,'$350')
      .replace(/250 per completed trip/g,'350 per completed trip')
      .replace(/250 trip pay/g,'350 trip pay');
  });
}

const rrdd399Home=window.home;
window.home=function rrdd399HomePage(){rrdd399Home();rrddRewrite399();};

const rrdd399BookPage=window.bookPage;
window.bookPage=function rrdd399BookingPage(){rrdd399BookPage();rrddRewrite399();};

const rrdd399RefreshBooking=window.refreshBooking;
window.refreshBooking=async function rrdd399BookingStatus(...args){const result=await rrdd399RefreshBooking(...args);rrddRewrite399();return result;};

const rrdd399DashboardPage=window.dashboardPage;
window.dashboardPage=async function rrdd399DriverDashboard(...args){const result=await rrdd399DashboardPage(...args);rrddRewrite399();const app=$('#app');if(app)app.innerHTML=app.innerHTML.replace(/\$100 bonus after your first completed trip\./g,'$350 + tips for every completed Red Rocks DD trip.').replace(/Standard driver account\./g,'$350 + tips per completed trip.');return result;};

const rrdd399FinishDriverPage=window.finishDriverPage;
window.finishDriverPage=async function rrdd399RecoveryPage(...args){const result=await rrdd399FinishDriverPage(...args);rrddRewrite399();return result;};

if(window.rrddRenderCodeProfile){
  const rrdd399RenderCodeProfile=window.rrddRenderCodeProfile;
  window.rrddRenderCodeProfile=function rrdd399CodeProfile(...args){const result=rrdd399RenderCodeProfile(...args);rrddRewrite399();return result;};
}

window.companyPage=async function rrdd399CompanyPage(){
  $('#app').innerHTML=`<section class="sec white"><div class="w">
    <div class="founding-banner"><div><div class="eyebrow">NOW ACCEPTING LICENSED OPERATORS & LIMO COMPANIES</div><h2>EARN $350 + TIPS FOR EVERY RED ROCKS DD TRIP.</h2><p><b>The customer pays $399 total.</b><br>Red Rocks DD collects the $49 reservation fee. Your company receives the remaining $350 on the day of service, plus any tips.</p></div><div class="founding-money">$350+<small>YOUR TRIP PAY + TIPS</small></div></div>
    <div class="season-note"><b>Chevrolet Suburbans only.</b> Individual licensed operators and established limo companies can both apply. There is no monthly fee and no app to learn.</div>
    <h2>YOUR SUBURBAN. YOUR NIGHTS. OUR CUSTOMERS.</h2>
    <p class="lead">Choose the Red Rocks nights you want to work. Pick up the group, provide the tailgate setup, remain onsite through the show, and drive the same group home afterward. Standard service window is up to 8 hours.</p>
    <div class="grid">
      <div class="card"><h3>$350 fixed operator pay</h3><p>No bidding. No percentage guessing. The customer pays $399 total; Red Rocks DD keeps the $49 reservation fee and the operator receives $350 + tips.</p></div>
      <div class="card"><h3>Limo companies welcome</h3><p>Use the company name, primary driver/contact, authority information, and one qualifying Chevrolet Suburban. We review the commercial credentials before activation.</p></div>
      <div class="card"><h3>One-step application</h3><p>Fill this out once and upload one clear Suburban photo. We save the application immediately for review. No password or email-login step.</p></div>
    </div>
    <div class="form" style="margin-top:20px">
      <div class="fg">
        <div class="f"><label>Applicant type *</label><select id="rrdd-applicant-type"><option value="limo_company">Limo / transportation company</option><option value="individual">Individual licensed operator</option></select></div>
        <div class="f"><label>Company / operator name *</label><input id="cc" placeholder="Your limo company or operating name"></div>
        <div class="f"><label>Primary driver / contact name *</label><input id="cn"></div>
        <div class="f"><label>Email *</label><input id="ce" type="email" autocomplete="email"></div>
        <div class="f"><label>Phone *</label><input id="ct" autocomplete="tel"></div>
        <div class="f"><label>License / authority # *</label><input id="cl"></div>
        <div class="f"><label>Insurance carrier</label><input id="ci"></div>
        <div class="f"><label>Trip pay</label><input value="$350 + tips" disabled></div>
        <div class="f"><label>Vehicle *</label><input id="cv" placeholder="Chevrolet Suburban"></div>
        <div class="f"><label>Passenger capacity *</label><input id="cap" type="number" min="1" max="20"></div>
        <div class="f"><label>Suburban photo *</label><input id="rrdd-vehicle-photo" type="file" accept="image/jpeg,image/png,image/webp"></div>
        <div class="f full"><label>Dates you want to work</label><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:7px;max-height:240px;overflow:auto">${days(95).map(x=>`<label style="font-weight:500"><input class="cd" type="checkbox" value="${x.v}" style="width:auto"> ${x.l}</label>`).join('')}</div></div>
      </div>
      <div style="margin:20px 0;padding:18px;border:1px solid var(--line);border-radius:12px">
        <label style="display:block;font-weight:800;margin-bottom:8px">How can the customer pay your $350 on the day of service? *</label>
        <div class="muted small" style="margin-bottom:12px">Red Rocks DD collects the separate $49 reservation fee online. The $350 operator payment is paid on the service day.</div>
        <div style="display:flex;flex-wrap:wrap;gap:14px">
          <label><input class="rrdd-pay" type="checkbox" value="cash" style="width:auto"> Cash</label>
          <label><input class="rrdd-pay" type="checkbox" value="zelle" style="width:auto"> Zelle</label>
          <label><input class="rrdd-pay" type="checkbox" value="venmo" style="width:auto"> Venmo</label>
          <label><input class="rrdd-pay" type="checkbox" value="cash_app" style="width:auto"> Cash App</label>
          <label><input class="rrdd-pay" type="checkbox" value="card" style="width:auto"> Card / card reader</label>
        </div>
        <label style="display:block;margin-top:14px"><input id="rrdd-cash-required" type="checkbox" style="width:auto"> <b>CASH REQUIRED</b> — customer must bring the $350 operator payment in cash.</label>
      </div>
      <label class="consent"><input type="checkbox" id="agree"> I confirm the applicant operates licensed commercial passenger transportation, maintains required insurance and authority, will use an approved Chevrolet Suburban, and agrees to provide the standard Red Rocks DD service.</label>
      <div id="cm"></div>
      <button id="driverSignupBtn" class="btn red" onclick="signupDriver()">SUBMIT MY OPERATOR APPLICATION</button>
      <p class="small muted" style="margin-top:16px">Individual licensed operators and limo companies are both welcome. We only need one clear vehicle photo; a face photo is not required.</p>
    </div>
  </div></section>`;
};

window.signupDriver=async function rrdd399OneStepSignup(){
  const paymentMethods=$$('.rrdd-pay:checked').map(x=>x.value);
  const cashRequired=!!$('#rrdd-cash-required')?.checked;
  if(cashRequired&&!paymentMethods.includes('cash'))paymentMethods.push('cash');
  const selectedDates=$$('.cd:checked').map(x=>x.value);
  const values={
    applicantType:$('#rrdd-applicant-type')?.value||'limo_company',
    company:$('#cc')?.value.trim()||'',name:$('#cn')?.value.trim()||'',email:($('#ce')?.value||'').trim().toLowerCase(),
    phone:$('#ct')?.value.trim()||'',license:$('#cl')?.value.trim()||'',insurance:$('#ci')?.value.trim()||'',
    vehicle:$('#cv')?.value.trim()||'',capacity:+($('#cap')?.value||0)
  };
  if(values.email.includes('@'))await rrddTrack('form_submit',null,values,{applicantType:values.applicantType,availability:selectedDates,paymentMethods,cashRequired,operatorPayCents:35000,customerTotalCents:39900});
  if(!$('#agree')?.checked){if(values.email.includes('@'))await rrddTrack('validation_failed','Licensing/service confirmation missing',values,{applicantType:values.applicantType});return flash('#cm','Please confirm the licensing and service requirements.',true);}
  if(!values.name||!values.company||!values.email||!values.phone||!values.license||!values.vehicle||!values.capacity){if(values.email.includes('@'))await rrddTrack('validation_failed','Required operator information is missing',values,{applicantType:values.applicantType});return flash('#cm','Please complete the required fields.',true);}
  if(!values.email.includes('@'))return flash('#cm','Enter a valid email address.',true);
  if(!/suburban/i.test(values.vehicle)){await rrddTrack('validation_failed','Vehicle is not a Chevrolet Suburban',values,{applicantType:values.applicantType});return flash('#cm','Red Rocks DD is currently accepting Chevrolet Suburbans only.',true);}
  if(values.capacity<1||values.capacity>20){await rrddTrack('validation_failed','Invalid passenger capacity',values,{applicantType:values.applicantType});return flash('#cm','Enter the number of passengers your Suburban can legally carry.',true);}
  if(!paymentMethods.length){await rrddTrack('validation_failed','Payment method missing',values,{applicantType:values.applicantType});return flash('#cm','Choose at least one way customers can pay your $350 operator amount.',true);}
  let vehiclePhoto=null;
  try{vehiclePhoto=await fileData('#rrdd-vehicle-photo');}catch(e){await rrddTrack('validation_failed',e.message||'Vehicle photo error',values,{applicantType:values.applicantType});return flash('#cm',e.message||'Unable to read the vehicle photo.',true);}
  if(!vehiclePhoto){await rrddTrack('validation_failed','Vehicle photo missing',values,{applicantType:values.applicantType});return flash('#cm','Upload one clear photo of the Chevrolet Suburban.',true);}

  const btn=$('#driverSignupBtn');btn.disabled=true;btn.textContent='SAVING YOUR APPLICATION…';flash('#cm','Saving your operator application…');
  const result=await sb.rpc('submit_rrdd_operator_application',{
    p_applicant_type:values.applicantType,p_driver_name:values.name,p_company_name:values.company,p_email:values.email,p_phone:values.phone,
    p_license_number:values.license,p_insurance_carrier:values.insurance||null,p_vehicle:values.vehicle,p_capacity:values.capacity,
    p_availability_dates:selectedDates,p_payment_methods:paymentMethods,p_cash_required:cashRequired,p_vehicle_photo_data_url:vehiclePhoto,p_source:'redrocksdd_operator_application'
  });
  if(result.error){await rrddTrack('application_failed',result.error.message||'Application failed',values,{applicantType:values.applicantType});btn.disabled=false;btn.textContent='SUBMIT MY OPERATOR APPLICATION';return flash('#cm',result.error.message||'Unable to submit the application.',true);}
  $('#app').innerHTML=`<section class="sec white"><div class="w" style="max-width:720px"><div class="card" style="text-align:center"><span class="status">APPLICATION RECEIVED</span><h2>YOU'RE IN THE REVIEW QUEUE.</h2><p class="lead">We saved your operator information and Chevrolet Suburban photo.</p><div class="note good" style="margin:20px 0"><b>Trip economics:</b> customer pays $399 total. Red Rocks DD collects $49. Approved operator receives $350 + tips on the service day.</div><p>We’ll review the commercial authority, insurance and vehicle information and contact you if we need anything else. You do not need to create a password or submit another application.</p><p><b>Questions?</b><br>Call or text 720-369-6292<br>erichroeseler123@gmail.com</p></div></div></section>`;
};
