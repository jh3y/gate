describe('gate', function() {
  var Auth,
    User,
    controller,
    $controller,
    compile,
    defer,
    q,
    location,
    rootScope,
    scope,
    dummyResponse,
    user;
  beforeEach(module('gate'));
  beforeEach(inject(function(_Auth_, _User_, _$controller_, _$rootScope_, _$q_, _$compile_, _$location_) {
    q     = _$q_;
    defer = q.defer();
    defer.promise.success = function(fn) {
      defer.promise.then(fn, null, null);
      return defer.promise;
    };
    defer.promise.error = function(fn) {
      defer.promise.then(null, fn, null);
      return defer.promise;
    };

    User  = _User_;
    Auth  = _Auth_;


    location    = _$location_;
    rootScope   = _$rootScope_;
    compile     = _$compile_;
    scope       = _$rootScope_.$new();
  }));
  describe('Nav Controller', function() {
    beforeEach(inject(function(_$controller_) {
      Auth  = {
        logIn : sinon.stub().returns(defer.promise),
        logOut: sinon.stub()
      };
      controller = _$controller_('NavCtrl', {
        $rootScope: rootScope,
        $scope    : scope,
        Auth      : Auth
      });
    }));
    describe('logOut', function() {
      it('Invokes Auth.logOut', function(){
        controller.logOut();
        scope.$apply();
        expect(Auth.logOut).to.have.been.calledWith();
      });
    });
  });
  describe('Home Controller', function(){
    beforeEach(inject(function(_$controller_) {
      user = {
        userName : 'Joe',
        passWord : '****'
      };
      controller   = _$controller_('HomeCtrl', {
        $rootScope: rootScope,
        $scope    : scope,
        User      : User,
        user      : user
      });
    }));
    it('Resolves user correctly for display', function(){
      expect(controller.user).to.equals(user);
    });
  });
  describe('Login Controller', function(){
    beforeEach(inject(function(_$controller_) {
      user = {
        userName : 'Joe',
        passWord : '****'
      };
      Auth  = {
        logIn : sinon.stub().returns(defer.promise),
        logOut: sinon.stub()
      };
      User.setUser = sinon.stub();
      controller  = _$controller_('LoginCtrl', {
        $rootScope: rootScope,
        $scope    : scope,
        Auth      : Auth,
        User      : User
      });
      location.path = sinon.stub();
    }));
    describe('logIn', function() {
      it('Invokes Auth.logIn with correct params', function() {
        controller.logIn(user);
        expect(Auth.logIn).to.have.been.calledWith(user);
      });
      it('Invokes User service with succesful login', function() {
        dummyResponse = {
          firstName  : 'A',
          lastName   : 'User',
          email      : 'user@app.com',
          password   : '********'
        };
        defer.resolve(dummyResponse);
        Auth.logIn.withArgs(user).returns(defer.promise);
        controller.logIn(user);
        scope.$apply();
        expect(User.setUser).to.have.been.calledWith(dummyResponse);
      });
      it('Redirects to home if successful login', function() {
        defer.resolve('SUCCESFUL LOGIN');
        Auth.logIn.withArgs(user).returns(defer.promise);
        controller.logIn(user);
        scope.$apply();
        expect(location.path).to.have.been.calledWith('/home');
      });
      it('Sets scope variable to display error if unsuccesful login', function() {
        defer.reject('INVALID CREDENTIALS');
        Auth.logIn.withArgs(user).returns(defer.promise);
        controller.logIn(user);
        scope.$apply();
        expect(controller.invalidCredentials).to.equals(true);
      });
    });
  });
  /***
    Expect that login functionality would usually be handled by a $http call.
    Therefore backend testing should be in place for this.
  ***/
  describe('Auth Service', function() {
    beforeEach(function(){
      location.path = sinon.stub();
      dummyResponse = {
        firstName  : 'A',
        lastName   : 'User',
        email      : 'user@app.com',
        password   : '********'
      };
    });
    it('Provides functions for log in/out', function() {
      expect(typeof Auth.logIn).to.equals('function');
      expect(typeof Auth.logOut).to.equals('function');
    });
    describe('logOut', function() {
      it('Returns user to login', function() {
        Auth.logOut();
        expect(location.path).to.have.been.calledWith('/login');
      });
      it('Wipes localStorage details', function() {
        User.setUser(dummyResponse);
        expect(window.localStorage.getItem('gate.authenticated')).to.equals('true');
        Auth.logOut();
        expect(window.localStorage.getItem('gate.authenticated')).to.equals(null);
      });
      it('Wipes rootScope variables', function() {
        User.setUser(dummyResponse);
        Auth.logOut();
        scope.$apply();
        expect(rootScope.isLoggedIn).to.not.equals(true);
      });
    });
  });
  describe('User Service', function() {
    beforeEach(function(){
      dummyResponse = {
        firstName  : 'A',
        lastName   : 'User',
        email      : 'user@app.com',
        password   : '********'
      };
      window.localStorage.clear();
    });
    describe('getUser', function() {
      it('Returns a user from localStorage keys', function() {
        for(var detail in dummyResponse) {
          window.localStorage.setItem('gate.user.' + detail, dummyResponse[detail]);
        }
        user = User.getUser();
        expect(user.firstName).to.equals('A');
      });
    });
    describe('setUser', function() {
      it('Sets authenticated key in localStorage', function() {
        User.setUser(dummyResponse);
        expect(window.localStorage.getItem('gate.authenticated')).to.equal('true');
      });
      it('Sets localStorage keys for user details not including password', function() {
        User.setUser(dummyResponse);
        expect(window.localStorage.getItem('gate.user.firstName')).to.equals('A');
        expect(window.localStorage.getItem('gate.user.password')).to.equals(null);
      });
      it('Sets rootScope variable', function() {
        User.setUser(dummyResponse);
        expect(rootScope.isLoggedIn).to.equals(true);
      });
    });
  });
  describe('Log in Directive', function() {
    beforeEach(inject(function(_$controller_) {
      scope.logIn = sinon.stub();
    }));
    it('Renders correct markup', function() {
      var elem = angular.element('<login-form on-submit="logIn"></login-form>');
      compile(elem)(scope);
      scope.$digest();
      expect(elem[0].tagName).to.equals('FORM');
      expect(elem.hasClass('gate-login__form')).to.equals(true);
    });
    it('Invokes logIn function from parent scope', function() {
      var elem  = angular.element('<login-form on-submit="logIn"></login-form>');
      compile(elem)(scope);
      scope.$digest();
      var button = elem.find('[type=submit]');
      button.click();
      expect(scope.logIn).to.have.been.calledWith({email: "", password: ""});
    });
  });
});
