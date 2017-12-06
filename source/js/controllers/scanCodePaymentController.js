/**
 * Created by zaq on 17/1/23.
 */
angular.module('cftApp.scanCodePayment',[])
    .config(['$stateProvider',function ($stateProvider) {
        $stateProvider.state('tabs.scanCodePayment',{
            url:'/scanCodePayment',
            views:{
                'tabs-napaStores':{
                    templateUrl:'scanCodePayment.html',
                    controller:'scanCodePaymentController'
                }
            }
        });
    }]).controller('scanCodePaymentController',['$scope','$rootScope','$ionicPopup','$timeout','$ionicModal','HttpFactory','$stateParams',function ($scope,$rootScope,$ionicPopup,$timeout, $ionicModal,HttpFactory,$stateParams) {
        console.log($stateParams);
    //隐藏tabs-bar
    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.hideTabs = true;
    });
    $scope.scanCodeObj = {
        price:null,
        confirmPayment:confirmPayment

    };
    function confirmPayment() {
        if ($scope.scanCodeObj.price == 0 || !$scope.scanCodeObj.price){
           $scope.popTipsShow("请输入您要付款的金额!");
            return;
        }
        $scope.loadingShow();
        HttpFactory.getData('/api/wxFranchise',{sessid:SESSID,franchise_id:3,price:$scope.scanCodeObj.price},'POST').then(function (result) {
            console.log(result);
            $scope.loadingOrPopTipsHide();
            if (result.status == 0){
                result = result.parameters;
                wx.chooseWXPay({
                    timestamp: result.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                    nonceStr: result.nonceStr, // 支付签名随机串，不长于 32 位
                    package: result.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                    signType: 'MD5', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                    paySign: result.paySign, // 支付签名
                    success: function (res) {
                        // 支付成功后的回调函数
                        if(res.errMsg == "chooseWXPay:ok"){

                        }else {
                            $scope.popTipsShow("支付出错!");
                        }
                    }
                });
            }else {
                $scope.popTipsShow(result.desc);
            }
        },function (err) {

        })
    }



}]);