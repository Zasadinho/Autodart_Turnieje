  function installTokenInterceptor() {
    try {
      const _nativeFetch = window.fetch;
      if (typeof _nativeFetch !== "function" || window.__ataFetchPatched) {
        return;
      }
      window.__ataFetchPatched = true;

      window.fetch = function ataPatchedFetch(input, init) {
        try {
          const url = input instanceof Request ? input.url : String(input || "");
          if (url.includes(API_PROVIDER)) {
            let auth = null;
            if (init && init.headers) {
              if (init.headers instanceof Headers) {
                auth = init.headers.get("Authorization");
              } else if (typeof init.headers === "object") {
                auth = init.headers["Authorization"] || init.headers["authorization"] || null;
              }
            }
            if (!auth && input instanceof Request) {
              try { auth = input.headers.get("Authorization"); } catch (_) {}
            }
            if (auth && /^Bearer\s+\S+/i.test(auth)) {
              const token = auth.replace(/^Bearer\s+/i, "");
              try {
                sessionStorage.setItem(TOKEN_INTERCEPT_KEY, token);
              } catch (_) {}
            }
          }
        } catch (_) {}
        return _nativeFetch.apply(this, arguments);
      };
    } catch (_) {}
  }
