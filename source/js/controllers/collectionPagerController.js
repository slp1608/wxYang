/**
 * Created by lx on 2016/12/9.
 */
angular.module('cftApp.collection',['ionic']).config(['$stateProvider',function ($stateProvider) {
    $stateProvider.state('tabs.collectionPager',{
        cache:false,
        url:'/collectionPager',
        views:{
            'tabs-personal':{
                templateUrl:'collectionPager.html',
                controller:"collectionPagerController"
            }
        }
      });
}]).controller('collectionPagerController',['$scope','$ionicModal','HttpFactory','$rootScope','$ionicPopup','$state','$ionicViewSwitcher',function ($scope,$ionicModal,HttpFactory,$rootScope,$ionicPopup,$state,$ionicViewSwitcher) {
    //隐藏 tabs
    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.hideTabs = true;
    });
    $scope.collect = {
        //图片跟地址
        iconRootUrl: '',
        //收藏是否为空的提示
        emptyShopCarStr:'',
        //收藏列表数组
        collectionData: [],
        //删除商品
        deleteCollect:deleteCollect,
        //用户点击商品购买的数量
        val : 1,
        //减少商品数量
        reduce:reduce,
        //增加商品数量
        add:add,
        loadCollectionsData: loadCollectionsData,
        //下拉刷新
        doRefresh:doRefresh,
        //上拉加载
        loadMore:loadMore,
        //是否加载更多
        isShowInfinite:true,
        //立即兑换
        goToExchangeNow:goToExchangeNow,
        //进入商品详情
        goToGoodsDetail:goToGoodsDetail

    };
    

    var index =0;
    $scope.collect.IconROOT_URL = IconROOT_URL;
    //下拉刷新
    function doRefresh() {
        index = 1;
        loadCollectionsData('下拉');
        $scope.$broadcast('scroll.refreshComplete');
        $scope.collect.isShowInfinite = true;
    }
    //加载更多
    function loadMore() {
        index +=1;
        loadCollectionsData('上拉');
        
        
    }
    
    function loadCollectionsData(changeState) {
        var url = "/api/ucollection";
        var params = {
            page:index,
            sessid:SESSID
        };
        HttpFactory.getData(url,params)
            .then(function (result) {
                if(result.status == 10014){
                    $scope.popTipsShow(result.desc);
                    window.history.back();
                    $scope.collect.isShowInfinite = false;
                    return;
                }
                if(!result.collectionData.length){
                    $scope.collect.emptyShopCarStr = "您的收藏列表是空的O(∩_∩)O~";
                }
                
                 if(changeState == "下拉"){
                     index += 1;
                     $scope.collect.collectionData = result.collectionData;
                     
                 }else if(changeState=="上拉" && result.collectionData.length!=0){
                     $scope.collect.collectionData =  $scope.collect.collectionData.concat(result.collectionData);
                 }else if(result.collectionData.length == 0){
                     $scope.collect.isShowInfinite = false;

                 }

                if ($scope.collect.collectionData.length < 8){
                    $scope.collect.isShowInfinite = false;
                }else {

                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
                
            },function (err) {
                
                $scope.collect.isShowInfinite = false;
            });
    }

    //取消收藏
    function deleteCollect(event,item,index){
        $ionicPopup.show({
            cssClass:'myOrder',
            template:'确认要删除吗?',
            scope: $scope,
            buttons: [
                { text: '取消',
                    onTap:function () {
                    
                    }
                },
                {
                    text: '确定',
                    onTap: function(e) {
                    
                        var params = {
                            id: item["id"],
                            sessid:SESSID
                        
                        };
                        HttpFactory.getData("/api/ucollection",params,"DELETE")
                            .then(function (result) {
                                if (result.status == 0) {
                                    $scope.popTipsShow('删除成功');
                                    $scope.collect.collectionData.splice(index,1);
                                    
                                }else {
                                    $scope.popTipsShow("删除失败");
                                    
                                }
                            },function (err) {
                                
                            });
                    }
                }
            ]
        });
          
        event.stopPropagation();
    }
    
    //加入购物车的模态窗口
    $ionicModal.fromTemplateUrl('shopCarModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    //打开加入购物车的模态窗口
    $scope.shopCardShow = function(index,event) {
        event.stopPropagation();
        $scope.modal.show();
        
        //用在加入购物车模态窗口详情的商品内容
        $scope.goods_index = $scope.collect.collectionData[index];
        //模态窗口的图片地址前缀
        $scope.modal.IconRootURL =  IconROOT_URL;
        $scope.modal.goodsData = {
            goods_introduction: [$scope.collect.collectionData[index].litpic],
            goods_name:$scope.collect.collectionData[index].title,
            shop_price:$scope.collect.collectionData[index].price,
            goods_number:$scope.collect.collectionData[index].num
        };
        // $scope.modal.goodsData = $scope.collect.collectionData[index];
    };

    //当我们用到模型时，清除它！
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    //点击模态窗口加入购物车
    $scope.addToShoppingCar =function () {
        if($scope.goods_index.num <= 0){
            $scope.popTipsShow("抱歉,该商品没有库存了!");
            return;
        }
        var params = {
            goods_id: $scope.goods_index.g_id,
            num:$scope.collect.val,
            sessid:SESSID
        };
        HttpFactory.getData("/api/ushoppingCart",params,"POST")
            .then(function (result) {
                
                if (result.status == 0) {
                    $scope.modal.hide();
                    user_car_num += 1;
                    $scope.user_Car_Num += user_car_num;
                    $scope.popTipsShow("加入购物车成功");
                }else {
                    
                    $scope.popTipsShow("加入购物车失败");
                    

                }
            },function (err) {
                
            });
    };
    //模态窗口的立即购买
    $scope.goToConfirmOrder = function () {
        $scope.modal.hide();
        if($scope.goods_index.num <= 0){
            $scope.popTipsShow("抱歉,该商品没有库存了!");
            return;
        }
        $scope.goods_index.goodsNum = $scope.collect.val;
        $state.go("tabs.confirmOrder_personal",{goodsArray:JSON.stringify([$scope.goods_index])});
    };
    function reduce() {
        if($scope.collect.val > 1){
            $scope.collect.val--;
        }
        //让最少为一件
    }
    function  add () {
        if($scope.goods_index.num <= 0){
            $scope.popTipsShow("抱歉,该商品没有库存了!");
            return;
        }
        $scope.collect.val ++;
    }
    //立即兑换
    function goToExchangeNow(index,event) {
        event.stopPropagation();
        $state.go("tabs.confirmOrder_personal",{goodsArray:JSON.stringify([$scope.collect.collectionData[index]])});
        
    }
    //前往商品详情
    function goToGoodsDetail(index) {
        if ($scope.collect.collectionData[index].is_integral == 0){
            $state.go('tabs.goodsDetail_collection',{is_integral: $scope.collect.collectionData[index].is_integral, goods_id:  $scope.collect.collectionData[index].g_id,goods_icon: $scope.collect.collectionData[index].litpic});
        }else {
            $state.go('tabs.igDetail_personal',{is_integral: $scope.collect.collectionData[index].is_integral, goods_id:  $scope.collect.collectionData[index].g_id});
        }

    }
}]);