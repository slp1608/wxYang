/**
 * Created by chaoshen on 2016/12/18.
 */
angular.module('cftApp.sortedGoods',[])
    .config(['$stateProvider',function ($stateProvider) {
        $stateProvider.state('tabs.sortedGoods',{
            url: '/sortedGoods/:searchStr/:cate_id',
            views: {
                'tabs-homePage': {
                    templateUrl: 'sortedGoods.html',
                    controller: "sortedGoodsController"
                }
            }

        })
    }])
    .controller('sortedGoodsController',['$scope','$stateParams','$state','$ionicSideMenuDelegate','HttpFactory','$ionicViewSwitcher','$ionicLoading','$ionicScrollDelegate','$ionicModal','$rootScope',function ($scope,$stateParams,$state,$ionicSideMenuDelegate,HttpFactory,$ionicViewSwitcher,$ionicLoading,$ionicScrollDelegate,$ionicModal,$rootScope) {
        
        var sortedGoodsObj = $scope.sortedGoodsObj = {
            //价格由高到低排序
            isPriceHeigh : true,
            //是否取消加载动画
            moredata: false,
            //判断是否还有更多数据
            noneOfMoreData: false,
            //排序关键字
            sortWords : '',
            //商品数据
            goodsDatas : [],
            //进入详情页
            goDetail : goDetail,
            //点击购物车
            takeShopping : takeShopping,
            //排序方式
            sortAction : sortAction,
            //搜索商品
            goSearch : goSearch,
            //刷新
            doRefresh: doRefresh,
            //加载更多
            loadMore: loadMore,
            //当前页面
            currentPage: 1,
            
            arrowImg : "images/xiaoArrow.png",

            searchStr : $stateParams.searchStr
            
        };
        $scope.$on('$ionicView.beforeEnter', function () {
            $rootScope.hideTabs = true;
        });
        
        //作为整个页面的参数对象使用，利于刷新时的统一
        
        var params = {
            pageNum : sortedGoodsObj.currentPage,
            searchStr : $stateParams.searchStr,
            "cate_id[]" : $stateParams.cate_id === '' ? '' : $stateParams.cate_id.split(',')
        };
        console.log(params);
        //下拉刷新
        function doRefresh() {
            if (params.searchStr === undefined){
                params.searchStr = "";
            }
            sortedGoodsObj.currentPage = 1;
            params.page = sortedGoodsObj.currentPage;
            sortedGoodsObj.moredata = false;
            var getData = {
                success: function (result) {

                    sortedGoodsObj.moredata = (result.length > 0);
                    sortedGoodsObj.goodsDatas = result;
                    sortedGoodsObj.currentPage += 1;
                    params.pageNum = sortedGoodsObj.currentPage;

                    $scope.$broadcast('scroll.refreshComplete');
                },
                error: function (err) {
                    
                }
            };
            HttpFactory.getData("/SearchProduct",params)
                .then(
                    getData.success,
                    getData.error
                );
        }
        //加载更多
        function loadMore() {

            if (sortedGoodsObj.currentPage === 1){
                setTimeout(function () {
                    var loadMoreData = {
                        success: function (result) {
                            console.log(result);
                            if (result.length > 0){
                                sortedGoodsObj.moredata = true;
                                sortedGoodsObj.noneOfMoreData = true;
                                sortedGoodsObj.dataIsNull = false;
                            }else {
                                sortedGoodsObj.moredata = false;
                                sortedGoodsObj.noneOfMoreData = false;
                                sortedGoodsObj.dataIsNull = true;
                            }

                            sortedGoodsObj.goodsDatas = sortedGoodsObj.goodsDatas.concat(result);
                            sortedGoodsObj.currentPage += 1;
                            params.pageNum = sortedGoodsObj.currentPage;

                            $scope.$broadcast('scroll.infiniteScrollComplete');
                        },
                        error: function (err) {

                        }
                    };
                    HttpFactory.getData("/SearchProduct",params)
                        .then(
                            loadMoreData.success,
                            loadMoreData.error);
                },300);
                return;
            }
            HttpFactory.getData("/SearchProduct",params)
                .then(function (result) {

                    if (result.length >0){
                        sortedGoodsObj.moredata = true;
                        sortedGoodsObj.noneOfMoreData = true;
                    }else {
                        sortedGoodsObj.noneOfMoreData = false;
                    }
                    sortedGoodsObj.goodsDatas = sortedGoodsObj.goodsDatas.concat(result);

                    $scope.$broadcast('scroll.infiniteScrollComplete');
                },function (err) {

                })
        }
        
        //进入商品详情页
        function goDetail(item) {
            $state.go('tabs.goodsDetail',{is_integral: 0,goods_id: item.goods_id});
        }
        //当前页搜索
        function goSearch(searchStr) {
            
            if (searchStr === undefined){
                searchStr = "";
                
            }
            params["cate_id[]"] = '';
            params.startPrice = '';
            params.endPrice = '';
            params.searchStr = searchStr;
            $scope.sideMenuObj.isSearch  = true;
            sortedGoodsObj.goodsDatas = [];
            doRefresh();
        }

        //点击购物车打开模态
        function takeShopping($event,item) {
            $event.stopPropagation();
            $scope.openModal();
            
            $scope.modal.goodsData = item;
            $scope.modal.IconRootURL = IconROOT_URL;
        }
        //模态窗口的立即购买
        $scope.goToConfirmOrder = function () {
            $scope.modal.goodsData.goodsNum = $scope.collect.val;
            $scope.modal.hide();
            $state.go("tabs.confirmOrder", {goodsArray: JSON.stringify([$scope.modal.goodsData])})
        };
        //购物车模态窗口相关操作
        $scope.collect = {
            val : 1,
            reduce:function () {
                if($scope.collect.val > 1){
                    $scope.collect.val--;
                }
            },
            add:function () {
                if($scope.collect.val > $scope.modal.goodsData.goods_number){
                    $scope.popTipsShow("抱歉,您添加的商品数量大于库存量");
                    return;
                }
                $scope.collect.val ++;
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
                goods_id: $scope.modal.goodsData.goods_id,
                num:$scope.collect.val,
                sessid:SESSID
            };
            HttpFactory.getData("/api/ushoppingCart",params,"POST").then(function (result) {
                
                if (result.status === 0) {
                    
                    user_car_num += 1;
                    $scope.user_Car_Num = user_car_num;
                    $scope.modal.hide();
                    $scope.popTipsShow("加入购物车成功");
                }else {
                    $scope.popTipsShow("加入购物车失败");
                }
            },function (err) {
               
            });
        };
        //排序请求
        function requestSorted(paramsObj) {
            
            sortedGoodsObj.moredata = false;
            sortedGoodsObj.currentPage = 1;
            paramsObj.page = 1;
            
            HttpFactory.getData("/api/getGoods",paramsObj)
                .then(function (result) {
                    if (result.status === 0) {
                        $scope.loadingOrPopTipsHide();
                        sortedGoodsObj.goodsDatas = result["goodsData"];
                    }
                    $ionicScrollDelegate.scrollTop();
                },function (err) {
                          
                });
        }
        //所有的排序行为
        function sortAction(event) {
            $scope.loadingShow();
            $scope.loadingOrPopTipsHide();
            var actions = angular.element(event.currentTarget).children();
            var target = angular.element(event.target);
            
            switch (target.text()){
                case "综合":
                    {
                        
                    }break;

                case "销量":
                    {
                        
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
            sortedGoodsObj.currentPage = 1;
            params.page = 1;
            params.startPrice = data["minPrice"];
            params.endPrice = data["maxPrice"];
            params.searchStr = '';
            sortedGoodsObj.goodsDatas = [];
            
            $scope.loadingShow();
            var sortedRequest = {
                success: function (result) {
                    if (result.status == 0){
                        $scope.loadingOrPopTipsHide();
                        
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