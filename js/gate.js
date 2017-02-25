(function() { var routes = function($routeProvider) {
  $routeProvider.when("/", {
    templateUrl: "views/home.html",
    controller:'HomeCtrl',
    controllerAs: 'home',
    resolve: {
      user: function(User) {
        return User.getUser();
      }
    }
  }).when("/login", {
    templateUrl : "views/login.html",
    controller  : 'LoginCtrl',
    controllerAs: 'login'
  }).otherwise({
    redirectTo: "/"
  });
},
  onRun = function($rootScope, $location, config) {
    var loggedIn = window.localStorage.getItem(config.LOGIN_TOKEN);
    if (loggedIn === 'true') $rootScope.isLoggedIn = true;
    $rootScope.$on('$locationChangeStart', function(event, next, current) {
      var loggedIn = window.localStorage.getItem(config.LOGIN_TOKEN);
      $rootScope.loading = true;
      if (loggedIn !== 'true' && $location.path() !== config.ROUTES.LOGIN) {
        $location.path(config.ROUTES.LOGIN);
      } else if (loggedIn === 'true' && $location.path() === config.ROUTES.LOGIN) {
        $location.path('/');
      }
    });
    $rootScope.$on('$locationChangeSuccess', function(event, next, current) {
      $rootScope.loading = false;
    });
  };

angular.module('gate', [
  'ngRoute',
  'gate.Controllers',
  'gate.Services',
  'gate.Directives'
])
  .config(routes)
  .constant('gateConfig', {
    LOGIN_TOKEN     : 'gate.authenticated',
    SERVICE_DURATION: 1250,
    SERVICE_URL     : 'authenticate.json',
    ROUTES          : {
      HOME : '/home',
      LOGIN: '/login'
    }
  })
  .run([
    '$rootScope',
    '$location',
    'gateConfig',
    onRun
  ]);

var LoginCtrl = function($rootScope, $scope, $location, $routeParams, Auth, User) {
  var ctrl = this,
    logIn  = function(user) {
      $rootScope.loading = true;
      Auth.logIn(user)
        .then(function(data){
          ctrl.invalidCredentials = false;
          User.setUser(data);
          $location.path('/home');
        })
        .catch(function(err) {
          ctrl.invalidCredentials = true;
          $rootScope.loading = false;
        });
    };
  ctrl.logIn = logIn;
},
  HomeCtrl = function($scope, $location, $routeParams, User, user) {
    var ctrl  = this;
    ctrl.user = user;
  },
  NavCtrl = function($scope, Auth) {
    var ctrl = this;
    ctrl.logOut = Auth.logOut;
  };

angular.module('gate.Controllers',['gate.Services'])
  .controller('LoginCtrl', [
    '$rootScope',
    '$scope',
    '$location',
    '$routeParams',
    'Auth',
    'User',
    LoginCtrl
  ])
  .controller('HomeCtrl', [
    '$scope',
    '$location',
    '$routeParams',
    'User',
    'user',
    HomeCtrl
  ])
  .controller('NavCtrl', [
    '$scope',
    'Auth',
    NavCtrl
  ]);

var link = function($scope, $elem, $attrs, $ctrl) {
  var form = this,
    submit = function(e) {
      var user = {
        email   : form.ui.email.val(),
        password: form.ui.password.val()
      };
      $scope.submit(user);
    };
  form.ui  = {
    submit  : $elem.find('[type=submit]'),
    email   : $elem.find('[type=text]'),
    password: $elem.find('[type=password]')
  };
  form.ui.submit.on('click', submit);
},
  loginForm = function($rootScope) {
    return {
      replace    : true,
      restrict   : 'AEC',
      scope      : {
        submit         : '=onSubmit',
        validationError: '=validationVariable'
      },
      templateUrl: 'directives/loginForm.html',
      transclude : false,
      link       : link
    };
  };
angular.module('gate.Directives', [])
  .directive('loginForm', [
    '$rootScope',
    loginForm
  ]);

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

angular.module("gate").run(["$templateCache", function($templateCache) {$templateCache.put("directives/loginForm.html","<form class=\"gate-login__form\">Email:<input type=\"text\" class=\"gate-login__form-email\"/><br/>Password:<input type=\"password\" class=\"gate-login__form-password\"/><br/><input type=\"submit\" value=\"Log in\" class=\"gate-login__form-submit\"/><div ng-show=\"validationError\" class=\"gate-login__form-error tx--red\">Eeek! Invalid credentials I\'m afraid</div></form>");
$templateCache.put("views/home.html","<div><h1>Welcome back {{ home.user.firstName }}!</h1></div>");
$templateCache.put("views/login.html","<div><login-form on-submit=\"login.logIn\" validation-variable=\"login.invalidCredentials\"></login-form></div>");}]); }());