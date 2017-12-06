/**
 * Created by Administrator on 2016/12/14.
 */
angular.module('cftApp.totalScore',[])
    .config(['$stateProvider',function ($stateProvider) {
        $stateProvider.state('tabs.totalScore',{
            url:'/totalScore',
            views:{
                'tabs-personal':{
                    templateUrl:'totalScore.html',
                    controller:'totalScoreController'
                }
            }
        });
    }]).controller('totalScoreController',['$scope','$rootScope','$state','$ionicViewSwitcher','HttpFactory',function ($scope,$rootScope,$state,$ionicViewSwitcher,HttpFactory) {
    $scope.goExchange=function(msg){
        $state.go('tabs.integralStore');
        // $ionicViewSwitcher.nextDirection("forward");
    };
    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.hideTabs = true;
    });

     $scope.scoreObj = {
         scoreListDatas: []
        };

    HttpFactory.getData("/api/uintegral",{sessid:SESSID},"GET")
        .then(function (result) {
            $scope.scoreObj.scoreListDatas = result['integralData'];
            console.log($scope.scoreObj.scoreListDatas);
        },function (err) {

        });

}]);