  function storeInterceptedToken(token) {
    try { sessionStorage.setItem(TOKEN_INTERCEPT_KEY, token); } catch (_) {}
  }

  function isJwtExpired(token) {
    try {
      const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(b64));
      return !payload.exp || payload.exp * 1000 < Date.now() + 10000;
    } catch (_) {
      return true;
    }
  }

  function getInterceptedToken() {
    try {
      const token = sessionStorage.getItem(TOKEN_INTERCEPT_KEY);
      if (token && !isJwtExpired(token)) {
        return token;
      }
      if (token) {
        try { sessionStorage.removeItem(TOKEN_INTERCEPT_KEY); } catch (_) {}
      }
    } catch (_) {}
    return null;
  }

  function installTokenInterceptor() {
    // 1. Listen for Keycloak iframe silent-refresh postMessage (token passed back from login domain)
    try {
      window.addEventListener("message", function(event) {
        try {
          if (!event.origin || !event.origin.includes("autodarts.io")) { return; }
          const data = event.data;
          let token = null;
          if (typeof data === "string" && data.split(".").length === 3) {
            token = data;
          } else if (data && typeof data === "object") {
            token = data.access_token || data.token || data.kc_token || null;
          }
          if (token && typeof token === "string" && !isJwtExpired(token)) {
            storeInterceptedToken(token);
          }
        } catch (_) {}
      }, false);
    } catch (_) {}

    // 2. Patch window.fetch — capture Bearer token from outgoing API calls
    try {
      const _nativeFetch = window.fetch;
      if (typeof _nativeFetch === "function" && !window.__ataFetchPatched) {
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
                storeInterceptedToken(auth.replace(/^Bearer\s+/i, ""));
              }
            }
          } catch (_) {}
          return _nativeFetch.apply(this, arguments);
        };
      }
    } catch (_) {}

    // 3. Patch XMLHttpRequest — capture Bearer token from outgoing API calls
    try {
      const _proto = XMLHttpRequest.prototype;
      if (!_proto.__ataPatched) {
        _proto.__ataPatched = true;
        const _open = _proto.open;
        const _setHeader = _proto.setRequestHeader;
        _proto.open = function(method, url) {
          try { this.__ataUrl = String(url || ""); } catch (_) {}
          return _open.apply(this, arguments);
        };
        _proto.setRequestHeader = function(name, value) {
          try {
            if (
              String(name || "").toLowerCase() === "authorization" &&
              /^Bearer\s+\S+/i.test(String(value || "")) &&
              this.__ataUrl && String(this.__ataUrl).includes(API_PROVIDER)
            ) {
              storeInterceptedToken(String(value).replace(/^Bearer\s+/i, ""));
            }
          } catch (_) {}
          return _setHeader.apply(this, arguments);
        };
      }
    } catch (_) {}
  }
