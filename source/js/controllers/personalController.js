/**
 * Created by qingyun on 16/11/30.
 */
angular.module('cftApp.personal',[]).config(['$stateProvider',function ($stateProvider) {
    $stateProvider.state('tabs.personal',{
        url:'/personal',
        views:{
            'tabs-personal':{
                templateUrl:'personal.html',
                controller:'personalController'
            }
        }
    });
}]).controller('personalController',['$scope','$rootScope','$state','$ionicViewSwitcher','$ionicModal','MainData',function ($scope,$rootScope,$state,$ionicViewSwitcher,$ionicModal,MainData) {

    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.hideTabs = false;
    });
    $scope.personal = {
        //用户名
        userName:localStorage.userName,
        //用户头像
        headimgurl:localStorage.headimgurl,
        //用户积分
        creditNum:localStorage.creditNum ? localStorage.creditNum : 0,
        //进入订单
        showOrder:showOrder,
        //进入收藏
        showCollect:showCollect,
        //进入购物车
        //showShoppingCar:showShoppingCar,
        //进入积分页面
        showCredit:showCredit,
        //进入收货地址页面
        showAddress:showAddress,
        //进入支付记录页面
        showPay:showPay,
        //进入关注页面
        showAttention:showAttention,
        //打开分享提示模态
        share:share
        
    };
    //进入订单页面
    function showOrder() {
        $state.go('tabs.myOrder');
        $ionicViewSwitcher.nextDirection("forward");
    }
    //进入收藏页面
    function showCollect() {
        $state.go('tabs.collectionPager');
    }
    //进入积分页面
    function showCredit() {
        $state.go('tabs.totalScore');
    }
    //进入购物车页面
    //function showShoppingCar() {
    //    $state.go('tabs.shoppingCart');
    //}
    //进入收货地址
    function showAddress() {
        MainData.isFromPersonToReceiptAddress = true;
        $state.go('tabs.receiptAddress');
    }
    //进入支付页面
    function showPay() {
        $state.go('tabs.payRecord');
    }
    //进入关注页面
    function showAttention() {
    }

    $ionicModal.fromTemplateUrl('shareModal.html',{
        scope:$scope,
        animation:'fade-in'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    //分享
    function share() {
        $scope.modal.show();
    }
    $scope.$on('$destroy',function () {
        $scope.modal.remove();
    })
}]);