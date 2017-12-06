/**
 * Created by chaoshen on 2016/12/20.
 */
angular.module('cftApp.sortedIntegral',[])
    .config(['$stateProvider',function ($stateProvider) {
        $stateProvider.state('tabs.sortedIntegral',{
            url: '/sortedIntegral/:searchStr/:cate_id',
            views: {
                'tabs-integralStore': {
                    templateUrl: "sortedIntegralGoods.html",
                    controller: "sortedIntegralController"
                }
            }
        })
    }])
    .controller('sortedIntegralController',['$scope','$stateParams','$state','$ionicSideMenuDelegate','HttpFactory','$ionicViewSwitcher','$ionicScrollDelegate','$rootScope',function ($scope,$stateParams,$state,$ionicSideMenuDelegate,HttpFactory,$ionicViewSwitcher,$ionicScrollDelegate,$rootScope) {
    
        var sortedGoodsObj = $scope.sortedGoodsObj = {
            //对于价格按钮的点击逻辑起作用
            tapNums : 0,
            //记录价格排序方式
            isPriceHeigh : true,
            //是否支持加载更多数据
            moredata: false,
            viewTitle : '',
            //数据为空
            dataIsNull: false,
            //商品数据
            goodsDatas : [],
            //判断是否还有更多数据
            noneOfMoreData: false,
            //进入详情页
            goDetail : goDetail,
            //立即兑换
            convertNow : convertNow,
            //排序方式
            sortAction : sortAction,
            //搜索商品
            goSearch : goSearch,
            //刷新
            doRefresh: doRefresh,
            //加载更多
            loadMore: loadMore,
            //当前页面数
            currentPage: 1,
            arrowImg : "images/xiaoArrow.png"
        
        };
        $scope.$on('$ionicView.beforeEnter', function () {
            $rootScope.hideTabs = true;
        });
        $scope.sortedGoodsObj.viewTitle = $stateParams.sortname;
    
        //作为整个页面的参数对象使用，利于刷新时的统一
        var params = {
            integral: 1,
            total : perPageCount,
            page : sortedGoodsObj.currentPage,
            searchStr : $stateParams.searchStr,
            "cate_id[]" : $stateParams.cate_id.split(',')
        };
        
        //刷新
        function doRefresh() {
            if (params.searchStr == undefined){
                params.searchStr = "";
            }
            sortedGoodsObj.currentPage = 1;
            params.page = sortedGoodsObj.currentPage;
            sortedGoodsObj.moredata = false;
            var getData = {
                success: function (result) {
                    
                    if (result.status == 0){
                        if(result["goodsData"].length == 0){
                            sortedGoodsObj.dataIsNull = true;
                        }else {
                            sortedGoodsObj.dataIsNull = false;
                        }
                        sortedGoodsObj.goodsDatas = result["goodsData"];
                        sortedGoodsObj.currentPage++;
                    }
                    $scope.$broadcast('scroll.refreshComplete');
    
                },
                error: function (err) {
                    
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

            if (sortedGoodsObj.currentPage == 1){
                setTimeout(function () {
                    var loadMore = {
                        success: function (result) {

                            if (result.status == 0) {
                                sortedGoodsObj.currentPage += 1;
                                params.page = sortedGoodsObj.currentPage;
                                if (result["goodsData"].length < perPageCount){
                                    sortedGoodsObj.moredata = true;
                                    sortedGoodsObj.noneOfMoreData = true;
                                }else {
                                    sortedGoodsObj.noneOfMoreData = false;
                                }
    
                                if (result["goodsData"].length == 0){
                                    sortedGoodsObj.noneOfMoreData = false;
                                    sortedGoodsObj.dataIsNull = true;
                                }else {
                                    sortedGoodsObj.dataIsNull = false;
                                }
                                sortedGoodsObj.goodsDatas = sortedGoodsObj.goodsDatas.concat(result["goodsData"]);
                            }else {
                                
                            }
                            
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                        },
                        error: function (err) {
                            
                        }
                    };
                    HttpFactory.getData("/api/getGoods",params)
                        .then(
                            loadMore.success,
                            loadMore.error
                        );
                },300);
                return;
            }
            HttpFactory.getData("/api/getGoods",params)
                .then(function (result) {
                    
                    if (result.status == 0){
                        if (result["goodsData"].length < perPageCount){
                            sortedGoodsObj.moredata = true;
                            sortedGoodsObj.noneOfMoreData = true;
                        }else {
                            sortedGoodsObj.noneOfMoreData = false;
                        }
                        sortedGoodsObj.goodsDatas = sortedGoodsObj.goodsDatas.concat(result["goodsData"]);
                    }else {
                        
                    }
                    
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                },function (err) {
                    
                })
        }
    
        //进入商品详情页
        function goDetail(item) {
            $state.go('tabs.igDetail',{is_integral: 1,goods_id: item.goods_id});
            $ionicViewSwitcher.nextDirection('forward');
        }
        //当前页搜索
        function goSearch(searchStr) {
        
            if (searchStr == undefined){
                searchStr = "";
            
            }
            params["cate_id[]"] = [];
            params.startPrice = '';
            params.endPrice = '';
            params.searchStr = searchStr;
            $scope.sideMenuObj.isSearch = true;
            sortedGoodsObj.goodsDatas = [];
            doRefresh();
        }
        //点击购物车
        function convertNow($event,item) {
            
        }
        //排序请求
        function requestSorted(paramsObj) {
            
            sortedGoodsObj.moredata = false;
            sortedGoodsObj.currentPage = 1;
            paramsObj.page = 1;
            
            HttpFactory.getData("/api/getGoods",paramsObj)
                .then(function (result) {
                    sortedGoodsObj.goodsDatas = result["goodsData"];
                    $ionicScrollDelegate.scrollTop();
                },function (err) {
                
                });
        }
        function sortAction(event) {
            var actions = angular.element(event.currentTarget).children();
            var target = angular.element(event.target);
        
            switch (target.text()){
                case "综合":
                {
                    $scope.sortedGoodsObj.keyWords = '';
                }break;
            
                case "销量":
                {
                    $scope.sortedGoodsObj.keyWords = 'sellNums';
                }break;
            
                case "价格":
                {
                
                    if (target.hasClass("active")){
                        $scope.sortedGoodsObj.tapNums ++;
                        if ($scope.sortedGoodsObj.tapNums > 0){
                            $scope.sortedGoodsObj.isPriceHeigh = !$scope.sortedGoodsObj.isPriceHeigh;
                        
                            if ($scope.sortedGoodsObj.isPriceHeigh){
                                ascSorted();
                            }else {
                                descSorted();
                            }
                        }
                    }else {
                        //初次点击价格按钮时
                        $scope.sortedGoodsObj.tapNums = 0;
                        if ($scope.sortedGoodsObj.isPriceHeigh){
                            ascSorted();
                        }else {
                            descSorted();
                        }
                    }
                
                }break;
            
                case "筛选": {
                    $scope.sideMenuObj.sideMenuOnOpened(0,1);
                    $ionicSideMenuDelegate.toggleRight();
                }break;
            }
            function ascSorted() {
                sortedGoodsObj.goodsDatas = [];
                params.sfield = "shop_price";
                params.sort = "asc";
                requestSorted(params);
                $scope.sortedGoodsObj.keyWords = '-price';
                $scope.sortedGoodsObj.arrowImg = "images/xiaoArrow.png"
            }
            function descSorted() {
                sortedGoodsObj.goodsDatas = [];
                params.sfield = "shop_price";
                params.sort = "desc";
            
                requestSorted(params);
                $scope.sortedGoodsObj.keyWords = 'price';
                $scope.sortedGoodsObj.arrowImg = "images/shangArrow.png"
            }
            //这里是为了避免箭头图片作为点击对象
            if (target.toString().indexOf("Image")!=-1){
                
                if (target.parent().text() != "筛选"){
                    
                    actions.removeClass("active");
                    target.parent().addClass("active");
                }
            }else if(target.text() == "筛选"){
            
            }else  {
                actions.removeClass("active");
                target.addClass("active");
            }
        }
        $scope.$on("sureSorted",function (event,data) {
            
            $scope.searchStr = '';
            
            sortedGoodsObj.currentPage = 1;
            if (data["sortedSelectedIDS"].length > 1) {
                params["cate_id[]"] = [];
                params["cate_id[]"]= data["sortedSelectedIDS"];
            }else {
                var sortedClassIDS = data["sortedSelectedIDS"];
                angular.forEach($scope.sideMenuObj.sortedSecondClassObj[data["sortedSelectedIDS"][0]].childData,function (item) {
                    sortedClassIDS.push(item.id);
                });
                params["cate_id[]"] = sortedClassIDS;
        
            }
            
            params.startPrice = data["minPrice"];
            params.endPrice = data["maxPrice"];
            params.searchStr = '';
            sortedGoodsObj.goodsDatas = [];
            sortedGoodsObj.noneOfMoreData = false;
            
            var sortedRequest = {
                success: function (result) {
                    if (result.status == 0){
                
                        if (result["goodsData"].length == 0)
                        {
                            sortedGoodsObj.dataIsNull = true;
                            
                        }
                        else
                        {
                            sortedGoodsObj.dataIsNull = false;
                        }
                
                
                        sortedGoodsObj.goodsDatas = result["goodsData"];
                    }
                    
                },
                error: function (err) {
                    
                }
            };
            HttpFactory.getData("/api/getGoods",params)
                .then(
                    sortedRequest.success,
                    sortedRequest.error
                );
        });
    }]);