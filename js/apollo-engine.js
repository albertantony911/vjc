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

  // Load script when #apollo-forms is present
  if (targetNode) {
    var apolloScript = document.querySelector('script[src*="apollo-engine.js"]');
    var srcAttr = apolloScript ? apolloScript.getAttribute('src') : '';
    var isFile = window.location.protocol === 'file:';
    var prefix = isFile ? (srcAttr.startsWith('../') ? '../' : './') : '/';
    var scriptSrc = prefix + (prefix.endsWith('/') ? '' : '/') + 'js/libs/apollo-inbound.js';

    if (window.ApolloInbound && window.ApolloInbound.forms) {
      try {
        window.ApolloInbound.forms.init({ appId: '6a4b71010953ed001c11dfbe' });
      } catch (err) {
        console.error('[Apollo] Error initializing:', err);
      }
    } else {
      var script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      
      script.onload = function() {
        try {
          if (window.ApolloInbound && window.ApolloInbound.forms) {
            window.ApolloInbound.forms.init({ appId: '6a4b71010953ed001c11dfbe' });
          }
        } catch (err) {
          console.error('[Apollo] Error initializing:', err);
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
    }
  }

  // Phase 1: Expose loadApolloMeetingsWidget globally
  window.loadApolloMeetingsWidget = function(formId) {
    var targetFormId = formId || 'quote-form';

    function doSubmit() {
      if (window.ApolloMeetings && typeof window.ApolloMeetings.submit === 'function') {
        window.ApolloMeetings.submit({ formId: targetFormId });
      }
    }

    if (window.ApolloMeetings && typeof window.ApolloMeetings.submit === 'function') {
      doSubmit();
      return;
    }

    if (!document.querySelector('script[src*="meetings-widget.js"]')) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://assets.apollo.io/js/meetings/meetings-widget.js';
      script.defer = true;
      script.onload = function() {
        if (window.ApolloMeetings && window.ApolloMeetings.initWidget) {
          window.ApolloMeetings.initWidget({
            appId: "6a4ba00e5236e4000c186324",
            schedulingLink: "934-b72-m2t"
          });
          doSubmit();
        } else {
          console.error('[Apollo] ApolloMeetings is not available');
        }
      };
      script.onerror = function() {
        console.error('[Apollo] Failed to load meetings widget script');
      };
      document.head.appendChild(script);
    } else {
      var interval = setInterval(function() {
        if (window.ApolloMeetings && typeof window.ApolloMeetings.submit === 'function') {
          clearInterval(interval);
          doSubmit();
        }
      }, 150);
      setTimeout(function() { clearInterval(interval); }, 5000);
    }
  };
})();
