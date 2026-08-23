window.refreshBooking=async function rrddSplitRefreshBooking(id,token,paymentFlag){
  const z=await sb.rpc('get_red_rocks_dd_request',{p_request_id:id,p_guest_token:token});
  const r=z.data?.[0];
  if(z.error||!r){$('#bookingcard').innerHTML='<h2>BOOKING NOT FOUND</h2>';clearInterval(poll);return}
  const paid=r.reservation_fee_status==='paid';
  const s=r.status==='requested'?(paid?'matching':'reserved'):r.status==='accepted'?'assigned':r.status;
  const operatorPay=Number(r.operator_price_cents)||25000;
  const total=operatorPay+Number(r.reservation_fee_cents||4900);
  let title=statusLabel(s).toUpperCase(),text='',action='';
  if(!paid){text='Your reservation exists, but the $49 reservation checkout is not complete.';action=`<button class="btn red" onclick="payExisting('${id}','${token}')">PAY $49 RESERVATION</button>`}
  else if(['reserved','matching','requested'].includes(s)){text='Your $49 reservation is paid and your trip is reserved.'}
  else if(['assigned','accepted'].includes(s)){text=`${esc(r.driver_name||'Your DD')} has been assigned. We are finalizing the trip details.`}
  else if(s==='confirmed'){text=`Your Red Rocks DD is confirmed with ${esc(r.driver_name||'your assigned driver')}. The $${operatorPay/100} operator balance is due on the day of service.`}
  else if(s==='completed'){text='Trip completed. Thank you for using Red Rocks DD.';action=`<button class="btn dark" onclick="showReview('${id}','${token}')">Review My DD</button>`;clearInterval(poll)}
  else if(s==='refunded'){text='This reservation was refunded.';clearInterval(poll)}
  else if(s==='cancelled'){text='This reservation was cancelled.';clearInterval(poll)}
  else{text='Your booking is being handled by Red Rocks DD.'}
  if(paymentFlag==='success'&&paid)text='Reservation received. '+text;
  $('#bookingcard').innerHTML=`<span class="status ${esc(s)}">${esc(title)}</span><h2>${esc(title)}</h2><p class="lead">${text}</p><div class="summary"><div><span>Date</span><b>${esc(r.service_date)}</b></div><div><span>Group</span><b>${esc(r.group_size)}</b></div><div><span>Total</span><b>$${total/100}</b></div><div><span>Reservation</span><b>${paid?'$49 paid':'$49 due'}</b></div><div><span>Day-of operator balance</span><b>$${operatorPay/100}</b></div><div><span>Driver / vehicle</span><b>${esc(r.driver_name||'Matching')} ${r.vehicle_name?'· '+esc(r.vehicle_name):''}</b></div></div>${action}<p class="muted small">Save this secure link. The page refreshes automatically while we match and confirm your trip.</p>`;
};

const rrddBaseDashboard=window.dashboardPage;
window.dashboardPage=async function rrddSplitDashboard(){
  await rrddBaseDashboard();
  const {data:{user}}=await sb.auth.getUser();
  if(!user)return;
  const {data:op}=await sb.from('caddy_operators').select('operator_price_cents,applicant_type').eq('user_id',user.id).maybeSingle();
  if(!op)return;
  const pay=Number(op.operator_price_cents)||25000;
  const app=$('#app');if(!app)return;
  const walker=document.createTreeWalker(app,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{n.nodeValue=n.nodeValue.replace(/\$250 per completed trip \+ tips/g,`$${pay/100} per completed trip + tips`).replace(/\$250 fixed trip pay/g,`$${pay/100} fixed trip pay`)});
};
