/**
 * Created by chaoshen on 16/12/13.
 */
angular.module('cftApp.orderDetail',[])
    .config(['$stateProvider',function ($stateProvider) {
        $stateProvider.state('tabs.orderDetail',{
            url: '/orderDetail/:oid',
            views: {
                'tabs-personal': {
                    templateUrl: 'orderDetail.html',
                    controller: 'orderDetailController'
                }
            }
        }).state('tabs.orderDetail_home',{
            url: '/orderDetail_home/:oid',
            views: {
                'tabs-homePage': {
                    templateUrl: 'orderDetail.html',
                    controller: 'orderDetailController'
                }
            }
        }).state('tabs.orderDetail_ig',{
            url: '/orderDetail_ig/:oid',
            views: {
                'tabs-integralStore': {
                    templateUrl: 'orderDetail.html',
                    controller: 'orderDetailController'
                }
            }
        });
    }])
    .controller('orderDetailController',['$scope','HttpFactory','$stateParams',function ($scope,HttpFactory,$stateParams) {
        console.log($stateParams);
        //全部数据
        $scope.orderDetail = {
            orderData: null,
            stateInfos: ["未付款","待发货","待收货","交易完成","退款中","已退款","交易关闭"],
            cancelBill: cancelBill,
            payment: payment,
            confirm: confirm,
            appraise: appraise
        };
        
        function cancelBill(item) {
            console.log(item);
        }
        function payment(item) {
            console.log(item);
        }
        function refund(item) {
            console.log(item);
        }
        function confirm(item) {
            console.log(item);
        }
        function appraise(item) {
            console.log(item);
        }
        $scope.orderDetail.IconRootURL = IconROOT_URL;
        HttpFactory.getData("/api/Order", {sessid: SESSID,oid: $stateParams.oid}).then(function (result) {
            // console.log(result);
            if (result.status == 0) {
                $scope.orderDetail.orderData = result.orderData;
            }

            console.log(result);
        },function (error) {
            console.log(error);
        });
        
    }]);