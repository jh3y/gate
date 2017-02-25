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
