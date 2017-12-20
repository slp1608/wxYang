/**
 * Created by lx on 2016/12/9.
 */
angular.module('cftApp.shoppingCart',['ionic']).config(['$stateProvider',function ($stateProvider) {
    $stateProvider.state('tabs.shoppingCart',{
        url:'/shoppingCart',
        views:{
            'tabs-shoppingCart':{
                templateUrl:'shoppingCart.html',
                controller:'shoppingCartController'
            }
        }
    });
    $stateProvider.state('tabs.shoppingCart_fromDetail',{
        url:'/shoppingCart_fromDetail',
        views:{
            'tabs-shoppingCart':{
                templateUrl:'shoppingCart.html',
                controller:'shoppingCartController'
            }
        }
    });
}]).controller('shoppingCartController',['$scope','$rootScope','$state','$ionicPopup','$timeout','$ionicViewSwitcher','HttpFactory','MainData',function ($scope,$rootScope,$state,$ionicPopup,$timeout,$ionicViewSwitcher,HttpFactory,MainData) {
    $scope.shoppingCart = {
        PicROOT_URL: PicROOT_URL,
        pageNum: 1,
        //购物车列表
        CartList : [] ,
        //购物车总金额
        CartMoney : 0 ,
        //购物车数量
        CartCount : 0 ,
        //是否停止加载更多
        isShowInfinite : true ,
        //购物车为空的提示
        emptyShopCarStr : "",
        //控制全选按钮红点 刚进去的时候默认不全选
        SelectAll:false,
        //上拉加载
        loadMore:loadMore ,
        //下拉刷新
        doRefresh:doRefresh,
        //确认删除
        confirmDelete:confirmDelete,
        //全选按钮判断
        ifSelectAll:ifSelectAll,
        //选择购物车商品并计算总金额 判断全选按钮是否显示
        ifSelect:ifSelect,
        //选中的商品数组
        selectedArray:[],
        //去结算的方法
        goToSettlement:goToSettlement
    };

    console.log("shoppingCart");
    // 上拉加载函数
    function loadMore() {
        var params = {
            userId: 1
        };
        HttpFactory.getData('/shopCartList',params).then(function (result) {
            // $scope.loadingOrPopTipsHide();
            console.log(result);
            if ( result.length ){
                $scope.shoppingCart.isShowInfinite = false;
                $scope.shoppingCart.CartList = result;
                console.log($scope.shoppingCart)
            }else {
                $scope.shoppingCart.emptyShopCarStr = "您的购物车是空的O(∩_∩)O~";
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        },function (err) {
            $scope.shoppingCart.isShowInfinite = false;
            $scope.popTipsShow('获取数据失败');
        });
    }

    // 下拉刷新函数
    function doRefresh() {
        var params = {
            userId: 1
        };
        HttpFactory.getData('/shopCartList',params).then(function (result) {
            if (result.length){
                $scope.shoppingCart.isShowInfinite = false;
                $scope.shoppingCart.CartList = result;
            }else {
                $scope.shoppingCart.emptyShopCarStr = "您的购物车是空的O(∩_∩)O~";
            }
            }).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
            });
        $scope.shoppingCart.SelectAll = false;
        $scope.shoppingCart.CartMoney = 0;
        $scope.shoppingCart.CartCount = 0;

    }

    // 计算总价格和总数量
    function shoppingCartallMoney() {
        var CartMoney = 0;
        var CartCount = 0;
        // 选中所有的label标签里的input标签
        var shoppingCheckbox = document.querySelectorAll('.radio>input');
        console.log("计算总价格和总数量");
        console.log(shoppingCheckbox);
        var shoppingCheckboxIndex = 0;
        var CartList = $scope.shoppingCart.CartList;
        for (var i = 0; i < CartList.length; i++) {
            if(CartList[i].Status){
                if (shoppingCheckbox[shoppingCheckboxIndex].checked){
                    CartMoney += CartList[i].UnitPrice * CartList[i].Num;
                    CartCount += Number(CartList[i].Num);
                }
                shoppingCheckboxIndex++;
            }
        }
        $scope.shoppingCart.CartMoney = CartMoney;
        $scope.shoppingCart.CartCount = CartCount;
    }

    // 全选按钮判断
    function ifSelectAll() {
        $scope.shoppingCart.SelectAll = !$scope.shoppingCart.SelectAll;
        // 选中所有的label标签里的input标签
        var shoppingCheckbox = angular.element(document.querySelectorAll('.radio>input'));
        // console.log(shoppingCheckbox);
        if ($scope.shoppingCart.SelectAll) {
            shoppingCheckbox.attr('checked','true');
        }
        else{  // 如果取消全选的话让所有商品都取消选中
            shoppingCheckbox.attr('checked','');
        }
        shoppingCartallMoney();
    }

    // 选择购物车商品并计算总金额 判断全选按钮是否显示
    function ifSelect(index) {
        shoppingCartallMoney();
        $scope.shoppingCart.SelectAll = true;
        // 判断当所有商品都选中时全选按钮也要被选中
        var shoppingCheckbox = document.querySelectorAll('.radio>input');
        // console.log(shoppingCheckbox);
        var ifArray = '';
        for (var q = 0;q < shoppingCheckbox.length;q++){
            ifArray += shoppingCheckbox[q].checked+'&';
        }
        // console.log(ifArray);
        $scope.shoppingCart.SelectAll = ifArray.indexOf('false') < 0;
    }

    //去结算的方法
    function goToSettlement() {
        // 选中所有的label标签里的input标签
        var shoppingCheckbox = document.querySelectorAll('.radio>input');
        console.log("计算总价格和总数量");
        console.log(shoppingCheckbox);
        var shoppingCheckboxIndex = 0;
        var selectedArray = [];
        var CartList = $scope.shoppingCart.CartList;
        for (var i = 0; i < CartList.length; i++) {
            if(CartList[i].Status){
                if (shoppingCheckbox[shoppingCheckboxIndex].checked){
                    selectedArray.push(CartList[i]);
                }
                shoppingCheckboxIndex++;
            }
        }
        console.log('看一下选中的商品');
        console.log(selectedArray);
        $scope.shoppingCart.selectedArray = selectedArray;
        if($scope.shoppingCart.selectedArray.length === 0){
            $scope.popTipsShow("您未选择任何商品!");
            return;
        }
         for (var b = 0;b < $scope.shoppingCart.selectedArray.length;b++){
             $scope.shoppingCart.selectedArray[b].goodsNum = $scope.shoppingCart.selectedArray[b].num;
             $scope.shoppingCart.selectedArray[b].goods_id = $scope.shoppingCart.selectedArray[b].g_id;
         }
         MainData.shopping_car_goodsArray = JSON.stringify($scope.shoppingCart.selectedArray);
        console.log($state.current.name);
         //if ($state.current.name === 'tabs.shoppingCart_fromDetail'){
             console.log('jj');
             $state.go("tabs.confirmOrder",{goodsArray:'value传值',isFromCart:1});
         //}else {
         //    console.log('yy');
         //    $state.go("tabs.confirmOrder_personal",{goodsArray:'value传值'});
         //}
    }

    // 前往商品详情
    $scope.lookGoodDetail = function (index) {
        
        if ($state.current.name === 'tabs.shoppingCart_fromDetail'){
            console.log('haha');
            $state.go('tabs.goodsDetail',{goods_id:  $scope.shoppingCart.CartList[index].id});
            $ionicViewSwitcher.nextDirection('forward');
        }else {
            console.log('heihei');
            $state.go('tabs.goodsDetail_collection',{goods_id:  $scope.shoppingCart.CartList[index].id});
            $ionicViewSwitcher.nextDirection('forward');
        }
    };

    // 删除商品
    function confirmDelete (index) {
        
        $ionicPopup.show({
            cssClass:'myOrder',
            template:'确认要删除该商品吗？',
            buttons:[{
                text:'取消',
                type: 'button-clear button-dark',
                onTap:function () {
                    console.log("cancel")
                }
            },{
                text:'确定',
                type: 'button-clear button-assertive',
                onTap:function (e) {
                    // return;
                    var params = {
                        ShopCartId: $scope.shoppingCart.CartList[index].ShopCartId,
                        userId: 1
                    };
                    console.log($scope.shoppingCart.CartList[index]);
                    console.log(params);
                    HttpFactory.getData("/DeleteShopCart",params,"POST").then(function (result) {
                        console.log(result);
                        if ( result.returnVal === 'success' ) {
                            $scope.shoppingCart.CartList.splice(index,1);
                            shoppingCartallMoney();
                            $scope.popTipsShow(result.msg);
                        }else {
                            $scope.popTipsShow(result.msg);
                        }
                    },function (err) {
                        $scope.popTipsShow("获取数据失败");
                    });

                }
            }]
        });
    }
    
}]);