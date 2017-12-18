angular.module('cftApp.homePage',[]).config(['$stateProvider',function ($stateProvider) {
    $stateProvider.state('tabs.homePage',{
        url:'/homePage',
        views:{
            'tabs-homePage':{
                templateUrl:'homePage.html',
                controller:'homePageController'
            }
        }
    });

}]).controller('homePageController',['$scope','$rootScope','$ionicPopup','HttpFactory','$ionicSideMenuDelegate','$state','$ionicNavBarDelegate','$ionicViewSwitcher','$ionicModal',function ($scope,$rootScope,$ionicPopup,HttpFactory,$ionicSideMenuDelegate,$state,$ionicNavBarDelegate,$ionicViewSwitcher,$ionicModal) {
    //搜索
   $scope.homeObj = {
       //轮播图数据
       slideData: {
           bannerData: [],
           ishome: 0
       },
       PicROOT_URL: PicROOT_URL,
       //通过tab 获得侧边栏数据
       cateData: {},
       //当前页数
       pageNum: 1,
       sideObj: {},
       //商品数据
       goodsDatas: [],
       //是否有更多数据
       noneOfMoreData: false,
       //已售罄
       sellOut: sellOut,
       //进入商品详情页
       goDetail: goDetail,
       //加入购物车
       takeShorpping: takeShorpping,
       //下拉刷新
       doRefresh: doRefresh,
       //加载更多
       loadMore: loadMore,
       //进行搜索
       goSearch: goSearch
    };
    console.log("homepage");
    var params = {
        classId: 1,
        pageNum: $scope.homeObj.pageNum
    };
    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.hideTabs = false;
        $scope.searchValue = '';
    });
    //搜索
    function goSearch(searchStr) {
        $state.go('tabs.sortedGoods',{searchStr: searchStr});
        $rootScope.hideTabs = true;
        $scope.sideMenuObj.isSearch = true;
        $ionicViewSwitcher.nextDirection('forward');
    }

    //进入商品详情
    function goDetail(item) {
        // $rootScope.hideTabs = true;
        $state.go('tabs.goodsDetail',{goods_id: item.id});
        $ionicViewSwitcher.nextDirection('forward');
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
            if($scope.collect.val > ($scope.modal.goodsData.StockNum - 1) ){
                $scope.popTipsShow("抱歉,您添加的商品数量大于库存量");
                return;
            }
            $scope.collect.val++;
        }
    };
    //加入购物车的模态窗口
    $ionicModal.fromTemplateUrl('shopCarModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function() {
        //每次打开模态窗口都要清空数量
        $scope.collect.val = 1;
        $scope.modal.show();
    };

    //点击模态窗口的加入购物车触发的方法
    $scope.addToShoppingCar = function () {
        
        var params = {
            productId: $scope.modal.goodsData.id,
            num: $scope.collect.val,
            userId: 1
        };
        console.log(params);
        HttpFactory.getData("/UpdateShopCart",params,"POST").then(function (result) {
            console.log("返回的数据");
            console.log(result);
            if ( result.returnVal === 'success' ) {
                $scope.modal.hide();
                $scope.popTipsShow("加入购物车成功");
            }else {
                $scope.popTipsShow("加入购物车失败");
            }
        },function (err) {

        });
    };
    //模态窗口的立即购买
    $scope.goToConfirmOrder = function () {
        $scope.modal.goodsData.Num = $scope.collect.val;
        $scope.modal.hide();
        $state.go("tabs.confirmOrder",{goodsArray:JSON.stringify([$scope.modal.goodsData])});
    };
    //当我们用到模型时，清除它！
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
    function sellOut(event) {
        event.stopPropagation();
        $scope.popTipsShow("商品已售罄");
    }
    //打开模态窗口
    function takeShorpping($event,item) {
        $event.stopPropagation();
        $scope.openModal();
        console.log(item);
        $scope.modal.goodsData = item;
        $scope.modal.PicROOT_URL = PicROOT_URL;
    }
    //下拉刷新
    function doRefresh() {
        console.log("doRefresh success");
        $scope.homeObj.pageNum = 1;
        params.pageNum = $scope.homeObj.pageNum;
        var getData = {
            success: function (result) {
                console.log(result);
                $scope.homeObj.slideData.bannerData = result["bannerData"];
                $scope.homeObj.goodsDatas = result;
                $scope.homeObj.pageNum++;
                $scope.$broadcast('scroll.refreshComplete');
            },
            error: function (err) {
                
            }
        };
        HttpFactory.getData("/productList",params,"POST")
            .then(
                getData.success,
                getData.error);
    }
    //上拉加载
    function loadMore() {
        var loadMoreData = {
            success: function (result) {
                console.log("loadMore success");
                console.log(result);
                (result.length) ? $scope.homeObj.noneOfMoreData=false : $scope.homeObj.noneOfMoreData=true;
                // if ($scope.homeObj.pageNum == 1)
                // {
                //     $scope.sideMenuObj.sortedSecondClassObj = result["cateData"];
                //     $scope.homeObj.slideData.bannerData = result["bannerData"];
                // }
                $scope.homeObj.goodsDatas = $scope.homeObj.goodsDatas.concat(result);
                //必须放下面
                $scope.homeObj.pageNum += 1;
                params.pageNum = $scope.homeObj.pageNum;
                $scope.$broadcast('scroll.infiniteScrollComplete');

            },
            error: function (err) {
                console.log("error");
                console.log(err);
            }
        };
        HttpFactory.getData("/productList",params,"POST")
            .then(
                loadMoreData.success,
                loadMoreData.error);
    }

}]);