window.companyPage = function rrddEmailOnboardingPage(){
  const subject = encodeURIComponent('Red Rocks DD operator application');
  const body = encodeURIComponent(
`Hi Red Rocks DD — I am interested in driving Red Rocks trips.

Operator type (taxi or limo company):
Company / operating name:
Full name:
Phone:
License / operating authority number:
Commercial insurance carrier:
Chevrolet Suburban year / description:
Legal passenger capacity:
How customers can pay the operator amount on service day:
Is cash required?:
Upcoming Red Rocks dates I would like to work:

I will attach a clear photo of my Suburban.`
  );
  $('#app').innerHTML=`<section class="sec white"><div class="w" style="max-width:820px"><div class="eyebrow" style="color:#8f3420">DRIVE RED ROCKS</div><h2>LICENSED TAXI & LIMO OPERATORS WANTED.</h2><p class="lead">For now, skip the account setup. Email us your information and we will build your Red Rocks DD operator profile on our side.</p><div class="cards two" style="margin:26px 0"><div class="card"><span class="status">TAXI</span><h3>$250 + tips</h3><p>Per completed Red Rocks trip for approved taxi operators using an approved Chevrolet Suburban.</p></div><div class="card"><span class="status">LIMO COMPANY</span><h3>$350 + tips</h3><p>Per completed Red Rocks trip for approved limo / transportation companies using an approved Chevrolet Suburban.</p></div></div><div class="note good"><b>You stay independent.</b> Choose the Red Rocks dates you want to work. Accept the trips that fit and pass on the rest. No exclusivity.</div><h3 style="margin-top:28px">Email us:</h3><ul style="line-height:1.8"><li>Taxi operator or limo / transportation company</li><li>Company / operating name and primary driver</li><li>Phone number and email</li><li>License / operating authority number</li><li>Commercial insurance carrier</li><li>Chevrolet Suburban year, description and legal capacity</li><li>A clear vehicle photo</li><li>How customers can pay the operator amount on service day</li><li>Whether cash is required</li><li>Red Rocks dates you want to work</li></ul><div class="actions" style="margin-top:28px"><a class="btn red" href="mailto:hello@redrocksdd.com?subject=${subject}&body=${body}">EMAIL MY INFORMATION</a><a class="btn ghost" href="mailto:hello@redrocksdd.com">hello@redrocksdd.com</a></div><p class="small muted" style="margin-top:20px">We review licensing, commercial insurance, vehicle fit and availability before an operator is published or offered customer trips.</p></div></section>`;
};