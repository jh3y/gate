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
