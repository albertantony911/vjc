(function() {
  var targetNode = document.getElementById('apollo-forms');
  var skeleton = document.getElementById('apollo-skeleton');
  var observer = null;

  if (targetNode && skeleton) {
    observer = new MutationObserver(function(mutationsList) {
      for (var i = 0; i < mutationsList.length; i++) {
        var mutation = mutationsList[i];
        if (mutation.type === 'childList' && targetNode.children.length > 0) {
          // Smooth transition: fade out skeleton
          skeleton.style.transition = 'opacity 0.3s ease';
          skeleton.style.opacity = '0';
          setTimeout(function() {
            skeleton.style.display = 'none';
          }, 300);
          
          if (observer) {
            observer.disconnect();
          }
          break;
        }
      }
    });
    observer.observe(targetNode, { childList: true });
  }

  var nocache = Math.random().toString(36).substring(7);
  var script = document.createElement('script');
  script.src = 'https://assets.apollo.io/js/apollo-inbound.js?nocache=' + nocache;
  script.async = true;
  
  script.onload = function() {
    try {
      window.ApolloInbound.forms.init({ appId: '6a4b71010953ed001c11dfbe' });
    } catch (err) {
      console.error('[Apollo] Error initializing form builder:', err);
      // Fallback: hide skeleton if init fails
      if (skeleton) {
        skeleton.style.display = 'none';
      }
    }
  };
  
  script.onerror = function() {
    console.error('[Apollo] Failed to load form builder script');
    if (skeleton) {
      skeleton.style.display = 'none';
    }
  };
  
  document.head.appendChild(script);
})();
