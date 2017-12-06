/**
 * Created by qingyun on 16/12/2.
 */
//<div class="slideBottomDiv"></div>
angular.module('cftApp.slideBox',[]).directive('mgSlideBox',[function () {
    return{
        restrict:"E",
        scope:{sourceData:'='},
        template:'<div class="topCarousel"><ion-slide-box delegate-handle="topCarouselSlideBox" auto-play="true" does-continue="true"  slide-interval="3000" show-pager="true" on-drag="drag($event)"  ng-if="isShowSlideBox"><ion-slide ng-if="sourceData.ishome == 0 || sourceData.ishome == 1" ng-repeat="ads in sourceData.bannerData track by $index" ng-click="goToDetailView(ads)"><img ng-src="{{iconRootUrl + ads.image_url}}" class="topCarouselImg"></ion-slide><ion-slide ng-if="sourceData.ishome == 2" ng-repeat="imgUrl in sourceData.bannerData track by $index"><img ng-src="{{iconRootUrl + imgUrl}}" class="topCarouselImg"></ion-slide></ion-slide-box><p></p></div>',
        controller:['$scope','$element','$ionicSlideBoxDelegate','$ionicScrollDelegate','$state','$ionicViewSwitcher','$rootScope',function ($scope,$element,$ionicSlideBoxDelegate,$ionicScrollDelegate,$state,$ionicViewSwitcher,$rootScope) {
            //通过 sourceData.instegral 区分进入的详情
            $scope.iconRootUrl = IconROOT_URL;
            $scope.goToDetailView = function (item) {
                if ($scope.sourceData.ishome == 0) {
                    console.log("home->icon_detail");
                    $state.go('tabs.goodsDetail',{goods_id: item.param});
                }else{
                    $state.go('tabs.igDetail',{goods_id: item.param});
                }
                $ionicViewSwitcher.nextDirection('forward');
            };
            $scope.isShowSlideBox = false;
            $scope.$watch('sourceData.bannerData',function (newVal,oldVal) {
                
                if (newVal && newVal.length){
                    $scope.isShowSlideBox = true;
                    $ionicSlideBoxDelegate.update();
                    $ionicSlideBoxDelegate.loop(true);
                }
            });
        }],
        replace:true,
        link:function (scope,tElement,tAtts) {
        }
    };
}]);