var authService = function($http, $rootScope, $q, $location, Config, User) {
  var checkCredentials = function(user) {
    return user.email === this.email && user.password === this.password;
  };
  return {
    logIn: function(credentials) {
      /***
        We return all users from the json file and filter on the front end.
        In a typical application this would be handled by a backend.
      ***/
      return $http.get(Config.SERVICE_URL).then(function(response) {
        var user = response.data.users.filter(checkCredentials, credentials)[0];
        return $q(function(resolve, reject) {
          setTimeout(function(){
            if (user) {
              resolve(user);
            } else {
              reject('INVALID CREDENTIALS:' + credentials);
            }
          }, Config.SERVICE_DURATION);
        });
      });
    },
    logOut: function() {
      for (var key in window.localStorage) {
        if (key.indexOf('gate') !== -1) {
          delete window.localStorage[key];
        }
      }
      $rootScope.isLoggedIn = false;
      $location.path(Config.ROUTES.LOGIN);
    }
  };
},
  userService = function($rootScope) {
    var user;
    return {
      getUser: function() {
        /***
          Populate from localStorage.
          In a real scenario would invoke a service to grab credentials using
          something like a JWT.
        ***/
        user = {};
        for (var key in window.localStorage) {
          if (key.indexOf('gate.user.') !== -1) {
            user[key.substr(10)] = window.localStorage[key];
          }
        }
        return user;
      },
      setUser: function(details) {
        window.localStorage.setItem('gate.authenticated', true);
        $rootScope.isLoggedIn = true;
        for(var detail in details) {
          if (detail !== 'password') {
            window.localStorage.setItem('gate.user.' + detail, details[detail]);
          }
        }
        return details;
      }
    };
  };

angular.module('gate.Services', [])
  .factory('Auth', [
    '$http',
    '$rootScope',
    '$q',
    '$location',
    'gateConfig',
    'User',
    authService
  ])
  .factory('User', [
    '$rootScope',
    userService
  ]);
