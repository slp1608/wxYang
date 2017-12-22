
/**
 * Created by qingyun on 16/11/30.
 */
angular.module('cftApp.tabs',[])
    .controller('tabsController',['$scope','$rootScope','$ionicViewSwitcher','$location','$state','$ionicLoading','$ionicGesture','$document','HttpFactory','CftStore',function ($scope, $rootScope, $ionicViewSwitcher, $location, $state, $ionicLoading, $ionicGesture, $document, HttpFactory, CftStore) {
        var sideMenuObj = $scope.sideMenuObj = {
            //是否是积分商品 0 普通商品 1 积分商品
            is_integral: 0,
            //是否是所有商品
            is_allGoods: 0,
            //侧边栏一级标题
            headTitle: '一级分类',
            menuSecondClasses: [],
            sortedClassKeys: [],
            //用作将全部商品筛选的结果反馈给 sortedController
            filterObj: {
                sortedSelectedIDS: [],
                minPrice: '',//最小价
                maxPrice: ''//最高价
            },
            //用于标示全局搜索
            isSearch: false,
            //
            // sortedSecondClassObj: {},
            //选择全部商品
            selectAll: selectAll,
            // //选择首页一级菜单
            // selectHomeFirstClass: selectHomeFirstClass,
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
        var selectedObj = {
            oneclass: '2',
            secondClass: [],
            minPrice: '',
            maxPrice: ''
        };
        //用户购物车商品数量
        $scope.user_Car_Num = '';
        //记录打开客服还是扫码
        var is_KF_scanQRCode = '';
        var selectedIDS = [];

        //微信jsAPI接入
         console.log('tabs');
        // console.log(location.href);
        // console.log(location.href.split('#')[0]);;
        HttpFactory.getData("/api/getSign",{url:location.href.split('#')[0]}).then(function (result) {
            wx.config({
                debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: result.appId, // 必填，公众号的唯一标识
                timestamp: result.timestamp, // 必填，生成签名的时间戳
                nonceStr: result.nonceStr, // 必填，生成签名的随机串
                signature: result.signature,// 必填，签名，见附录1
                jsApiList: ["onMenuShareTimeline","onMenuShareAppMessage","openLocation","getLocation","scanQRCode","chooseWXPay",'openProductSpecificView'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
        });
         wx.ready(function(){
             // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
             HttpFactory.getData('/GetUserInfo').then(function (result) {
                 console.log(">>>>>>>>");
                 console.log(result);
                 //user_car_num = parseInt(result.cartnum);
                 localStorage.headImg = result.headImg;
                 localStorage.nickName = result.nickName;

                 // localStorage.integral = result.integral
                 wx.onMenuShareAppMessage({
                     title: '南北鲜羊', // 分享标题
                     desc: '一个让你买到安全放心的羊肉,欢迎您的光临', // 分享描述
                     link: 'http://www.sunnyshu.cn/sunny/wap/api/memberlogin?c_user=' + result.userid, // 分享链接
                     imgUrl: 'http://www.sunnyshu.cn/sunny/wap/images/logo_share.png', // 分享图标
                     type: 'link', // 分享类型,music、video或link，不填默认为link
                     dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                     success: function () {
                         // 用户确认分享后执行的回调函数
                     },
                     cancel: function () {
                         // 用户取消分享后执行的回调函数
                     }
                 });
                 wx.onMenuShareTimeline({
                     title: '羊肉店', // 分享标题
                     link: 'http://www.sunnyshu.cn/sunny/wap/api/memberlogin?c_user=' + result.userid, // 分享链接
                     imgUrl: 'http://www.sunnyshu.cn/sunny/wap/images/logo_share.png', // 分享图标
                     success: function () {
                         // 用户确认分享后执行的回调函数
                     },
                     cancel: function () {
                         // 用户取消分享后执行的回调函数
                     }
                 });
             },function (err) {

             });

         });
         wx.error(function(res){
             alert(JSON.stringify(res));
             // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。

         });

        $rootScope.$on('$stateChangeStart',function (evt,current,previous) {
            //var self_kf_btn = angular.element(document.getElementById("self_kf_btn"));
            //if (current.url == "/personal" || current.url == "/myOrder" || current.url == "/collectionPager" || current.url == "/shoppingCart" || current.url == "/totalScore" || current.url == "/receiptAddress" || current.url == "/payRecord" || current.url == "/scanCodePayment"){
            //    self_kf_btn.css("display",'none');
            //}else {
            //    self_kf_btn.css("display",'');
            //    if (current.url == '/napaStores'){
            //        is_KF_scanQRCode = '扫码';
            //        self_kf_btn.css("background","url('images/paymoney.png') no-repeat center/100%");
            //    }else {
            //        is_KF_scanQRCode = '';
            //        self_kf_btn.css("background","url('images/service1.png') no-repeat center/100%");
            //    }
            //}
            var update_wx_title = function(title) {
                var body = document.getElementsByTagName('body')[0];
                document.title = title;
                var iframe = document.createElement("iframe");
                // iframe.setAttribute("src", "images/empty.png");
                iframe.addEventListener('load', function() {
                    setTimeout(function() {
                        // iframe.removeEventListener('load');
                        document.body.removeChild(iframe);
                    });
                });
                document.body.appendChild(iframe);
            };
            switch (current.name){
                case 'tabs.homePage':
                    update_wx_title("南北鲜羊官方商城");
                    break;
                case 'tabs.integralStore':
                    update_wx_title("积分商城");
                    break;
                case 'tabs.napaStores':
                    update_wx_title("加盟店");
                    break;
                case 'tabs.personal':
                    update_wx_title("个人中心");
                    break;
                case 'tabs.goodsDetail':
                    update_wx_title("商品详情");
                    break;
                case 'tabs.shoppingCart':
                    update_wx_title("购物车");
                    break;
                case 'tabs.igDetail':
                    update_wx_title("积分商品详情");
                    break;
                case 'tabs.receiptAddress_home':
                    update_wx_title("管理收货地址");
                    break;
                case 'tabs.receiptAddress':
                    update_wx_title("管理收货地址");
                    break;
                case 'tabs.receiptAddress_IG':
                    update_wx_title("管理收货地址");
                    break;
                case 'tabs.collectionPager':
                    update_wx_title("我的收藏");
                    break;
                case 'tabs.myOrder':
                    update_wx_title("我的订单");
                    break;
                case 'tabs.totalScore':
                    update_wx_title("积分查询");
                    break;
                case 'tabs.payRecord':
                    update_wx_title("交易记录");
                    break;
                case 'tabs.confirmOrder':
                    update_wx_title("确认订单");
                    break;
                case 'tabs.sortedGoods':
                    update_wx_title("所有商品");
                    break;
            }


        });

        //进去积分商城的方法
        $scope.clickHome = function () {
            $state.go("tabs.integralStore");
        };
        //进入购物车的方法
        $scope.clickShoppingCart = function () {
            $state.go("tabs.shoppingCart");
        };
        //进入个人中心的方法
        $scope.clickPersonal = function () {
            $state.go("tabs.personal");
        };
        //全部商品
        function selectAll(event) {
            sideMenuObj.isSearch = true;
            $rootScope.hideTabs = true;
            if (sideMenuObj.is_integral === 0){
                //广播给 homePage
                $scope.$broadcast("home_sortedView","");
            }else {
                //广播给 integralStore
                $scope.$broadcast("integral_sortedView","");
            }
        }
        


        //全局提示的弹窗
        $scope.popTipsShow = function (msg) {
            $ionicLoading.show({
                template: msg,
                duration: 1000,
                noBackdrop: true
            }).then(function(){
                console.log("打开提示弹窗");
            });
        };
        //全局加载中提示
        $scope.loadingShow = function (str) {
            str = str ? str : "加载中...";
            $ionicLoading.show({
                template: '<ion-spinner class="selfSpinner">' + str + '</ion-spinner>',
                noBackdrop:true
            });
        };
        //提示隐藏
        $scope.loadingOrPopTipsHide = function(){
            $ionicLoading.hide();
        };


    }]);

