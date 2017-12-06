/**
 * Created by chaoshen on 16/12/5.
 */
angular.module('ctfApp.searchBar',[])
    .directive('ctfSearchBar',function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                integral: "@",
                isSorted: "@",
                searchDatas: "="
            },
            template:
            '<div class="ctf-search-view">' +
                '<label class="item item-input">' +
                '<input class="cft-textField" ng-model="searchValue" type="text" placeholder="例：大闸蟹">' +
                '</label>' +
                '<button class="ctf-search-btn" style="height: 1.6rem" ng-click="goSearch(searchValue)"></button>' +
            '</div>',
            controller: ["$scope","$state",'$ionicViewSwitcher','$rootScope','HttpFactory',function ($scope,$state,$ionicViewSwitcher,$rootScope,HttpFactory) {
                
                
        //         $scope.goSearch = function (searchValue) {
        //             if (searchValue){
        //                 console.log("值不为空："+searchValue);
        //                 //普通商品
        //                 if ($scope.integral === "0") {
        //                     if ($scope.isSorted){
        //                         console.log("普通分类筛选");
        //                         $scope.searchDatas = "hello";
        //                         // HttpFactory.getData();
        //                     }else {
        //                         console.log("普通商品");
        //                         $state.go('tabs.sortedGoods',{sortname:"全部商品",searchStr: searchValue});
        //                         $rootScope.hideTabs = true;
        //                         $ionicViewSwitcher.nextDirection('forward');
        //                     }
        //                     // var homeObj = scope.$parent.homeObj
        //                 }
        //                 //积分商
        //                 else {
        //                     if ($scope.isSorted){
        //                         console.log("普通积分分类筛选");
        //                     }else {
        //                         console.log("积分商品");
        //                         // $state.go('tabs.sortedGoods',{sortname:"全部商品",searchStr: searchValue});
        //                         $rootScope.hideTabs = true;
        //                         $ionicViewSwitcher.nextDirection('forward');
        //                     }
        //                 }
        //
        //             }else {
        //                 console.log("输入的值为空");
        //             }
        //         }
            }],
            link: function (scope,elem,attrs) {

            }
        }
    });