function rrddOperatorEconomics(type){
  const limo=type==='limo_company';
  return {pay:limo?35000:25000,total:limo?39900:29900,limo};
}

window.rrddUpdateApplicantEconomics=function rrddUpdateApplicantEconomics(){
  const type=$('#rrdd-applicant-type')?.value||'limo_company';
  const e=rrddOperatorEconomics(type);
  const pay=$('#rrdd-trip-pay'); if(pay) pay.value=`$${e.pay/100} + tips`;
  const paymentLabel=$('#rrdd-payment-label'); if(paymentLabel) paymentLabel.textContent=`How can the customer pay your $${e.pay/100} on the day of service? *`;
  const paymentNote=$('#rrdd-payment-note'); if(paymentNote) paymentNote.textContent=`Red Rocks DD collects the separate $49 reservation fee online. The $${e.pay/100} operator payment is paid on the service day.`;
  const cashLabel=$('#rrdd-cash-label'); if(cashLabel) cashLabel.textContent=`CASH REQUIRED — customer must bring the $${e.pay/100} operator payment in cash.`;
};

window.companyPage=async function rrddSplitCompanyPage(){
  $('#app').innerHTML=`<section class="sec white"><div class="w">
    <div class="founding-banner"><div><div class="eyebrow">NOW ACCEPTING LICENSED OPERATORS & LIMO COMPANIES</div><h2>LIMO COMPANIES: EARN $350 + TIPS.</h2><p><b>Limo-company trip: customer pays $399 total.</b><br>Red Rocks DD collects the $49 reservation fee. The limo company receives $350 on the day of service, plus tips.</p></div><div class="founding-money">$350+<small>LIMO COMPANY PAY + TIPS</small></div></div>
    <div class="season-note"><b>Chevrolet Suburbans only.</b> Individual licensed operators can still apply under the standard $250 + tips driver rate. Established limo/transportation companies qualify for $350 + tips.</div>
    <h2>YOUR SUBURBAN. YOUR NIGHTS. OUR CUSTOMERS.</h2>
    <p class="lead">Choose the Red Rocks nights you want to work. Pick up the group, provide the tailgate setup, remain onsite through the show, and drive the same group home afterward. Standard service window is up to 8 hours.</p>
    <div class="grid">
      <div class="card"><h3>Limo company: $350 + tips</h3><p>Customer total is $399: $49 reservation fee to Red Rocks DD and $350 paid to the limo company on the service day.</p></div>
      <div class="card"><h3>Individual driver: $250 + tips</h3><p>Individual licensed operators remain on the standard $299 customer trip: $49 reservation fee and $250 day-of operator payment.</p></div>
      <div class="card"><h3>One-step application</h3><p>Choose your applicant type, enter your commercial credentials, and upload one clear Chevrolet Suburban photo. No password or email-login step.</p></div>
    </div>
    <div class="form" style="margin-top:20px"><div class="fg">
      <div class="f"><label>Applicant type *</label><select id="rrdd-applicant-type" onchange="rrddUpdateApplicantEconomics()"><option value="limo_company">Limo / transportation company — $350 + tips</option><option value="individual">Individual licensed operator — $250 + tips</option></select></div>
      <div class="f"><label>Company / operator name *</label><input id="cc" placeholder="Your limo company or operating name"></div>
      <div class="f"><label>Primary driver / contact name *</label><input id="cn"></div>
      <div class="f"><label>Email *</label><input id="ce" type="email" autocomplete="email"></div>
      <div class="f"><label>Phone *</label><input id="ct" autocomplete="tel"></div>
      <div class="f"><label>License / authority # *</label><input id="cl"></div>
      <div class="f"><label>Insurance carrier</label><input id="ci"></div>
      <div class="f"><label>Trip pay</label><input id="rrdd-trip-pay" value="$350 + tips" disabled></div>
      <div class="f"><label>Vehicle *</label><input id="cv" placeholder="Chevrolet Suburban"></div>
      <div class="f"><label>Passenger capacity *</label><input id="cap" type="number" min="1" max="20"></div>
      <div class="f"><label>Suburban photo *</label><input id="rrdd-vehicle-photo" type="file" accept="image/jpeg,image/png,image/webp"></div>
      <div class="f full"><label>Dates you want to work</label><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:7px;max-height:240px;overflow:auto">${days(95).map(x=>`<label style="font-weight:500"><input class="cd" type="checkbox" value="${x.v}" style="width:auto"> ${x.l}</label>`).join('')}</div></div>
    </div>
    <div style="margin:20px 0;padding:18px;border:1px solid var(--line);border-radius:12px"><label id="rrdd-payment-label" style="display:block;font-weight:800;margin-bottom:8px">How can the customer pay your $350 on the day of service? *</label><div id="rrdd-payment-note" class="muted small" style="margin-bottom:12px">Red Rocks DD collects the separate $49 reservation fee online. The $350 operator payment is paid on the service day.</div><div style="display:flex;flex-wrap:wrap;gap:14px"><label><input class="rrdd-pay" type="checkbox" value="cash" style="width:auto"> Cash</label><label><input class="rrdd-pay" type="checkbox" value="zelle" style="width:auto"> Zelle</label><label><input class="rrdd-pay" type="checkbox" value="venmo" style="width:auto"> Venmo</label><label><input class="rrdd-pay" type="checkbox" value="cash_app" style="width:auto"> Cash App</label><label><input class="rrdd-pay" type="checkbox" value="card" style="width:auto"> Card / card reader</label></div><label style="display:block;margin-top:14px"><input id="rrdd-cash-required" type="checkbox" style="width:auto"> <b id="rrdd-cash-label">CASH REQUIRED — customer must bring the $350 operator payment in cash.</b></label></div>
    <label class="consent"><input type="checkbox" id="agree"> I confirm the applicant operates licensed commercial passenger transportation, maintains required insurance and authority, will use an approved Chevrolet Suburban, and agrees to provide the standard Red Rocks DD service.</label><div id="cm"></div><button id="driverSignupBtn" class="btn red" onclick="signupDriver()">SUBMIT MY OPERATOR APPLICATION</button><p class="small muted" style="margin-top:16px">We only need one clear vehicle photo; a face photo is not required.</p></div>
  </div></section>`;
};

