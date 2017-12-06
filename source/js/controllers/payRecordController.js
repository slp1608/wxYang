/**
 * Created by Administrator on 2016/12/14.
 */
angular.module('cftApp.payRecord',[])
    .config(['$stateProvider',function ($stateProvider) {
        $stateProvider.state('tabs.payRecord',{
            url:'/payRecord',
            views:{
                'tabs-personal':{
                    templateUrl:'payRecord.html',
                    controller:'payRecordController'
                }
            }
        });
    }]).controller('payRecordController',['$scope','$rootScope',function ($scope,$rootScope) {
    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.hideTabs = true;
    });
}]);