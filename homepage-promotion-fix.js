(function(){
  const originalHome = window.home;
  if (typeof originalHome !== 'function') return;

  window.home = function rrddPromotionReadyHome(){
    originalHome();

    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) heroTitle.textContent = 'YOUR OWN DD FOR RED ROCKS. FROM $299. PICKED UP AT YOUR DOOR.';

    const priceHeading = document.querySelector('.price-hero h2');
    if (priceHeading) priceHeading.textContent = 'CHOOSE THE RED ROCKS RIDE THAT FITS YOUR GROUP.';

    const priceLead = document.querySelector('.price-hero .lead');
    if (priceLead) priceLead.textContent = '$299 total with an approved individual/taxi operator or $399 total with an approved limo-company operator. Either way, the $49 reservation is paid first and the operator balance is due on the day of service.';

    const priceStrong = document.querySelector('.pricebox strong');
    if (priceStrong) priceStrong.textContent = 'FROM $299';

    const priceSpan = document.querySelector('.pricebox span');
    if (priceSpan) priceSpan.textContent = 'Individual/taxi $299 total · Limo company $399 total';

    const walker = document.createTreeWalker(document.querySelector('#app'), NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (!node.nodeValue) return;
      node.nodeValue = node.nodeValue
        .replace('✓ $299', '✓ From $299')
        .replace('$299 total: $49 deposit today and $250 balance due on the day of service. Tips are optional.', '$299 total with an individual/taxi operator or $399 total with a limo-company operator. The $49 reservation is paid first; the operator balance is due on the day of service. Tips are optional.');
    });
  };
})();
