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

  // Load script if #apollo-forms or #footer-newsletter-form is present
  var footerForm = document.getElementById('footer-newsletter-form');
  if (targetNode || footerForm) {
    if (window.ApolloInbound) {
      try {
        window.ApolloInbound.forms.init({ appId: '6a4b71010953ed001c11dfbe' });
      } catch (err) {
        console.error('[Apollo] Error initializing form builder:', err);
      }
    } else {
      var nocache = Math.random().toString(36).substring(7);
      var script = document.createElement('script');
      script.src = 'https://assets.apollo.io/js/apollo-inbound.js?nocache=' + nocache;
      script.async = true;
      
      script.onload = function() {
        try {
          window.ApolloInbound.forms.init({ appId: '6a4b71010953ed001c11dfbe' });
        } catch (err) {
          console.error('[Apollo] Error initializing form builder:', err);
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
  window.loadApolloMeetingsWidget = function() {
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
      } else {
        console.error('[Apollo] ApolloMeetings is not available');
      }
    };
    script.onerror = function() {
      console.error('[Apollo] Failed to load meetings widget script');
    };
    document.head.appendChild(script);
  };

  // Toast notification logic
  window.showToast = function(message) {
    var toast = document.getElementById('toast-notification');
    var toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;
    
    toastMsg.textContent = message;
    toast.classList.remove('translate-y-10', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
    
    if (window.toastTimeout) {
      clearTimeout(window.toastTimeout);
    }
    window.toastTimeout = setTimeout(window.hideToast, 4500);
  };

  window.hideToast = function() {
    var toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
    toast.classList.add('translate-y-10', 'opacity-0', 'pointer-events-none');
  };

  document.addEventListener('submit', function(event) {
    var form = event.target;
    if (form.id === 'quote-form') {
      window.showToast("Success! We've received your request and will be in touch shortly.");
      setTimeout(function() {
        form.reset();
      }, 100);
    } else if (form.id === 'footer-newsletter-form') {
      event.preventDefault();
      window.showToast("Thanks for subscribing!");
      setTimeout(function() {
        form.reset();
      }, 100);
    } else if (form.closest && form.closest('#apollo-forms')) {
      window.showToast("Success! We've received your request and will be in touch shortly.");
    }
  });

  // Turnstile Callbacks and Dynamic Insertion
  window.enableSubmitButton = function() {
    var widgets = document.querySelectorAll('.cf-turnstile');
    widgets.forEach(function(widget) {
      var responseInput = widget.querySelector('[name="cf-turnstile-response"]');
      if (responseInput && responseInput.value) {
        var form = widget.closest('form');
        if (form) {
          var submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.removeAttribute('disabled');
          }
        }
      }
    });
  };

  // MutationObserver for Dynamic Apollo Inbound Forms (Trial Form)
  function setupApolloFormTurnstile() {
    var apolloContainer = document.getElementById('apollo-forms');
    if (!apolloContainer) return;

    var observer = new MutationObserver(function() {
      var submitBtn = apolloContainer.querySelector('button[type="submit"]');
      if (submitBtn && !submitBtn.hasAttribute('data-turnstile-setup')) {
        submitBtn.setAttribute('data-turnstile-setup', 'true');
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled:opacity-50', 'disabled:cursor-not-allowed');

        var turnstileDiv = document.createElement('div');
        turnstileDiv.className = 'cf-turnstile mb-3 flex justify-center';
        
        // Insert right above the submit button
        submitBtn.parentNode.insertBefore(turnstileDiv, submitBtn);

        var renderWidget = function() {
          if (window.turnstile) {
            window.turnstile.render(turnstileDiv, {
              sitekey: '0x4AAAAAAD1tZ1E7SVVxirBf',
              callback: function() {
                submitBtn.removeAttribute('disabled');
              }
            });
          }
        };

        if (window.turnstile) {
          renderWidget();
        } else {
          var interval = setInterval(function() {
            if (window.turnstile) {
              renderWidget();
              clearInterval(interval);
            }
          }, 100);
        }
      }
    });

    observer.observe(apolloContainer, { childList: true, subtree: true });
  }

  setupApolloFormTurnstile();
})();
