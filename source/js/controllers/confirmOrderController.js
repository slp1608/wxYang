/**
 * Created by chaoshen on 2017/1/6.
 */
angular.module('cftApp.confirmOrder',[])
    .config(['$stateProvider',function ($stateProvider) {
        $stateProvider.state('tabs.confirmOrder',{
            url: '/confirmOrder/:goodsArray/:isFromCart',
            views: {
                'tabs-homePage': {
                    templateUrl: 'confirmOrder.html',
                    controller: 'confirmOderController'
                }
            }
        }).state('tabs.confirmOrder_IG',{
            url: '/confirmOrder_IG/:goodsArray',
            views: {
                'tabs-integralStore': {
                    templateUrl: 'confirmOrder.html',
                    controller: 'confirmOderController'
                }
            }
        }).state('tabs.confirmOrder_personal',{
            url: '/confirmOrder_personal/:goodsArray',
            views: {
                'tabs-personal': {
                    templateUrl: 'confirmOrder.html',
                    controller: 'confirmOderController'
                }
            }
        });
    }])
    .controller('confirmOderController',['$scope','$rootScope','$stateParams','HttpFactory','$state','$location','$ionicModal','CftStore','MainData',function ($scope, $rootScope, $stateParams, HttpFactory, $state, $location,$ionicModal,CftStore,MainData) {

        //重置用户地址的选择
        MainData.userSelectAddress = null;
        console.log(MainData);
        if ($stateParams.goodsArray === "value传值"){
            console.log('lall');
            $stateParams.goodsArray = MainData.shopping_car_goodsArray;
        }
        console.log(JSON.parse($stateParams.goodsArray));
        $scope.confirmObj = {
            //留言文本
            inputMsg: '',
            //默认地址对象
            defaultAddress: {},
            //是否有默认地址
            hasDefaultAddress: false,
            //商品数组
            goodsArray: JSON.parse($stateParams.goodsArray),
            //商品总数量
            goodsNum_all:0,
            //图片根地址
            PicROOT_URL: PicROOT_URL,
            //商品总金额
            totalPrice: 0,
            //进入收货地址页面
            goReceiptAddress: goReceiptAddress,
            //立即购买
            buyNow: buyNow,
            //进入订单详情
            goToLookOrderDetail: goToLookOrderDetail,
            confirmOrderModalImg: 'images/confirmOrder_ig.png',
            oid: '',               //购买成功或者兑换成功的订单id
            freight: 0,            //商品运费
            isFromCart: 0         //是否是从购物车过来的
        };
        console.log('确认订单页面');
        console.log($stateParams);

        if($stateParams.isFromCart){
            $scope.confirmObj.isFromCart = 1
        }
        console.log('是否是从购物车过来的:' + $scope.confirmObj.isFromCart);
        //计算商品 总数量、总价 和 运费
        function calculateNumber() {
            var goodsNum_all = 0;
            var totalPrice = 0;
            var freight = 0;
            for (var i = 0;i < $scope.confirmObj.goodsArray.length;i++){
                goodsNum_all += parseInt($scope.confirmObj.goodsArray[i].Num);
                totalPrice += $scope.confirmObj.goodsArray[i].UnitPrice * $scope.confirmObj.goodsArray[i].Num;
                freight += $scope.confirmObj.goodsArray[i].TransPrice * $scope.confirmObj.goodsArray[i].Num;
            }
            $scope.confirmObj.goodsNum_all = goodsNum_all;
            $scope.confirmObj.totalPrice = totalPrice;
            $scope.confirmObj.freight = freight;
        }
        calculateNumber();
        //进入收货地址页面
        function goReceiptAddress() {
            if ($location.path().indexOf('confirmOrder_personal') > -1){
                $state.go("tabs.receiptAddress");
            }else {
                $state.go("tabs.receiptAddress_home");
            }
        }
        $scope.$on('$ionicView.beforeEnter', function () {
            $rootScope.hideTabs = true;
            //从本地读取默认地址
            if (MainData.userSelectAddress && MainData.userSelectAddress != 'continue'){
                if (MainData.userSelectAddress == 'skip'){
                    
                }else {
                    //用户现在了地址把地址给管理地址的对象
                    $scope.confirmObj.hasDefaultAddress = true;
                    $scope.confirmObj.defaultAddress = MainData.userSelectAddress;
                    var defaultAddress = $scope.confirmObj.defaultAddress;
                    $scope.confirmObj.defaultAddress.totalAddress = defaultAddress.Province + defaultAddress.City + defaultAddress.Address;
                }
                return;
            }
            //网络获取默认地址
            setTimeout(function () {
                
                var getData = {
                    success: function (result) {
                        console.log('获取到收货地址');
                        console.log(result);
                        if (result) {
                            //把网络请求的默认地址给管理地址的对象
                            $scope.confirmObj.defaultAddress = result[0];
                            var defaultAddress = $scope.confirmObj.defaultAddress;
                            $scope.confirmObj.defaultAddress.totalAddress = defaultAddress.Province + defaultAddress.City + defaultAddress.Address;
                            $scope.confirmObj.hasDefaultAddress = true;
                        }else {
                            $scope.confirmObj.hasDefaultAddress = false;
                        }
                        $scope.$broadcast('scroll.refreshComplete');
                    },
                    error: function (err) { }
                };
                var params = { userId: 1 };
                HttpFactory.getData("/receptInfoList",params)
                    .then(
                        getData.success,
                        getData.error
                    );
            },300);
        });

        //var productIds = [];//存放所有的商品id
        //var productNums = [];//存放所有商品的数量
        var productIds = '';//存放所有的商品id
        var productNums = '';//存放所有商品的数量
        console.log('hahah');
        console.log($scope.confirmObj.goodsArray);
        for (var i = 0; i < $scope.confirmObj.goodsArray.length;i++){
            //productIds.push($scope.confirmObj.goodsArray[i].id);
            //productNums.push($scope.confirmObj.goodsArray[i].Num);
            productIds += $scope.confirmObj.goodsArray[i].id + ',';
            productNums += $scope.confirmObj.goodsArray[i].Num + ',';
        }

        //获取运费
        //HttpFactory.getData('/api/getAvgPrice',{sessid:SESSID,goods_id:JSON.stringify(goodsIdArray)}).then(function (result) {
        //    if (result.status == 0){
        //        $scope.confirmObj.freight = parseFloat(result.freight);
        //    }
        //});
        //确认购买
        function buyNow() {
            if ($scope.confirmObj.defaultAddress.id){
                var params = {
                    productIds: productIds,          //选择的产品数组
                    receptInfoId: $scope.confirmObj.defaultAddress.id,  //收货地址id
                    message: $scope.confirmObj.inputMsg,              //买家留言
                    productNums:productNums,               //产品数量数组
                    //disPrice:$scope.confirmObj.freight,            //快递费
                    userId :1,                                        //用户id
                    isFromCart: $scope.confirmObj.isFromCart                                  //是否为购物车提交的订单
                };
                $scope.loadingShow();
                console.log('确认购买，查看参数');
                console.log(params);
                HttpFactory.getData("/SubmitOrder",params,"POST").then(function (result) {
                    console.log('**************************');
                    console.log('返回数据');
                    console.log(result);
                    $scope.loadingOrPopTipsHide();
                    //if (result.status == 0){
                    //    result = result.parameters;
                    //    $scope.confirmObj.oid = result.oid;
                    //    wx.chooseWXPay({
                    //        timestamp: result.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                    //        nonceStr: result.nonceStr, // 支付签名随机串，不长于 32 位
                    //        package: result.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                    //        signType: 'MD5', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                    //        paySign: result.paySign, // 支付签名
                    //        success: function (res) {
                    //            // 支付成功后的回调函数
                    //            if(res.errMsg == "chooseWXPay:ok"){
                    //                $scope.confirmObj.confirmOrderModalImg = 'images/confirmOrder.png';
                    //                $scope.modal.show();
                    //            }else {
                    //                $scope.popTipsShow("支付出错!");
                    //            }
                    //        }
                    //    });
                    //}else {
                    //    $scope.popTipsShow(result.desc);
                    //}

                },function (err) {
                    $scope.popTipsShow("访问异常!");
                })

            }else {
                $scope.popTipsShow("请先选择收货地址");
            }
        }

        //立即兑换
        function convertNow() {
            //默认地址存在的情况
            $scope.loadingShow();
            if ($scope.confirmObj.defaultAddress.id){
                var params = {
                    goods_id: $scope.confirmObj.goodsArray[0].goods_id,
                    collid: $scope.confirmObj.defaultAddress.id,
                    mess: $scope.confirmObj.inputMsg,
                    sessid:SESSID
                };

                HttpFactory.getData("/api/integralOrder",params,"POST")
                    .then(function (result) {
                        if (result.status == 0){
                            $scope.loadingOrPopTipsHide();
                            $scope.confirmObj.confirmOrderModalImg = 'images/confirmOrder_ig.png';
                            $scope.confirmObj.oid = result.oid;
                            $scope.modal.show();
                        }else {
                            $scope.popTipsShow(result.desc);
                        }
                    },function (err) {

                    });
            }else {
                $scope.popTipsShow("请先选择收货地址");
            }
        }
        //兑换成功的模态提示
        $ionicModal.fromTemplateUrl('confirmOrderModal.html', {
            scope: $scope,
            animation: 'slide-in-enter'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        //当我们不用模型时，清除它！
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
        //点击查看订单详情进入订单详情
        function goToLookOrderDetail() {
            $scope.modal.hide();
            switch ($state.current.name){
                case 'tabs.confirmOrder_IG':
                    $state.go('tabs.orderDetail_ig',{oid:$scope.confirmObj.oid});
                    break;
                case 'tabs.confirmOrder':
                    $state.go('tabs.orderDetail_home',{oid:$scope.confirmObj.oid});
                    break;
                case 'tabs.confirmOrder_personal':
                    $state.go('tabs.orderDetail',{oid:$scope.confirmObj.oid});
                    break;
            }
        }
    }]);