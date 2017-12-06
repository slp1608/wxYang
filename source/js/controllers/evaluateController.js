/**
 * Created by chaoshen on 2017/1/16.
 */
angular.module("cftApp.evaluatePage",[])
    .config(["$stateProvider",function ($stateProvider) {
        $stateProvider.state('tabs.evaluatePage',{
            url: '/evaluatePage',
            views: {
                'tabs-personal': {
                    templateUrl: 'evaluatePage.html',
                    controller: 'evaluateController'
                }
            }
        });
    }])
    .controller('evaluateController',['$scope','$rootScope',function ($scope,$rootScope) {
        console.log("评价页面");
        //页面载入前
        $scope.$on('$ionicView.beforeEnter', function () {
            $rootScope.hideTabs = true;
        });
        
        $scope.rednums = [];
        $scope.graynums = [];
        (function showStarNums(nums) {
            $scope.rednums.length = nums;
            $scope.graynums.length = 5-nums;
        }(5));
        $scope.goodsIcons = ['img1'];
    }]);