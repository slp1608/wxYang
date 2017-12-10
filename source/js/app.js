/**
 * Created by qingyun on 16/11/30.
 */
//js程序入口
angular.module('cftApp',['ionic','cftApp.storageFactory','cftApp.tabs','cftApp.factories','cftApp.slideBox','ctfApp.searchBar','cftApp.homePage','cftApp.integralStore','cftApp.napaStores','cftApp.personal','cftApp.goodsDetail','cftApp.collection','cftApp.myOrder','cftApp.receiptAddress','cftApp.shoppingCart','cftApp.totalScore','cftApp.payRecord','cftApp.integralGoodsDetail','cftApp.sortedGoods','cftApp.sortedIntegral','cftApp.confirmOrder','cftApp.evaluatePage','cftApp.scanCodePayment'])
    .config(['$stateProvider','$urlRouterProvider','$ionicConfigProvider','$locationProvider',function ($stateProvider,$urlRouterProvider,$ionicConfigProvider,$locationProvider) {
        $ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.tabs.style('standard');
        $ionicConfigProvider.navBar.alignTitle('center');
        $ionicConfigProvider.scrolling.jsScrolling(true);
        // $ionicConfigProvider.templates.maxPrefetch(0);
        // $ionicConfigProvider.views.maxCache(0);
        $stateProvider.state("tabs",{
            url:"/tabs",
            abstract:true,
            templateUrl:"tabs.html",
            controller:'tabsController'
        });
        //意外跳转
        // $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('?');
        $urlRouterProvider.otherwise('tabs/homePage');
}]);
var ROOT_URL = "http://www.shanghairita.com/mall/public",
    perPageCount = 10,
    user_car_num = '',
    IconROOT_URL = "http://www.shanghairita.com",
    PicROOT_URL = "http://www.shanghairita.com/mall/public/pic/",
    SESSID = "";




    