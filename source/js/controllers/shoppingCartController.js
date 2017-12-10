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
        SelectAll:true,
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
        //$timeout(function () {
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
        //},500);
    }

    // 下拉刷新函数
    function doRefresh() {
        var params = {
            pageNum: 1,
            sessid: SESSID
        };
        HttpFactory.getData('/api/ushoppingCart',params).then(function (result) {
            var resultData = result.shoppingCart;
            if (resultData.length){
                $scope.shoppingCart.isShowInfinite = true;
                $scope.shoppingCart.CartList = resultData;
            }else {
                $scope.shoppingCart.emptyShopCarStr = "您的购物车是空的O(∩_∩)O~";
            }
            // goodsIfOutData();
            more++;
            }).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
            });
        $scope.shoppingCart.SelectAll = true;
        $scope.shoppingCart.CartMoney = 0;
        $scope.shoppingCart.CartCount = 0;

    }


    // 判断是否失效
    // function goodsIfOutData() {
    //     var nowTime = new Date();
    //     console.log(nowTime)
    //     for (var s = 0;s<$scope.shoppingCart.CartList.length;s++){
    //         // console.log(((nowTime / 1000) - (parseFloat($scope.shoppingCart.CartList[s].addTime))) / (60));
    //         if (((nowTime / 1000) - (parseFloat($scope.shoppingCart.CartList[s].addTime))) / (60) > 5 ){
    //             $scope.shoppingCart.CartList[s].isHave = false;
    //         }else {
    //             $scope.shoppingCart.CartList[s].isHave = true;
    //         }
    //     }
    // }

    // 计算总价格和总数量
    function shoppingCartallMoney() {
        var CartMoney = 0;
        var CartCount = 0;
        // 选中所有的label标签里的input标签
        var shoppingCheckbox = document.querySelectorAll('.radio>input');
        var CartList = $scope.shoppingCart.CartList;
        for (var i = 0; i < shoppingCheckbox.length; i++) {
            if (shoppingCheckbox[i].checked){
                CartMoney += CartList[i].price * CartList[i].num;
                CartCount += Number(CartList[i].num);
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
        if (!$scope.shoppingCart.SelectAll) {
            shoppingCheckbox.attr('checked','true');
        }
        else{  // 如果取消全选的话让所有商品都取消选中
            shoppingCheckbox.attr('checked','');
        }
        $scope.shoppingCart.selectedArray = $scope.shoppingCart.CartList;
        shoppingCartallMoney();
    }

    // 选择购物车商品并计算总金额 判断全选按钮是否显示
    function ifSelect(index) {
        shoppingCartallMoney();
        $scope.shoppingCart.SelectAll = true;
        // 判断当所有商品都选中时全选按钮也要被选中
        var shoppingCheckbox = document.querySelectorAll('.radio>input');
        var ifArray = [];
        for (var q = 0;q < shoppingCheckbox.length;q++){
            ifArray = ifArray.push(shoppingCheckbox[q].checked);
        }
        var arr;
        for(var o = 0;o < ifArray.length;o++){
            arr += ifArray[o]+'';
        }
        $scope.shoppingCart.SelectAll = arr.indexOf('false') > 0;
        var t_index = 'a';
        for(var i = 0;i < $scope.shoppingCart.selectedArray.length;i++){
            if ($scope.shoppingCart.CartList[index].$$hashKey === $scope.shoppingCart.selectedArray[i].$$hashKey){
                t_index = i;
                $scope.shoppingCart.selectedArray.splice(i,1);
                break;
            }
        }
        if (t_index === 'a') $scope.shoppingCart.selectedArray.push($scope.shoppingCart.CartList[index])
    }

    //去结算的方法
    function goToSettlement() {
        if($scope.shoppingCart.selectedArray.length === 0){
            $scope.popTipsShow("您未选择任何商品!");
            return;
        }
        for (var b = 0;b < $scope.shoppingCart.selectedArray.length;b++){
            $scope.shoppingCart.selectedArray[b].goodsNum = $scope.shoppingCart.selectedArray[b].num;
            $scope.shoppingCart.selectedArray[b].is_integral = 0;
            $scope.shoppingCart.selectedArray[b].goods_id = $scope.shoppingCart.selectedArray[b].g_id;

        }
        MainData.shopping_car_goodsArray = JSON.stringify($scope.shoppingCart.selectedArray);
        if ($state.current.name === 'tabs.shoppingCart_fromDetail'){
            $state.go("tabs.confirmOrder",{goodsArray:'value传值'});

        }else {
            $state.go("tabs.confirmOrder_personal",{goodsArray:'value传值'});

        }
    }

    // 前往商品详情
    $scope.lookGoodDetail = function (index) {
        
        if ($state.current.name === 'tabs.shoppingCart_fromDetail'){
            $state.go('tabs.goodsDetail',{is_integral: '0', goods_id:  $scope.shoppingCart.CartList[index].g_id,goods_icon: $scope.shoppingCart.CartList[index].litpic});
            $ionicViewSwitcher.nextDirection('forward');
        }else {
            $state.go('tabs.goodsDetail_collection',{is_integral: '0', goods_id:  $scope.shoppingCart.CartList[index].g_id,goods_icon: $scope.shoppingCart.CartList[index].litpic});
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
                        id: $scope.shoppingCart.CartList[index].id,
                        sessid: SESSID
                    };
                    HttpFactory.getData("/api/ushoppingCart",params,"DELETE").then(function (result) {
                        
                        if (!result.status) {
                            var shoppingCheckbox = document.querySelectorAll('.radio>input');
                            // console.log(shoppingCheckbox[index].checked);
                            if (shoppingCheckbox[index] && shoppingCheckbox[index].checked){
                                shoppingCheckbox[index].checked = '';
                            }
                            shoppingCartallMoney();
                            $scope.shoppingCart.CartList.splice(index,1);
                            $scope.popTipsShow("删除成功");
                        }else {
                            $scope.popTipsShow("删除失败");
                        }
                    },function (err) {
                        $scope.popTipsShow("获取数据失败");
                    });

                }
            }]
        });
    }
    
}]);