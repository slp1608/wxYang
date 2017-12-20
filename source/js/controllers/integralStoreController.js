/**
 * Created by qingyun on 16/11/30.这个页面做成分类页面
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
        PicROOT_URL: PicROOT_URL,
        //积分商品列表数据
        goodsDatas:[],
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
        pageNum: 1,
        //切换侧边栏
        // toggleRight: toggleRight,
        //进入商品详情页
        goDetail: goDetail,
        //下拉刷新
        doRefresh: doRefresh,
        //加载更多
        loadMore: loadMore,
        //进行搜索
        goSearch: goSearch,
        //兑换
        convertOption: convertOption,
        // //选择首页一级菜单
        selectHomeFirstClass: {

        },
        // //选中首页二级菜单
        // tapedHomeSecondClass: tapedHomeSecondClass,
        // //侧边栏菜单打开时的一些默认配置和操作
        // sideMenuOnOpened: sideMenuOnOpened,
        // //选中筛选一级菜单
        // selectFiterFirstClass: selectFiterFirstClass,
        // //选中筛选二级菜单
        // tapedSortedSecondClass: tapedSortedSecondClass,
        //取消按钮
        // cancelOption: cancelOption,
        //确认按钮
        // sureOption: sureOption
        //重置侧边栏
        // resetSideMenu: resetSideMenu
        
    };
    console.log("分类页面");
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
    // var params = {
    //     total: perPageCount, //每页多少条数据
    //     page: $scope.integralObj.currentpage, // 当前页
    //     integral: 1, //integral
    //     bannum: 5, //默认5条
    //     is_recom:1
    // };

    var params = {
        classId: 1,
        pageNum: $scope.integralObj.pageNum
    };
    //搜索
    function goSearch(searchStr) {
        $state.go('tabs.sortedIntegral',{searchStr: searchStr});
        $rootScope.hideTabs = true;
        $ionicViewSwitcher.nextDirection('forward');
    }
    //侧栏菜单按钮
    // function toggleRight() {
    //     //打开侧边栏时的一些默认数据，赋值 tab
    //     $scope.sideMenuObj.sideMenuOnOpened(1,0,$scope.integralObj.cateData);
    //     $ionicSideMenuDelegate.toggleRight();
    // }
    
    //进入详情
    function goDetail(item) {
        $rootScope.hideTabs = true;
        $state.go('tabs.goodsDetail',{goods_id: item.id});
        $ionicViewSwitcher.nextDirection('forward');
    }
    
    //下拉刷新
    function doRefresh() {
        console.log("doRefresh success");
        $scope.integralObj.pageNum = 1;
        params.pageNum = $scope.integralObj.pageNum;
        var getData = {
            success: function (result) {
                console.log(result);
                $scope.integralObj.slideData.bannerData = result["bannerData"];
                $scope.integralObj.goodsDatas = result;
                $scope.integralObj.pageNum++;
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
    //加载更多
    function loadMore() {

        console.log("加载更多");
        var loadMoreData = {
            success: function (result) {
                console.log("loadMore success");
                console.log(result);
                (result.length) ? $scope.integralObj.noneOfMoreData=false : $scope.integralObj.noneOfMoreData=true;
                // if ($scope.homeintegralObjObj.pageNum == 1)
                // {
                //     $scope.sideMenuObj.sortedSecondClassObj = result["cateData"];
                //     $scope.integralObj.slideData.bannerData = result["bannerData"];
                // }
                $scope.integralObj.goodsDatas = $scope.integralObj.goodsDatas.concat(result);
                //必须放下面
                $scope.integralObj.pageNum += 1;
                params.pageNum = $scope.integralObj.pageNum;
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
    //兑换方法
    function convertOption(event,item) {
        event.stopPropagation();
        $state.go('tabs.confirmOrder_IG',{goodsArray:JSON.stringify([item])});
        console.log(item);
        return;
    }

    function selectHomeFirstClass(event,key) {
        console.log(key);
        // selectedFirstClassID = key;
        selectedObj.oneclass = key;

        selectedIDS = [];
        selectedIDS.push(key);
        setSecondClassMenu(key);
    }
    function tapedHomeSecondClass(event,item) {

        selectedObj.secondClass = [];
        selectedObj.secondClass.push(item.id);
        selectedIDS.push(item.id);
        CftStore.setObject("selectedObj",selectedObj);
        console.log(CftStore.getObject("selectedObj"));
        $rootScope.hideTabs = true;
        if (sideMenuObj.is_integral === 0){
            console.log(selectedObj);
            $scope.$broadcast("home_sortedView",selectedIDS);
        }else {
            $scope.$broadcast("integral_sortedView",selectedIDS);
        }
    }
    //通过一级分类的键获取二级分类数据
    function setSecondClassMenu(num) {
        sideMenuObj.headTitle = "二级分类";
        $scope.sideMenuObj.menuSecondClasses = sideMenuObj.sortedSecondClassObj[num].childData;
        var secondClasses = angular.element(document.querySelector("#secondClasses")).children();
        secondClasses.removeClass("active");
    }

    //is_integral; 0 普通商品首页 1 积分首页; is_allGoods: 0 全部普通商品 1 全部积分商品
    function sideMenuOnOpened(is_integral,is_allGoods) {
        sideMenuObj.is_allGoods = is_allGoods;
        sideMenuObj.is_integral = is_integral;
        sideMenuObj.sortedClassKeys = Object.keys(sideMenuObj.sortedSecondClassObj);
        if (!is_allGoods){
            console.log("首页or积分首页");
            sideMenuObj.headTitle = "一级分类";
        }else {
            cancelOption();
            if (sideMenuObj.isSearch){
                selectedObj.oneclass = '2';
                selectedObj.secondClass = [];
                selectedObj.minPrice = '';
                selectedObj.maxPrice = '';
                CftStore.setObject("selectedObj",selectedObj);
            }else {
                selectedObj = CftStore.getObject("selectedObj");
            }
            sideMenuObj.filterObj.minPrice = selectedObj.minPrice;
            sideMenuObj.filterObj.maxPrice = selectedObj.maxPrice;
            setSecondClassMenu(selectedObj.oneclass);

            setTimeout(function () {

                //打开时先获取本地选中对象
                setSecondClassMenu(selectedObj.oneclass);
                //将所有一级菜单重置
                var firstClasses = angular.element(document.getElementById("sortedFirstClass")).children();
                firstClasses.removeClass("active");
                //设置一级菜单
                angular.forEach(firstClasses,function (value,key) {
                    //转为ng元素
                    var ngEle = angular.element(value);

                    if (ngEle.hasClass(selectedObj.oneclass))
                        ngEle.addClass("active");

                });
                var secondClasses = angular.element(document.getElementById("secondClasses")).children();
                secondClasses.removeClass("active");
                //设置二级菜单
                for (var className in selectedObj.secondClass){
                    if (selectedObj.secondClass.hasOwnProperty(className)){
                        console.log("className: "+ className);
                        angular.forEach(secondClasses,function (value,key) {
                            var ngEle = angular.element(value);
                            console.log(ngEle.hasClass(selectedObj.secondClass[Number(className)]));
                            if (ngEle.hasClass(selectedObj.secondClass[Number(className)])){
                                ngEle.addClass("active");
                            }
                        });
                    }
                }
            },10);
        }
    }

    //2.全部商品 筛选分类逻辑
    function selectFiterFirstClass(event,key) {

        selectedObj.secondClass = [];
        var firstClasses = angular.element(document.getElementById("sortedFirstClass")).children();
        firstClasses.removeClass("active");
        var target = angular.element(event.target);
        target.addClass("active");
        setSecondClassMenu(key);
        //修改本地的一级选中
        selectedObj.oneclass = key;

    }

    function tapedSortedSecondClass(event,item) {
        var target = angular.element(event.target);
        if (target.hasClass("active")){
            target.removeClass("active");
            selectedObj.secondClass.cftRemove(item.id);

        }else {
            console.log(target);
            target.addClass("active");
            selectedObj.secondClass.push(item.id);
        }
    }
    function cancelOption() {
        selectedObj = CftStore.getObject("selectedObj");
        var secondClasses = angular.element(document.querySelector("#secondClasses")).children();
        secondClasses.removeClass("active");
    }
    function sureOption() {
        selectedObj.minPrice = sideMenuObj.filterObj.minPrice;
        selectedObj.maxPrice = sideMenuObj.filterObj.maxPrice;
        sideMenuObj.isSearch = false;
        CftStore.setObject("selectedObj",selectedObj);

        selectedIDS = [];
        selectedIDS.push(selectedObj.oneclass);
        selectedIDS = selectedIDS.concat(selectedObj.secondClass);
        sideMenuObj.filterObj.sortedSelectedIDS = selectedIDS;
        $scope.$broadcast("sureSorted",sideMenuObj.filterObj);
    }


}]);