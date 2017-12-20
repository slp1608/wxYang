/**
 * Created by chaoshen on 2016/12/26.
 */

angular.module('cftApp.goodsDetail',[]).config(['$stateProvider',function ($stateProvider) {
    $stateProvider.state('tabs.goodsDetail',{
        url:'/goodsDetail/:goods_id',
        cache:false,
        views: {
            'tabs-homePage':{
                templateUrl:'goodsDetail.html',
                controller:'goodsDetailController'
            }

        }
    });
    $stateProvider.state('tabs.goodsDetail_collection',{
        url:'/goodsDetail_collection/:goods_id',
        cahce:false,
        views: {
            'tabs-personal':{
                templateUrl:'goodsDetail.html',
                controller:'goodsDetailController'
            }
        }
    });
}]).controller('goodsDetailController',['$scope','$ionicScrollDelegate','$location','$stateParams','$state','$ionicViewSwitcher','$ionicModal','HttpFactory','$rootScope','$timeout',function ($scope,$ionicScrollDelegate,$location,$stateParams,$state,$ionicViewSwitcher,$ionicModal,HttpFactory,$rootScope,$timeout) {
    
    $scope.goodsObj = {
        PicROOT_URL: PicROOT_URL,
        //商品id
        goods_id: $stateParams.goods_id,
        //是否售罄
        isSellOut:false,
        collectName: "收藏",
        //是否收藏
        isCollect: false,
        //详情是否激活
        isInfoActive: true,
        //参数是否激活
        isParamActive: false,
        //评论是否激活
        isAssessActive: false,
        //图片根地址
        IconRootURL: '',
        //视图切换
        selection: 'goodsInfo',
        //商品数据
        goodsData: {},
        //轮播视图数据
        slideData: {
            bannerData: [],
            ishome: 2 //这里用于区分首页和积分首页的0 和 1，用于标示不能被点击
        },
        //收藏
        collectOption: collectionOption,
        //商品数量
        changeGoodsNums: changeGoodsNums,
        //选中 商品详情
        selectInfo: selectInfo,
        //选中 商品参数
        selectParam: selectParam,
        // 选中 商品评价
        // selectAssess: selectAssess,
        // 选中 购物车
        goShoppingCar: goShoppingCar,
        // 选中 加入购物车
        putinShoppingCar: putinShoppingCar,
        // 选中 立即购买
        buyNow: buyNowOption,
        //返回 首页
        backHome: backHome
        
    };
    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.hideTabs = true;
    });
    //设置购物车徽章
    // HttpFactory.getData("/shopCartList", {sessid:SESSID}).then(function (result) {
    //    if (result.status == 0){
    //        user_car_num = result.shoppingCart.length;
    //        $scope.user_Car_Num = user_car_num;
    //    }
    // },function (err) {
    //
    // });
    
    //拉取商品详情信息的方法
    setTimeout(function () {
        var params = {
            id: $scope.goodsObj.goods_id
        };
        //显示加载动画
        $scope.loadingShow();
        HttpFactory.getData("/GetProductInfo",params).then(function (result) {
            console.log(result);
            var data = result;
            $scope.loadingOrPopTipsHide();
            if (data.StockNum === 0){
                $scope.goodsObj.isSellOut = true;
            }
            $scope.goodsObj.slideData.bannerData = data["Pic"];
            $scope.goodsObj.slideData.ClassId = data["id"]+'/mainPic/';
            $scope.goodsObj.goodsData = data;
            if ($scope.goodsObj.goodsData.is_coll === 1){
                $scope.goodsObj.isCollect = true;
                $scope.goodsObj.collectName = "已收藏";
            }
        },function (err) {
            throw new Error("enter goods detail error: "+err);
        });
    },500);

    //点击收藏按钮执行的方法
    function collectionOption(goods_id) {
        $scope.goodsObj.isCollect = !$scope.goodsObj.isCollect;
        //if ($scope.goodsObj.isCollect){
        //
        //    $scope.goodsObj.collectName = "已收藏";
        //    var collectParams = {
        //        goods_id: goods_id,
        //        sessid:SESSID
        //    };
        //    HttpFactory.getData("/api/ucollection",collectParams,"POST").then(function (result) {
        //
        //        if (result.status == 0) {
        //            $scope.popTipsShow("收藏成功");
        //        }
        //        if (result.status !== 0) {
        //            $scope.popTipsShow(result.desc);
        //        }
        //    },function (err) {
        //        throw new Error("enter goods detail error: "+err);
        //    });
        //}else {
        //
        //    $scope.goodsObj.collectName = "收藏";
        //    var noCollectParams = {
        //        goods_id: goods_id,
        //        sessid:SESSID
        //    };
        //    HttpFactory.getData("/api/ucollection",noCollectParams,"DELETE").then(function (result) {
        //
        //        if (result.status == 0) {
        //            $scope.popTipsShow("已取消收藏");
        //        }
        //        if (result.status !== 0) {
        //            $scope.popTipsShow(result.desc);
        //        }
        //    },function (err) {
        //        throw new Error("enter goods detail error: "+err);
        //    });
        //}
    }
    function backHome() {
        $state.go('tabs.homePage');
    }
    function changeGoodsNums() {
        $scope.openModal();
    }
    
    var slideLine = document.getElementById('slideLine');
    
    function selectInfo() {
        $scope.goodsObj.isInfoActive = true;
        $scope.goodsObj.isParamActive = false;
        $scope.goodsObj.isAssessActive = false;
        slideLine.style.left = "13%";
        $scope.goodsObj.selection='goodsInfo';
        $ionicScrollDelegate.resize();
    }
    function selectParam() {
        $scope.goodsObj.isInfoActive = false;
        $scope.goodsObj.isAssessActive = false;
        $scope.goodsObj.isParamActive = true;
        slideLine.style.left = "63%";
        $scope.goodsObj.selection='goodsParam';
        $ionicScrollDelegate.resize();
        setTimeout(function () {
            $ionicScrollDelegate.resize();
        },200);
    }

    //点击底部的购物车按钮
    function goShoppingCar() {
        if ($state.current.name === 'tabs.goodsDetail'){
            $state.go('tabs.shoppingCart_fromDetail');
            $ionicViewSwitcher.nextDirection('forward');
        }else {
            $state.go('tabs.shoppingCart');
            $ionicViewSwitcher.nextDirection('forward');
        }
    }
    $ionicModal.fromTemplateUrl('shopCarModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function() {
        $scope.modal.show();
    };
    
    //当我们用到模型时，清除它！
    $scope.$on('$destroy', function() {
        $scope.loadingOrPopTipsHide();
        $scope.modal.remove();
    });
    function putinShoppingCar() {
        $scope.openModal();
    }
    //底部的立即购买
    function buyNowOption() {
        $scope.goodsObj.goodsData.Num = $scope.collect.val;
        if ($location.path().indexOf("goodsDetail_collection") > -1){
            $state.go("tabs.confirmOrder_personal",{goodsArray:JSON.stringify([$scope.goodsObj.goodsData])});
        }else {
            var goodsData = $scope.goodsObj.goodsData;
            console.log('yao fa song de ');
            console.log(goodsData);
            var PicArr = goodsData.Pic;
            goodsData.Pic = PicArr[0];
            $state.go("tabs.confirmOrder",{goodsArray:JSON.stringify([goodsData])});
        }
    }
    //购物车模态窗口相关操作
    $scope.collect = {
        val : 1,
        reduce:function () {
            if($scope.collect.val > 1){
                $scope.collect.val--;
            }
        },
        add:function () {
            if($scope.collect.val < parseInt($scope.goodsObj.goodsData.StockNum)){
                $scope.collect.val ++;
            }else {
                $scope.popTipsShow("抱歉,您添加的商品数量大于库存量");
            }
        }
    };
    //点击数量打开加入购物车和立即购买的modal
    $ionicModal.fromTemplateUrl('shopCarModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
        
    });
    $scope.openModal = function() {
        $scope.modal.show();
        var goodsData = $scope.goodsObj.goodsData;
        var PicArr = goodsData.Pic;
        goodsData.Pic = PicArr[0];
        $scope.modal.goodsData = goodsData;
        $scope.modal.PicROOT_URL = PicROOT_URL;
    };
    //点击模态窗口的加入购物车触发的方法
    $scope.addToShoppingCar = function () {
        if($scope.modal.goodsData.StockNum <= 0){
            $scope.popTipsShow("抱歉,该商品没有库存了,加入购物车失败!");
            $scope.modal.hide();
            return;
        }
        var params = {
            productId: $scope.modal.goodsData.id,
            num: $scope.collect.val,
            userId: 1
        };
        HttpFactory.getData("/UpdateShopCart",params,"POST").then(function (result) {
            if ( result.returnVal === 'success' ) {
                $scope.modal.hide();
                $scope.popTipsShow("加入购物车成功");
            }else {
                $scope.popTipsShow(result.msg);
            }
        },function (err) {
            
        });
    };
    //模态窗口的立即购买
    $scope.goToConfirmOrder = function () {
        $scope.modal.hide();
        if($scope.goodsObj.isSellOut){
            $scope.popTipsShow("抱歉,该商品没有库存了!");
            return;
        }
        $scope.goodsObj.goodsData.Num = $scope.collect.val;
        if ($location.path().indexOf('goodsDetail_collection') > -1){
            $state.go("tabs.confirmOrder_personal",{goodsArray:JSON.stringify([$scope.goodsObj.goodsData])});
        }else {
            $state.go("tabs.confirmOrder",{goodsArray:JSON.stringify([$scope.goodsObj.goodsData])});
        }

    };

}]);