(function (angular) {
    "use strict";

    angular.module('app.controllers', ['tubular.services', 'tubular.models'])
        .run(function ($rootScope) {
            $rootScope.$on('titleEmit', function (event, args) {
                $rootScope.$broadcast('titleBroadcast', args);
            });
        }).controller('genericCtrl',
            function ($scope, alerts, $routeParams, toastr) {
                $scope.$on('tbGrid_OnConnectionError',
                    function (event, error) {
                        alerts.defaultErrorHandler(error, true);
                    });

                $scope.$on('tbForm_OnConnectionError',
                    function (event, error) {
                        alerts.defaultErrorHandler(error, true);
                    });

                $scope.$on('tbForm_OnSuccessfulSave',
                    function (event, data) {
                        toastr.success(data || "Updated");
                    });
            });

    angular.module('app', [
        'ngRoute',
        'tubular',
        'ui.bootstrap',
        'app.controllers',
        'LocalStorageModule',
        'toastr'
    ]).config([
        '$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: '/views/home.html',
                    title: 'Home'
                }).when('/Login', {
                    templateUrl: '/views/login.html',
                    title: 'Login'
                });

            $routeProvider.otherwise({
                redirectTo: '/'
            });

            $locationProvider.html5Mode(true);
        }
    ]).config([
        '$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('noCacheInterceptor');
        }
    ]).factory('noCacheInterceptor', function() {
        return {
            request: function (config) {
                if (config.method == 'GET' && config.url.indexOf('.htm') === -1 && config.url.indexOf('blob:') === -1) {
                    var separator = config.url.indexOf('?') === -1 ? '?' : '&';
                    config.url = config.url + separator + 'noCache=' + new Date().getTime();
                }
                return config;
            }
        };
    }).service('alerts', [
        '$filter', 'toastr', function ($filter, toastr) {
            var me = this;

            me.previousError = '';

            me.defaultErrorHandler = function (error) {
                console.info(":( ", error);
                var errorMessage = $filter('errormessage')(error);

                me.previousError = errorMessage;

                // Ignores Unauthorized error because it's redirecting to login
                if (errorMessage != "Unauthorized")
                    toastr.error(errorMessage);
            };
        }
    ]);
})(window.angular);
(function () {
    'use strict';

    angular.module('app.controllers').controller('loginCtrl',
        function ($scope, $location, tubularHttp, localStorageService, $uibModal, $routeParams, toastr) {
            $scope.loading = false;
            $scope.tokenReset = $routeParams.token;

            $scope.submitForm = function () {
                if (!$scope.username || !$scope.password || $scope.username.trim() == '' || $scope.password.trim() == '') {
                    toastr.error("", "You need to fill in a username and password");
                    return;
                }
                $scope.loading = true;

                tubularHttp.authenticate($scope.username, $scope.password)
                    .then(function () {
                        $location.path("/");                        
                    }, function (error) {
                    $scope.loading = false;
                    toastr.error(error);
                }); 
            };

            $scope.redirectHome = function () {
                document.location = document.location;
            };

            if (tubularHttp.isAuthenticated()) {
                $location.path("/");
            }
        }).controller('navCtrl',
        function ($scope, $route, $location, tubularHttp, localStorageService) {
            $scope.user = 'username';
            $scope.menus = [];
            $scope.isRunning = false;
            $scope.isAnonymousView = true;

            $scope.$on('$routeChangeSuccess', function () {
                $scope.key = $route.current.title;
                $scope.content = $scope.key + " - Tubular";
                $scope.isAnonymousView = $route.current.title == 'Login';

                if ($scope.isAnonymousView == false && tubularHttp.isAuthenticated() == false) {
                    $location.path("/Login");
                } else if (tubularHttp.isAuthenticated()) {
                    $scope.user = tubularHttp.userData.username;
                    $scope.roles = tubularHttp.userData.role;
                    $scope.menus = angular.fromJson(localStorageService.get('menus'));

                    $scope.subheader = null;
                    $scope.pageTitle = $scope.key;

                    $scope.content = $scope.pageTitle + " -Tubular";
                    $scope.$emit('titleEmit', $scope.pageTitle);
                }
            });

            $scope.logout = function () {
                tubularHttp.removeAuthentication();
                $scope.user = '';
                $location.path('/Login');
            };

        }).controller('titleCtrl', function ($scope, $route) {
            $scope.$on('$routeChangeSuccess', function () {
                $scope.key = $route.current.title;
                $scope.content = $scope.key + " - Tubular";
            });
        });;
})();