async function adminPage(){
  const {data:{user}}=await sb.auth.getUser();
  if(!user){location.hash='#/login';return}
  const ok=await sb.rpc('is_red_rocks_dd_admin');
  if(!ok.data){$('#app').innerHTML='<section class="sec white"><div class="w"><div class="card">Not authorized.</div></div></section>';return}

  const [ops,reqs,unmatched,apps,recovery]=await Promise.all([
    sb.rpc('red_rocks_dd_admin_operators'),
    sb.rpc('red_rocks_dd_admin_requests'),
    sb.rpc('red_rocks_dd_admin_unmatched'),
    sb.from('rrdd_driver_applications').select('*').order('created_at',{ascending:false}),
    sb.rpc('red_rocks_dd_admin_driver_recovery')
  ]);

  const O=ops.data||[],R=reqs.data||[],U=unmatched.data||[],A=apps.data||[],Q=recovery.data||[];
  const pendingApps=A.filter(a=>(a.status||'review_pending')==='review_pending');
  const incomplete=Q.filter(x=>!x.completed);
  $('#app').innerHTML=`<section class="sec white"><div class="w">
    <div class="row"><div><div class="eyebrow" style="color:#8f3420">OPERATIONS</div><h2>RED ROCKS DD ADMIN</h2></div><button class="btn ghost" onclick="logout()">Log out</button></div>
    <div class="grid"><div class="card"><h3>${pendingApps.length}</h3><p>driver applications needing review</p></div><div class="card"><h3>${incomplete.length}</h3><p>drivers needing recovery / follow-up</p></div><div class="card"><h3>${O.length}</h3><p>activated operator records</p></div><div class="card"><h3>${R.length}</h3><p>bookings</p></div></div>

    <h3 style="margin-top:30px">DRIVER RECOVERY & FOLLOW-UP</h3>
    <p class="muted">Every driver who entered a valid email is retained here, including failed or incomplete attempts. Use this queue to contact people before they disappear.</p>
    <div class="tablewrap"><table class="table"><thead><tr><th>Driver</th><th>Contact</th><th>What we have</th><th>Where they stopped</th><th>Attempts</th><th>Last activity</th></tr></thead><tbody>${Q.map(q=>`<tr><td><b>${esc(q.full_name||'Name not saved')}</b><br><span class="muted small">${esc(q.company_name||'')}</span></td><td><a href="mailto:${esc(q.email)}">${esc(q.email)}</a>${q.phone?`<br><a href="tel:${esc(q.phone)}">${esc(q.phone)}</a>`:''}</td><td>${q.license_number?`Authority: ${esc(q.license_number)}<br>`:''}${q.vehicle?`Vehicle: ${esc(q.vehicle)}${q.vehicle_capacity?` · cap ${Number(q.vehicle_capacity)}`:''}<br>`:''}<span class="muted small">${esc(q.insurance_carrier||'')}</span></td><td><b>${esc((q.stage||'unknown').replaceAll('_',' '))}</b>${q.last_error?`<br><span class="small" style="color:#8f3420">${esc(q.last_error)}</span>`:''}${q.completed?'<br><span class="status">COMPLETED</span>':''}</td><td>${Number(q.attempt_count)||1}</td><td>${esc(new Date(q.last_attempt_at).toLocaleString())}<br><span class="muted small">first ${esc(new Date(q.first_attempt_at).toLocaleDateString())}</span></td></tr>`).join('')||'<tr><td colspan="6">No recovery records yet.</td></tr>'}</tbody></table></div>

    <h3 style="margin-top:30px">DRIVER APPLICATIONS NEEDING REVIEW</h3>
    <div class="tablewrap"><table class="table"><thead><tr><th>Driver</th><th>Contact</th><th>Authority</th><th>Vehicle</th><th>Availability</th><th>Status</th></tr></thead><tbody>${pendingApps.map(a=>`<tr><td><b>${esc(a.driver_name)}</b><br><span class="muted small">${esc(a.company_name)}</span></td><td><a href="mailto:${esc(a.email)}">${esc(a.email)}</a><br><a href="tel:${esc(a.phone)}">${esc(a.phone)}</a></td><td>${esc(a.license_number||'')}<br><span class="muted small">${esc(a.insurance_carrier||'Insurance to finish')}</span></td><td>${esc(a.vehicle)}<br><span class="muted small">capacity ${Number(a.capacity)||0}</span></td><td>${(a.availability_dates||[]).slice(0,4).map(esc).join('<br>')||'<span class="muted">Not selected yet</span>'}${(a.availability_dates||[]).length>4?`<br><span class="muted small">+${a.availability_dates.length-4} more</span>`:''}</td><td>${esc(statusLabel(a.status||'review_pending'))}<br><span class="muted small">${esc(new Date(a.created_at).toLocaleString())}</span></td></tr>`).join('')||'<tr><td colspan="6">No driver applications are waiting for review.</td></tr>'}</tbody></table></div>

    <h3 style="margin-top:30px">BOOKINGS</h3>
    <div class="tablewrap"><table class="table"><thead><tr><th>Date</th><th>Customer</th><th>Group</th><th>Status</th><th>Operator</th><th>Actions</th></tr></thead><tbody>${R.map(r=>`<tr><td>${esc(r.service_date)}</td><td>${esc(r.customer_name)}<br><span class="muted small">${esc(r.customer_phone)} · ${esc(r.customer_email)}</span></td><td>${r.group_size}</td><td>${esc(statusLabel(r.status))}<br><span class="muted small">$49 ${esc(r.reservation_fee_status)}</span></td><td>${r.operator_id?esc(O.find(o=>o.id===r.operator_id)?.driver_name||r.operator_id):'MATCH NEEDED'}</td><td>${!r.operator_id?`<select id="as-${r.id}"><option value="">Choose driver…</option>${O.filter(o=>o.approved&&o.active).map(o=>`<option value="${o.id}">${esc(o.driver_name)}</option>`).join('')}</select><button class="btn small dark" onclick="assignTrip('${r.id}')">Assign</button>`:''}${['confirmed','assigned','accepted'].includes(r.status)?` <button class="btn small red" onclick="completeTrip('${r.id}')">Complete</button>`:''}</td></tr>`).join('')}</tbody></table></div>

    <h3 style="margin-top:30px">ACTIVATED OPERATOR RECORDS</h3>
    <div class="tablewrap"><table class="table"><thead><tr><th>Driver</th><th>License / insurance</th><th>State</th><th>Founding</th><th>Action</th></tr></thead><tbody>${O.map(o=>`<tr><td>${esc(o.driver_name)}<br><span class="muted small">${esc(o.company_name)}</span></td><td>${esc(o.license_number||'')}<br>${esc(o.insurance_carrier||'')}</td><td>${o.approved?'Approved':'Pending'} · ${o.active?'Active':'Paused'}</td><td>${o.founding_bonus_eligible?'Eligible':''}${o.founding_bonus_paid_at?' · Paid':''}</td><td><button class="btn small dark" onclick="setOperator('${o.id}',${!o.approved},${!o.approved})">${o.approved?'Revoke':'Approve'}</button>${o.approved?` <button class="btn small ghost" onclick="setOperator('${o.id}',true,${!o.active})">${o.active?'Pause':'Activate'}</button>`:''}${o.founding_bonus_eligible&&!o.founding_bonus_paid_at?` <button class="btn small red" onclick="markBonus('${o.id}')">Mark $100 paid</button>`:''}</td></tr>`).join('')||'<tr><td colspan="5">No activated operator records yet.</td></tr>'}</tbody></table></div>
  </div></section>`
}

async function assignTrip(id){const op=$(`#as-${CSS.escape(id)}`).value;if(!op)return alert('Choose a driver.');const z=await sb.rpc('red_rocks_dd_admin_assign_request',{p_request_id:id,p_operator_id:op});if(z.error)return alert(z.error.message);adminPage()}
async function setOperator(id,approved,active){const z=await sb.rpc('red_rocks_dd_admin_set_operator',{p_operator_id:id,p_approved:approved,p_active:active});if(z.error)return alert(z.error.message);adminPage()}
async function completeTrip(id){const z=await sb.rpc('red_rocks_dd_admin_complete_request',{p_request_id:id});if(z.error)return alert(z.error.message);adminPage()}
async function markBonus(id){const z=await sb.rpc('red_rocks_dd_admin_mark_bonus_paid',{p_operator_id:id});if(z.error)return alert(z.error.message);adminPage()}