window.signupDriver=async function rrddSplitOneStepSignup(){
  const paymentMethods=$$('.rrdd-pay:checked').map(x=>x.value),cashRequired=!!$('#rrdd-cash-required')?.checked;if(cashRequired&&!paymentMethods.includes('cash'))paymentMethods.push('cash');
  const selectedDates=$$('.cd:checked').map(x=>x.value),applicantType=$('#rrdd-applicant-type')?.value||'limo_company',e=rrddOperatorEconomics(applicantType);
  const values={applicantType,company:$('#cc')?.value.trim()||'',name:$('#cn')?.value.trim()||'',email:($('#ce')?.value||'').trim().toLowerCase(),phone:$('#ct')?.value.trim()||'',license:$('#cl')?.value.trim()||'',insurance:$('#ci')?.value.trim()||'',vehicle:$('#cv')?.value.trim()||'',capacity:+($('#cap')?.value||0)};
  if(!$('#agree')?.checked)return flash('#cm','Please confirm the licensing and service requirements.',true);
  if(!values.name||!values.company||!values.email||!values.phone||!values.license||!values.vehicle||!values.capacity)return flash('#cm','Please complete the required fields.',true);
  if(!values.email.includes('@'))return flash('#cm','Enter a valid email address.',true);
  if(!/suburban/i.test(values.vehicle))return flash('#cm','Red Rocks DD is currently accepting Chevrolet Suburbans only.',true);
  if(values.capacity<1||values.capacity>20)return flash('#cm','Enter the number of passengers your Suburban can legally carry.',true);
  if(!paymentMethods.length)return flash('#cm',`Choose at least one way customers can pay your $${e.pay/100} operator amount.`,true);
  let vehiclePhoto=null;try{vehiclePhoto=await fileData('#rrdd-vehicle-photo')}catch(err){return flash('#cm',err.message||'Unable to read the vehicle photo.',true)}if(!vehiclePhoto)return flash('#cm','Upload one clear photo of the Chevrolet Suburban.',true);
  const btn=$('#driverSignupBtn');btn.disabled=true;btn.textContent='SAVING YOUR APPLICATION…';
  const result=await sb.rpc('submit_rrdd_operator_application',{p_applicant_type:applicantType,p_driver_name:values.name,p_company_name:values.company,p_email:values.email,p_phone:values.phone,p_license_number:values.license,p_insurance_carrier:values.insurance||null,p_vehicle:values.vehicle,p_capacity:values.capacity,p_availability_dates:selectedDates,p_payment_methods:paymentMethods,p_cash_required:cashRequired,p_vehicle_photo_data_url:vehiclePhoto,p_source:'redrocksdd_operator_application'});
  if(result.error){btn.disabled=false;btn.textContent='SUBMIT MY OPERATOR APPLICATION';return flash('#cm',result.error.message||'Unable to submit the application.',true)}
  $('#app').innerHTML=`<section class="sec white"><div class="w" style="max-width:720px"><div class="card" style="text-align:center"><span class="status">APPLICATION RECEIVED</span><h2>YOU'RE IN THE REVIEW QUEUE.</h2><p class="lead">We saved your operator information and Chevrolet Suburban photo.</p><div class="note good" style="margin:20px 0"><b>${e.limo?'Limo-company':'Individual-driver'} economics:</b> customer pays $${e.total/100} total. Red Rocks DD collects $49. Approved operator receives $${e.pay/100} + tips on the service day.</div><p>We’ll review the commercial authority, insurance and vehicle information and contact you if we need anything else.</p></div></div></section>`;
};
