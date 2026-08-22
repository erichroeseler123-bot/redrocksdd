const rrddBaseLoginPage = window.loginPage;
const rrddBaseFinishDriverPage = window.finishDriverPage;

window.loginPage = function rrddLoginPage(){
  $('#app').innerHTML=`<section class="sec white"><div class="w"><div class="form" style="max-width:520px;margin:auto"><span class="status">DRIVER ACCESS</span><h2>DRIVER LOGIN</h2><div class="f"><label>Email</label><input id="le" type="email" autocomplete="email"></div><div class="f"><label>Password</label><input id="lp" type="password" autocomplete="current-password"></div><div id="lm"></div><button class="btn dark" onclick="login()">LOGIN</button><button class="btn ghost" style="margin-top:10px;width:100%" onclick="sendRrddPasswordReset('#le','#lm')">FORGOT PASSWORD?</button><p class="small muted" style="margin-top:16px">We’ll email you a secure link to choose a new password. Need help? Call or text Erich at 720-369-6292.</p></div></div></section>`;
};

window.finishDriverPage = async function finishDriverPageWithReset(){
  await rrddBaseFinishDriverPage();
  const emailInput=$('#recovery-email');
  if(!emailInput||$('#rrdd-recovery-reset'))return;
  const loginButton=emailInput.closest('.form')?.querySelector('button');
  if(loginButton){
    loginButton.insertAdjacentHTML('afterend',`<button id="rrdd-recovery-reset" class="btn ghost" style="margin-top:10px;width:100%" onclick="sendRrddPasswordReset('#recovery-email','#recovery-msg')">FORGOT PASSWORD?</button>`);
  }
};

window.sendRrddPasswordReset = async function sendRrddPasswordReset(emailSelector,msgSelector){
  const email=$(emailSelector)?.value?.trim().toLowerCase();
  if(!email||!email.includes('@'))return flash(msgSelector,'Enter the email address you used for your driver account.',true);
  flash(msgSelector,'Sending your secure password reset link…');
  const redirectTo=location.origin+'/?rrdd_password_recovery=1';
  const result=await sb.auth.resetPasswordForEmail(email,{redirectTo});
  if(result.error)return flash(msgSelector,result.error.message||'Unable to send the reset email. Please try again.',true);
  flash(msgSelector,'Check your email for a Red Rocks Designated Driver password reset link. Open it to choose a new password.');
};

window.resetPasswordPage = async function resetPasswordPage(){
  const {data:{session}}=await sb.auth.getSession();
  if(!session){
    $('#app').innerHTML=`<section class="sec white"><div class="w" style="max-width:620px"><div class="card" style="text-align:center"><span class="status">PASSWORD RESET</span><h2>OPENING YOUR SECURE RESET LINK…</h2><p class="lead">We’re verifying the password-reset link from your email.</p><div id="reset-wait-msg" class="note">If this screen does not change in a few seconds, the link may have expired. Return to <a href="#/login"><b>Driver Login</b></a> and request a new one.</div></div></div></section>`;
    return;
  }
  $('#app').innerHTML=`<section class="sec white"><div class="w" style="max-width:620px"><div class="form" style="margin:auto"><span class="status">SECURE PASSWORD RESET</span><h2>CHOOSE A NEW PASSWORD.</h2><p class="lead">Set a new password for your Red Rocks Designated Driver account.</p><div class="f"><label>New password</label><input id="rrdd-new-password" type="password" autocomplete="new-password" placeholder="At least 8 characters"></div><div class="f"><label>Confirm new password</label><input id="rrdd-confirm-password" type="password" autocomplete="new-password"></div><div id="rrdd-reset-msg"></div><button id="rrdd-reset-btn" class="btn red" onclick="saveRrddNewPassword()">SAVE NEW PASSWORD</button><p class="small muted" style="margin-top:16px">Need help? Call or text Erich at 720-369-6292 or email erichroeseler123@gmail.com.</p></div></div></section>`;
};

window.saveRrddNewPassword = async function saveRrddNewPassword(){
  const password=$('#rrdd-new-password')?.value||'';
  const confirm=$('#rrdd-confirm-password')?.value||'';
  if(password.length<8)return flash('#rrdd-reset-msg','Use a password of at least 8 characters.',true);
  if(password!==confirm)return flash('#rrdd-reset-msg','The two passwords do not match.',true);
  const btn=$('#rrdd-reset-btn');
  btn.disabled=true;btn.textContent='SAVING…';flash('#rrdd-reset-msg','Saving your new password…');
  const result=await sb.auth.updateUser({password});
  if(result.error){
    btn.disabled=false;btn.textContent='SAVE NEW PASSWORD';
    return flash('#rrdd-reset-msg',result.error.message||'Unable to update your password.',true);
  }
  history.replaceState(null,'',location.pathname+'#/dashboard');
  flash('#rrdd-reset-msg','Password updated. Opening your driver profile…');
  setTimeout(()=>{location.hash='#/dashboard';dashboardPage();},500);
};

sb.auth.onAuthStateChange((event)=>{
  if(event==='PASSWORD_RECOVERY'){
    const url=new URL(location.href);
    if(url.searchParams.get('rrdd_password_recovery')!=='1'){
      url.searchParams.set('rrdd_password_recovery','1');
      history.replaceState(null,'',url.pathname+url.search+location.hash);
    }
    setTimeout(()=>resetPasswordPage(),0);
  }
});
