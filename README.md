gate
================

An angular login example app.

##Demo
You can see a demo of the app running @ [jh3y.github.io/gate](https://jh3y.github.io/gate). Plain text credentials can be seen in [authenticate.json](https://github.com/jh3y/gate/blob/master/src/json/authenticate.json).

###Prerequisites
It is assumed that you have __bower__, __gulp__ and __node__ installed.

##Getting started
1. Clone the repo

        git clone https://github.com/jh3y/gate

2. Navigate to repo and install dependencies

        cd gate
        bower install
        npm install

3. Start hacking!

        gulp

##Running tests
1. Clone the repo

        git clone https://github.com/jh3y/gate

2. Navigate to repo and install dependencies

        cd gate
        bower install
        npm install

3. Build the sources using the `--test` flag. This is required to pull `angular-mocks` and `sinon` into our vendor scripts for testing.

        gulp build:complete --test

4. Run the tests using test script.

        npm run test

##Self hosting the output
If you want to simply run the output. You can compile the `src` and put the contents on a server or use something like `python -m SimpleHTTPServer`.

1. Clone the repo

        git clone https://github.com/jh3y/gate

2. Navigate to repo and install dependencies

        cd gate
        bower install
        npm install

3. Build the sources.

        gulp build:complete

4. Do what you wish with the content of `public`!

##Design
The design here creates our log in form as a directive. Depending on your application design you may wish to log in not only on a dedicated page but also say within a modal or inside the navigation. Having the log in form implemented as a directive promotes the DRY principle.

Using directives we pass controller login functionality from the controller to the directive via `$scope` attributes. It's important to keep coupling to a minimum so a simple directive that merely assumes the passing of username and password combinations but invokes a function within the parent controller with these.

```html
<login-form on-submit="ctrl.logIn"></login-form>
```

##Code structure
As this application is small we can group code by angular features such as `controllers` and `services`. In a larger scale application it would make more sense in some cases to group code by feature or area of an application.

##Under the hood
The app is created using `gulp` for a task runner along with `bower` for managing third party dependencies. In addition, `stylus` and `jade` have been used. It's easy enough to swap these out for `HTML` and `CSS` but for speed whilst developing, the indentation based syntax was opted for.

Aside from `jQuery` and `angular`, no other third party Javascript frameworks have been used for the app itself.

For testing, `karma` has been used with `mocha` and `chai`.

On the `CSS` side, `normalize` is pulled in for cross browser consistency.

The app leverages the use of the angular template cache to combat multiple requests for view/directive templates.

##Todo
* Add inline docs in the style of `ng-docs`. See here for more on [ng-docs](https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation).
* Explore `ng-cloak` issue.

##Note
* This is a simple starting point.
* The app isn't polished. Missing form validation, proper styling etc.
* The example filters users on the front end, this would be normally handled via a back end API.

#That's it!

As always, feel free to tweet me or leave an issue!

@jh3y 2015
