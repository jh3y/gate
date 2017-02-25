var routes = function($routeProvider) {
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
