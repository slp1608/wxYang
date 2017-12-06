/**
 * Created by qingyun on 16/11/30.
 */
angular.module('cftApp.integralStore',['ctfApp.searchBar','cftApp.goodsDetail']).config(['$stateProvider',function ($stateProvider) {
    $stateProvider.state('tabs.integralStore',{
        
        url:'/integralStore',
        views:{
            'tabs-integralStore':{
                
                templateUrl:'integralStore.html',
                controller:'integralStoreController'
            }
        }
    });
}]).controller('integralStoreController',['$scope','$rootScope','$ionicPopup','HttpFactory','$ionicSideMenuDelegate','$state','$ionicNavBarDelegate','$ionicViewSwitcher',function ($scope,$rootScope,$ionicPopup,HttpFactory,$ionicSideMenuDelegate,$state,$ionicNavBarDelegate,$ionicViewSwitcher) {
    
    $scope.integralObj = {
        //积分商品列表数据
        goodsData:[],
        //轮播图数据
        slideData: {
            bannerData: [],
            ishome: 1
        },
        //判断是否还有更多数据
        noneOfMoreData: false,
        //通过tab 获得侧边栏数据
        cateData: {},
        //是否加载更多
        moredata: false,
        //当前页数
        currentpage: 1,
        //切换侧边栏
        toggleRight: toggleRight,
        //进入商品详情页
        goDetail: goDetail,
        //下拉刷新
        doRefresh: doRefresh,
        //加载更多
        loadMore: loadMore,
        //进行搜索
        goSearch: goSearch,
        //兑换
        convertOption: convertOption
        
    };
    // 跳转 积分分类
    $scope.$on('integral_sortedView',function (event,data) {
        setTimeout(function () {
            $state.go("tabs.sortedIntegral",{searchStr:'',cate_id: data});
            // $ionicViewSwitcher.nextDirection('forward');
        },300);
    });
    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.hideTabs = false;
        $scope.searchValue = '';
    });
    var params = {
        total: perPageCount, //每页多少条数据
        page: $scope.integralObj.currentpage, // 当前页
        integral: 1, //integral
        bannum: 5, //默认5条
        is_recom:1
    };
    
    //搜索
    function goSearch(searchStr) {
        $state.go('tabs.sortedIntegral',{searchStr: searchStr});
        $rootScope.hideTabs = true;
        $ionicViewSwitcher.nextDirection('forward');
    }
    //侧栏菜单按钮
    function toggleRight() {
        //打开侧边栏时的一些默认数据，赋值 tab
        $scope.sideMenuObj.sideMenuOnOpened(1,0,$scope.integralObj.cateData);
        $ionicSideMenuDelegate.toggleRight();
    }
    
    //进入详情
    function goDetail(item) {
        $rootScope.hideTabs = true;
        $state.go('tabs.igDetail',{is_integral: "1", goods_id: item.goods_id});
        // $ionicViewSwitcher.nextDirection('forward');
    }
    
    //下拉刷新
    function doRefresh() {
        $scope.integralObj.currentpage = 1;
        params.page = $scope.integralObj.currentpage;
        var getData = {
            success: function (result) {
                console.log(result);
                if (result.status == 0){
                    $scope.$broadcast("homeSlideData",$scope.integralObj.slideData);
                    $scope.integralObj.goodsDatas = result["goodsData"];
                    $scope.integralObj.cateData = result["cateData"];
                    $scope.$broadcast('scroll.refreshComplete');
                    console.log(result["goodsData"].length);
                    if (result["goodsData"].length >= 10){
                        $scope.integralObj.moredata = false;
                    }
                    $scope.integralObj.currentpage++;
                }else {
                    $scope.popTipsShow(result.desc);
                }
            },
            error: function (err) {
                console.log(err);
            }
        };
        HttpFactory.getData("/api/getGoods",params)
            .then(
                getData.success,
                getData.error
            );
    }
    //加载更多
    function loadMore() {

        var getData = {
            success: function (result) {
                console.log(result);
                if (result.status == 0) {
                    if (result["goodsData"].length < perPageCount) {
                        $scope.integralObj.moredata = true;
                        $scope.integralObj.noneOfMoreData = true;
                    }else {
                        $scope.integralObj.noneOfMoreData = false;
                    }
                    if ($scope.integralObj.currentpage == 1){
                        $scope.sideMenuObj.sortedSecondClassObj = result["cateData"];
                        $scope.integralObj.slideData.bannerData = result["bannerData"];
                    }
                    $scope.integralObj.goodsData = $scope.integralObj.goodsData.concat(result.goodsData);
                    $scope.integralObj.currentpage += 1;
                    params.page = $scope.integralObj.currentpage;
                }else {
                    $scope.popTipsShow(result.desc);
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
    
            },
            error: function (err) {
                console.log(err);
            }
        };
        HttpFactory.getData("/api/getGoods",params)
            .then(
                getData.success,
                getData.error
            );
        console.log("加载更多");
    }
    //兑换方法
    function convertOption(event,item) {
        event.stopPropagation();
        $state.go('tabs.confirmOrder_IG',{goodsArray:JSON.stringify([item])});
        console.log(item);
        return;
    }
}]);