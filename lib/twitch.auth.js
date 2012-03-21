(function() {
  var parseFragment = function(hash) {
    var match,
      session;

    hash = hash || document.location.hash;

    var hashMatch = function(expr) {
      var match = hash.match(expr);
      return match ? match[1] : null;
    };

    session = {
      token: hashMatch(/access_token=(\w+)/),
      scope: hashMatch(/scope=([\w+]+)/) ? hashMatch(/scope=([\w+]+)/).split('+') : null,
      state: hashMatch(/state=(\w+)/),
      error: hashMatch(/error=(\w+)/),
      errorDescription: hashMatch(/error_description=(\w+)/)
    };

    return session;
  };

  var getStatus = function() {
    // TODO: force update parameter
    return {
      authenticated: !!Twitch._config.session.token,
      token: Twitch._config.session.token,
      scope: Twitch._config.session.scope,
      error: Twitch._config.session.error,
      errorDescription: Twitch._config.session.errorDescription
    };
  };

  // Login and redirect back to current page with an access token
  // The popup parameter can be used to authorize users without
  // leaving your page, as described in http://stackoverflow.com/a/3602045/100296
  // TODO: description about setting URI
  // Usage:
  // Twitch.login({
  //   redirect_uri: 'http://myappurl',
  //   popup: false,
  //   scope: ['user_read', 'channel_read']
  // });
  var login = function(options) {
    if (!options.scope) {
      throw new Error('Must specify list of requested scopes');
    }
    var params = {
      response_type: 'token',
      client_id: Twitch._config.clientId,
      redirect_uri: options.redirect_uri || window.location.href,
      scope: options.scope.join(' ')
    };

    if (!params.client_id) {
      throw new Error('You must call init before login');
    }
    
    var url = Twitch.baseUrl + 'oauth2/authorize?' + $.param(params);

    if (options.popup) {
      Twitch._config.loginPopup = window.open(url,
                          "Login with TwitchTV",
                          "height=450,width=680,resizable=yes,status=yes");
    } else {
      window.location = url;
    }
  };

  // Retrieve sessions from persistent storage and
  // persist new sessions.
  var initSession = function() {
    var storedSession,
      sessionKey = 'twitch_oauth_session';

    Twitch._config.session = {};
    // Retrieve sessions from persistent storage and
    // persist new sessions.
    if (window.JSON) {
      storedSession = Twitch._storage.getItem(sessionKey);
      if (storedSession) {
        try {
          Twitch._config.session = JSON.parse(storedSession);
        } catch (e) {
          //
        }
      }
    }

    // overwrite with new params if page has them
    if (document.location.hash.match(/access_token=(\w+)/)) {
      Twitch._config.session = parseFragment();

      if (window.JSON) {
        Twitch._storage.setItem(sessionKey, JSON.stringify(Twitch._config.session));
      }
    }
  };

  Twitch.extend({
    _initSession: initSession,
    getStatus: getStatus,
    login: login
  });
})();