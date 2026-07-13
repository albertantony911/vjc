(function() {
  var nocache = Math.random().toString(36).substring(7);
  var script = document.createElement('script');
  script.src = 'https://assets.apollo.io/js/apollo-inbound.js?nocache=' + nocache;
  script.async = true;
  
  script.onload = function() {
    try {
      var skeleton = document.getElementById('apollo-skeleton');
      if (skeleton) {
        skeleton.style.display = 'none';
      }
      window.ApolloInbound.forms.init({ appId: '6a4b71010953ed001c11dfbe' });
    } catch (err) {
      console.error('[Apollo] Error initializing form builder:', err);
    }
  };
  
  script.onerror = function() {
    console.error('[Apollo] Failed to load form builder script');
  };
  
  document.head.appendChild(script);
})();
