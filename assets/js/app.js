(function(){
  var ENDPOINT = (typeof window.APP_WEB_URL === 'string' && window.APP_WEB_URL.trim()) || '';
  function bind() {
    if (!ENDPOINT) { return; } // silently do nothing if not configured
    document.querySelectorAll('form[data-bind-endpoint]').forEach(function(f){
      if (!f.getAttribute('method')) f.setAttribute('method','post');
      if (!f.getAttribute('enctype')) f.setAttribute('enctype','multipart/form-data');
      f.setAttribute('action', ENDPOINT);
    });
  }
  document.addEventListener('DOMContentLoaded', bind);
})();