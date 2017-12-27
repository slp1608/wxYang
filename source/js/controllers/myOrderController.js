/**
 * Created by lx on 2016/12/9.
 */
angular.module('cftApp.myOrder',['ionic','cftApp.orderDetail']).config(['$stateProvider',function ($stateProvider) {
    $stateProvider.state('tabs.myOrder',{
        url:'/myOrder',
        views: {
           'tabs-personal': {
               templateUrl:'myOrder.html',
               controller:'myOrderController'
           }
        }
        
    });

}]).controller('myOrderController',['$rootScope','$scope','$state','$ionicViewSwitcher','$ionicPopup','$ionicScrollDelegate','$timeout','HttpFactory',function ($rootScope,$scope,$state,$ionicViewSwitcher,$ionicPopup,$ionicScrollDelegate,$timeout,HttpFactory) {
    $scope.myOrder = {
        //用于过滤数据的关键字
        keyWords:'',
        //导航栏选项再点击选项按钮时触发的事件
        navData:navData,
        //全部订单信息
        orderDatas:[],
        //状态列表
        stateInfos: ["待付款","待发货","待收货","交易完成"],
        // stateInfos: ["待付款","待发货","待收货","交易完成","退款中","已退款","交易关闭"],
        //存储订单商品信息
        allData:'',
        //取消订单的方法
        cancelBill:cancelBill,
        //付款的方法
        payment:payment,
        //退款的方法
        refund:refund,
        //确认订单的方法
        confirm:confirm,
        //评价的方法
        appraise:appraise,
        //跳转订单详情
        goOrderDetail: goOrderDetail,
        //图片根地址
        PicROOT_URL: '',
        //申请退款原因
        applyMsg: '',
        //为空的信息
        emptyMsg: '',
        //是否加载更多
        moredata: false,
        //没有更多数据时显示的文本
        noMoreDataMsg: '',
        //加载更多
        loadMore: loadMore,
        //刷新
        doRefresh: doRefresh

    };
    var orderState = '';
    var params = {
        pageNum: 1,
        status: -1,
        userId: 1
        // type: 1
    };
    $scope.myOrder.PicROOT_URL = PicROOT_URL;
    
    //隐藏 tabs
    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.hideTabs = true;
    });
    //下拉刷新
    function doRefresh() {
        getOrders();
    }
    //下拉刷新获取订单数据
    function getOrders() {
        params.pageNum = 1;
        console.log(params);
        HttpFactory.getData('/orderList',params)
            .then(function (result) {
                if (result) {
                    $scope.$broadcast('scroll.refreshComplete');
                    
                    $scope.loadingOrPopTipsHide();
                    
                    $scope.myOrder.orderDatas = result;
                    // $scope.myOrder.emptyMsg = $scope.myOrder.orderDatas.length == 0 ? "您的此类订单为空O(∩_∩)O~" : '';
                    // if (params.page == 1 && $scope.myOrder.orderDatas.length == 0) {
                    //     $scope.myOrder.noMoreDataMsg = ''
                    // }
                    // $scope.myOrder.moredata = (result.orderData.length < 10);
                    params.pageNum ++;
                }else {
                    $scope.myOrder.moredata = false;
                }
            },function (err) {
                
            });
    }
    //上拉加载
    function loadMore() {
        console.log('loadMore');
        console.log(params);
        HttpFactory.getData('/orderList',params)
            .then(function (result) {
                console.log(result);
                // return;
                if (result) {
                    $scope.loadingOrPopTipsHide();
                    $scope.myOrder.orderDatas = $scope.myOrder.orderDatas.concat(result);
                    // console.log($scope.myOrder.orderDatas);
                    // $scope.myOrder.noMoreDataMsg = result.orderData.length < perPageCount ? "没有更多订单..." : '';
                    // $scope.myOrder.moredata = (result.orderData.length < 10);
                    // console.log($scope.myOrder.moredata);
                    // $scope.myOrder.emptyMsg = $scope.myOrder.orderDatas.length == 0 ? "您的此类订单为空O(∩_∩)O~" : '';
                    // if (params.page == 1 && $scope.myOrder.orderDatas.length == 0) {
                    //     $scope.myOrder.noMoreDataMsg = ''
                    // }
                    //放最后
                    params.pageNum ++;
                }else {
                    $scope.myOrder.moredata = false;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            },function (err) {
            });
    }
    //进入订单详情
    function goOrderDetail(orderData) {
        var orderObj = {
            orderData: orderData
        };
        //传参： 订单号
        $state.go('tabs.orderDetail',{oid: orderData.OrderNum});
    }
    //点击导航栏菜单
    function navData(event) {
        //每次点击的时候 页面置顶
        $ionicScrollDelegate.$getByHandle('orderScroll').scrollTop();
        //每次点击的时候不让下拉走
        $scope.myOrder.moredata = true;

        var list = angular.element(event.currentTarget).children();
        var item = angular.element(event.target);
        
        //对数据进行过滤
        if (item.text() === '全 部'){
            params.pageNum = 1;
            $scope.myOrder.orderDatas = [];
            $scope.myOrder.moredata = false;
            params.status = -1;
        }
        //改变元素的样式.
        if (event.currentTarget !== event.target){
            list.removeClass('active');
            item.addClass('active');
            params.pageNum = 1;
            $scope.myOrder.orderDatas = [];
            $scope.myOrder.moredata = false;
            // $scope.loadingShow();
            switch (item.text()){
                case '待付款':
                    params.status = 0;
                    // getOrders("0");
                    break;
                case '待发货':
                    params.status = 1;
                    // getOrders("1");
                    break;
                case '待收货':
                    params.status = 2;
                    // getOrders("2");
                    break;
                case '已完成':
                    params.status = 3;
                    // getOrders("3");
                    break;
                default:
                    break;
            }
        }
    }
    //取消订单
    function cancelBill(event,index) {
        event.stopPropagation();
        //弹出弹框
            $ionicPopup.show({
            cssClass:'myOrder',
            template:'确认要取消订单吗？',
            buttons:[{
                text:'取消',
                onTap:function () {

                }
            },{
                text:'确定',
                onTap:function () {
                    var params_index = {
                        sseid: SESSID,
                        oid: $scope.myOrder.orderDatas[index].mastOrderId,
                        state: 6
                    };
                    HttpFactory.getData("/api/Order",params_index,"PATCH").then(function (result) {
                        console.log(result);
                        if(result.status === 0){
                            $scope.myOrder.orderDatas[index].state = "6";
                            $scope.popTipsShow("取消成功!");
                        }else {
                            $scope.popTipsShow(result.desc);
                        }

                    },function (err) {

                    });
                }
            }]

        });

    }
    //付款
    function payment(items,event) {
        event.stopPropagation();
        console.log("付款");
    }
    //申请退款
    function refund(event,index) {
        event.stopPropagation();
        $ionicPopup.show({
            cssClass:'myOrder refund',
            template:'<p>申请退款</p><textarea id="applyMsg" ng-model="myOrder.applyMsg" placeholder="请输入申请退款的原因？" maxlength="100"></textarea><div>{{myOrder.applyMsg.length || "0"}}/100</div>',
            scope: $scope,
            buttons:[{
                text:'取消',
                onTap:function (e) {
                    
                }
            },{
                text:'确定',
                onTap:function () {
                    var params = {
                        sseid: SESSID,
                        oid: $scope.myOrder.orderDatas[index].mastOrderId,
                        state: 4,
                        mess: $scope.myOrder.applyMsg
                    };
                    HttpFactory.getData("/api/Order",params,"PATCH")
                        .then(function (result) {
                            console.log(result);
                            if(result.status === 0){
                                $scope.myOrder.orderDatas[index].state = "4";
                                $scope.popTipsShow("申请成功!");
                            }else {
                                $scope.popTipsShow(result.desc);
                            }
                        },function (error) {
                            
                        });
                }
            }]

        });
    }
    //确认收货
    function confirm(event,index) {
        event.stopPropagation();
        $ionicPopup.show({
            cssClass:'myOrder',
            template:'确认是否已收到货？',
            buttons:[{
                text:'取消',
                onTap:function () {

                }
            },{
                text:'确定',
                onTap:function () {
                    var params_index = {
                        sseid: SESSID,
                        oid: $scope.myOrder.orderDatas[index].mastOrderId,
                        state: 3
                    };
                    HttpFactory.getData("/api/Order",params_index,"PATCH").then(function (result) {
                        console.log(result);
                        if(result.status === 0){
                            $scope.myOrder.orderDatas[index].state = "3";
                            $scope.popTipsShow("交易完成!");
                        }else {
                            $scope.popTipsShow(result.desc);
                        }

                    },function (err) {

                    });
                }
            }]

        });
        
    }
    //去评价
    function appraise(items,event) {
        event.stopPropagation();
        $state.go('tabs.evaluatePage');
    }
}]);




