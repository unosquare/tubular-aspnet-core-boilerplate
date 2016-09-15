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

                tubularHttp.authenticate($scope.username, $scope.password, $scope.redirectHome, function (error) {
                    $scope.loading = false;
                    toastr.error(error);
                }, true);
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