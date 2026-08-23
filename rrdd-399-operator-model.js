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

window.companyPage=async function rrdd399CompanyPage(){
  $('#app').innerHTML=`<section class="sec white"><div class="w">
    <div class="founding-banner"><div><div class="eyebrow">NOW ACCEPTING LICENSED OPERATORS & LIMO COMPANIES</div><h2>EARN $350 + TIPS FOR EVERY RED ROCKS DD TRIP.</h2><p><b>The customer pays $399 total.</b><br>Red Rocks DD collects the $49 reservation fee. Your company receives the remaining $350 on the day of service, plus any tips.</p></div><div class="founding-money">$350+<small>YOUR TRIP PAY + TIPS</small></div></div>
    <div class="season-note"><b>Chevrolet Suburbans only.</b> We are keeping the service standardized around one premium vehicle type. Individual licensed operators and established limo companies can both apply.</div>
    <h2>YOUR SUBURBAN. YOUR NIGHTS. OUR CUSTOMERS.</h2>
    <p class="lead">Choose the Red Rocks nights you want to work. Pick up the group, provide the tailgate setup, remain onsite through the show, and drive the same group home afterward. Standard service window is up to 8 hours.</p>
    <div class="grid">
      <div class="card"><h3>$350 fixed operator pay</h3><p>No bidding. No percentage guessing. The customer pays $399 total; Red Rocks DD keeps the $49 reservation fee and the operator receives $350 + tips.</p></div>
      <div class="card"><h3>Limo companies welcome</h3><p>A company can sign up using its business name, licensed driver/contact, authority information, and qualifying Chevrolet Suburban.</p></div>
      <div class="card"><h3>Suburbans only</h3><p>We are currently accepting Chevrolet Suburbans only. Vehicle approval is required before trips are assigned.</p></div>
    </div>
    <div class="form" style="margin-top:20px">
      <div class="fg">
        <div class="f"><label>Company / operator name *</label><input id="cc" placeholder="Your limo company or operating name"></div>
        <div class="f"><label>Primary driver / contact name *</label><input id="cn"></div>
        <div class="f"><label>Email *</label><input id="ce" type="email"></div>
        <div class="f"><label>Phone *</label><input id="ct"></div>
        <div class="f"><label>License / authority # *</label><input id="cl"></div>
        <div class="f"><label>Insurance carrier</label><input id="ci"></div>
        <div class="f"><label>Trip pay</label><input value="$350 + tips" disabled></div>
        <div class="f"><label>Vehicle *</label><input id="cv" placeholder="Chevrolet Suburban"></div>
        <div class="f"><label>Passenger capacity *</label><input id="cap" type="number" min="1" max="20"></div>
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
      <button id="driverSignupBtn" class="btn red" onclick="signupDriver()">APPLY AS A RED ROCKS DD OPERATOR</button>
      <p class="small muted" style="margin-top:16px">Individual licensed drivers and limo companies are both welcome to apply. No monthly fee and no app to learn.</p>
    </div>
  </div></section>`;
};

const rrdd399SignupDriver=window.signupDriver;
window.signupDriver=async function rrdd399SuburbanSignup(){
  const vehicle=($('#cv')?.value||'').trim();
  if(vehicle && !/suburban/i.test(vehicle)){
    await rrddTrack('validation_failed','Vehicle is not a Chevrolet Suburban',{email:($('#ce')?.value||'').trim().toLowerCase(),name:$('#cn')?.value.trim()||'',company:$('#cc')?.value.trim()||'',phone:$('#ct')?.value.trim()||'',license:$('#cl')?.value.trim()||'',insurance:$('#ci')?.value.trim()||'',vehicle,capacity:+($('#cap')?.value||0)},{operatorPayCents:35000,customerTotalCents:39900});
    return flash('#cm','Red Rocks DD is currently accepting Chevrolet Suburbans only.',true);
  }
  return rrdd399SignupDriver();
};
