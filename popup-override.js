(function(){
  if(document.getElementById('edp-bg-override')) return;
  var s = document.createElement('style');
  s.id = 'edp-bg-override';
  s.textContent = '.edp-top{background:url("https://cdn.shopify.com/s/files/1/1029/1167/2662/files/popup-bg.jpg?v=1780227164") center/cover no-repeat !important;}.edp-top::before{background:rgba(0,0,0,0.45) !important;}.edp-logo,.edp-badge,.edp-title,.edp-sub,.edp-close{position:relative;z-index:1;}';
  document.head.appendChild(s);
})();
