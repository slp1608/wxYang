/**
 * Created by Administrator on 2016/12/7.
 */
angular.module('cftApp.receiptAddress',[])
    .config(['$stateProvider',function ($stateProvider) {
        $stateProvider.state('tabs.receiptAddress',{
            url:'/receiptAddress',
            // cache:false,
            views:{
                'tabs-personal':{
                    templateUrl:'receiptAddress.html',
                    controller:'receiptAddressController'
                }
            }
        }).state('tabs.receiptAddress_IG',{
            url:'/receiptAddress_IG',
            // cache:false,
            views:{
                'tabs-integralStore':{
                    templateUrl:'receiptAddress.html',
                    controller:'receiptAddressController'
                }
            }
        }).state('tabs.receiptAddress_home',{
            url:'/receiptAddress_home',
            // cache:false,
            views:{
                'tabs-homePage':{
                    templateUrl:'receiptAddress.html',
                    controller:'receiptAddressController'
                }
            }
        });
    }])
    .controller('receiptAddressController',['$scope','$location','$rootScope','$ionicPopup','$timeout','HttpFactory','$ionicModal','$http','MainData',function ($scope,$location,$rootScope, $ionicPopup,$timeout, HttpFactory, $ionicModal, $http,MainData) {
        //隐藏tabs-bar
        $scope.$on('$ionicView.beforeEnter', function () {
            $rootScope.hideTabs = true;
        });
        //用户完成模态地址选择的和加盟店类似的数据对象
        $scope.napaObj = {
            provinces:[]
        };
        $scope.napaStores = {
            text:''
        };
        //初始化收货地址数据
        $scope.addressObj = {
            moredata:false,
            //收货地址列表数据
            adreessListDatas: [],
            //编辑地址的地址对象
            addressModal: {
                vname: '',
                tel: '',
                province: '',
                city: '',
                address: '',
                code: ''
            },
            //地址列表为空的提示
            emptyPromptStr:'',
            //省份列表数据
            provinces: [],
            // 城市列表数据
            cities: [],
            //选中的省份
            selectedProvince: '',
            //选中的城市
            selectedCity: '',
            //选中发生变化
            selectedChange: selectedChange,
            //数据是否为空
            dataIsNull: false,
            //添加地址
            addAddress: addAddress,
            //取消添加
            cancelAdd: cancelAdd,
            //保存地址
            saveAddress: saveAddress,
            //关闭模态视图
            closeModal:closeModal,
            //打开模态视图
            openModal:openModal,
            //改变默认收货地址
            changeDefault:changeDefault,
            //删除地址的模态窗口
            showConfirm:showConfirm,
            //下拉刷新
            doRefresh: doRefresh,
            //加载更多
            loadMore: loadMore,
            //用户选择一个地址去使用
            selectAddress_user:selectAddress_user,
            selectAddressModalShow:selectAddressModalShow//打开省份和失去的选择模态窗口
        };
        console.log($scope.addressObj.moredata);
        var currentIndex = 1;
        var isEdit = false;
        $scope.addressOptionObj={};
        //读取本地城市列表
        $http.get('lib/city.json')
            .success(function (result) {
                $scope.addressObj.provinces = result;
                $scope.addressObj.provinces.splice(0,1);
                angular.forEach($scope.addressObj.provinces,function (province) {

                    //剔除数组的第一个元素
                    if (province.hasOwnProperty("sub"))
                        province.sub.splice(0,1);
                })
            });


        //实现单选的选择 设置默认地址
        function changeDefault(index,list,event) {
            if(index == undefined){
                index = 0;
                list = $scope.addressObj.adreessListDatas[0];
            }else {
                event.stopPropagation();
                //当用户只是设置默认地址的再回去的时候略过地址改变
                MainData.userSelectAddress = 'skip';
            }
            if ($scope.addressObj.adreessListDatas.length){
                for (var i = 0;i<$scope.addressObj.adreessListDatas.length;i++){
                    $scope.addressObj.adreessListDatas[i].setdefault = 0;
                }
                $scope.addressObj.adreessListDatas[index].setdefault = 1;
                var params = {
                    id: list.id,

                    setdefault: 1,
                    sessid:SESSID
                };

                HttpFactory.getData("/api/uAddress",params,"PATCH").then(function (result) {
                    if (result.status == 0) {
                        //将默认地址存入本地，供确认订单使用
                    }
                },function (err) {

                });
            }


        }
        //选择省份改变的方法
        function selectedChange(selectedProvince) {

            angular.forEach($scope.addressObj.provinces,function (province) {

                //剔除数组的第一个元素
                if (province.name == selectedProvince)
                {
                    $scope.addressObj.cities = province.sub;
                }
            })
        }
        //保存收货地址
        function saveAddress(addressParams) {
            $scope.loadingShow();
            addressParams.province = $scope.addressObj.selectedProvince;
            addressParams.city = $scope.addressObj.selectedCity;
            addressParams.sessid = SESSID;
            if (addressParams.province == "请选择"){
                addressParams.province = '';
            }
            if (addressParams.city == "请选择"){
                addressParams.city = '';
            }
            if (addressParams.vname == '' ||
                addressParams.tel == '' ||
                addressParams.address == ''){
                $scope.popTipsShow("请补全地址信息");
                return;
            }
            if (!(/^1(3|4|5|7|8)\d{9}$/.test(addressParams.tel))) {
                $scope.popTipsShow("手机号输入有误");
                return;

            }
            $scope.addressObj.closeModal();
            if (isEdit) {
                // delete addressParams.setdefault;
                var thisSetdefault = addressParams.setdefault;
                addressParams.setdefault = '';

                HttpFactory.getData("/api/uAddress",addressParams,"PATCH")
                    .then(function (result) {
                        if (result.status == "0"){

                            addressParams.setdefault = thisSetdefault;
                            MainData.userSelectAddress = addressParams;
                            $scope.loadingOrPopTipsHide();
                            //成功提示
                            $scope.popTipsShow("地址修改成功");

                        }else {
                            //错误提示
                            $scope.loadingOrPopTipsHide();
                            $scope.popTipsShow("地址修改失败");
                        }
                    },function (err) {

                    });
            }else {

                $scope.addressObj.dataIsNull = false;

                HttpFactory.getData("/api/uAddress",addressParams,"POST")
                    .then(function (result) {
                        if (result.status == "0"){
                            doRefresh('新增保存');
                        }else {
                            //错误提示
                            $scope.loadingOrPopTipsHide();
                            $scope.popTipsShow("地址保存失败");

                        }
                    },function (err) {

                    });
            }

        }

        //点击新增地址打开模态窗口
        function addAddress() {
            $scope.openModal();
        }
        console.log($location);

        //用户在购买时选择一个地址去使用
        function selectAddress_user(index) {
            if (!MainData.isFromPersonToReceiptAddress){
                MainData.userSelectAddress = $scope.addressObj.adreessListDatas[index];
                window.history.back();
            }
        }

        //下拉刷新
        function doRefresh(str) {
            currentIndex = 1;
            var getData = {
                success: function (result) {
                    if (result.status == 0) {
                        if (result.addressData.length != 0){

                            $scope.addressObj.adreessListDatas = result.addressData;
                            $scope.addressObj.dataIsNull = false;
                            if(result.addressData.length >= 10){
                                $scope.addressObj.moredata = false;
                            }else {
                                $scope.addressObj.moredata = true;
                            }
                            if (str == "新增保存"){
                                $scope.loadingOrPopTipsHide();
                                $scope.popTipsShow("地址保存成功");
                                if ($scope.addressObj.adreessListDatas.length == 1)
                                {
                                    $scope.addressObj.adreessListDatas[0].setdefault = 1;
                                    changeDefault();
                                }
                            }

                        } else {//没有地址，页面提示
                            $scope.addressObj.dataIsNull = true;
                        }
                        currentIndex++;
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                },
                error: function (err) {

                }
            };

            var params = {
                page: currentIndex,
                sessid:SESSID
            };
            HttpFactory.getData("/api/uAddress",params,"GET")
                .then(
                    getData.success,
                    getData.error
                );
        }
        //上拉加载
        function loadMore() {
            var params = {
                page: currentIndex,
                sessid:SESSID
            };
            HttpFactory.getData("/api/uAddress",params,"GET").then(function (result) {
                console.log(result);
                if (result.status == 0) {
                    $scope.addressObj.adreessListDatas = $scope.addressObj.adreessListDatas.concat(result.addressData);
                    if(result.addressData.length == 0){
                        $scope.addressObj.emptyPromptStr = "您的收货地址为空\(^o^)/~";
                        $scope.addressObj.dataIsNull = true;

                    }else {
                        $scope.addressObj.dataIsNull = false;
                    }
                    if (result.addressData.length < perPageCount){
                        $scope.addressObj.moredata = true;
                    }else {
                        $scope.addressObj.moredata = false;
                    }
                    currentIndex ++;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }else {

                }
            },function (err) {
                $scope.addressObj.moredata = true;
                $scope.popTipsShow("访问异常!");
            });
        }


        //打开模态
        function openModal(option,list,event) {
            if(option == 'edit'){
                isEdit = true;
                event.stopPropagation();
                $scope.addressOptionObj = list;
                $scope.addressObj.selectedProvince = list.province;
                angular.forEach($scope.addressObj.provinces,function (province) {
                    //剔除数组的第一个元素
                    if (province.name == list.province)
                    {
                        $scope.addressObj.cities = province.sub;
                    }
                });
                $scope.addressObj.selectedCity = list.city;
                $scope.addressOptionObj.title="编辑收货地址";
            }else{
                isEdit = false;
                $scope.addressObj.selectedProvince = '';
                $scope.addressObj.selectedCity = '';
                $scope.addressObj.cities = [];
                $scope.addressOptionObj = {
                    vname: '',
                    tel: '',
                    province: '',
                    city: '',
                    address: '',
                    code: ''
                };
                $scope.addressOptionObj.title = "新增收货地址"
            }
            $scope.addressModal.show();
        }


        function showConfirm(index,list,event) {
            event.stopPropagation();
            var myPopup = $ionicPopup.show({
                cssClass:'myOrder',
                template:'确认要删除该地址吗？',
                scope: $scope,
                buttons: [
                    { text: '取消',
                        type: ''
                    },
                    {
                        text: '确定',
                        type: '',
                        onTap: function(e) {
                            var id= list.id;
                            //删除收货地址的网络请求
                            if ($scope.addressObj.adreessListDatas.length == 0){
                                $scope.addressObj.dataIsNull = true;
                            }else {
                                $scope.addressObj.dataIsNull = false;
                            }
                            HttpFactory.getData("/api/uAddress",{id:id,sessid:SESSID},"DELETE")
                                .then(function (result) {
                                    if (result['status'] == '0'){
                                        //当用户删除的地址就是用户以前选择的地址的时候继续获取默认的
                                        MainData.userSelectAddress = 'continue';
                                        $scope.popTipsShow("删除成功");
                                        //当删除的地址为默认地址的时候 重置成第一个为默认地址
                                        if ($scope.addressObj.adreessListDatas.length && $scope.addressObj.adreessListDatas[index].setdefault == 1){
                                            $scope.addressObj.adreessListDatas.splice(index ,1);
                                            //设置第一个为默认地址
                                            changeDefault();                                        }else {
                                            $scope.addressObj.adreessListDatas.splice(index ,1);
                                        }

                                    }else {
                                        //错误提示
                                        $scope.popTipsShow(result.desc);
                                    }
                                },function (err) {

                                });
                        }
                    }
                ]
            });
        }
        //引入外部的编辑地址模态
        $ionicModal.fromTemplateUrl('editAddressModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.addressModal = modal;
        });
        $ionicModal.fromTemplateUrl('choiceAddressModal.html',{
            scope:$scope,
            animation: 'fade-out',
            focusFirstInput:true,
            backdropClickToClose:true
        }).then(function(modal) {
            $scope.selectModal = modal;
        });
        //关闭模态
        function cancelAdd() {
            $scope.addressModal.hide();
        }
        function closeModal() {
            $scope.addressModal.hide();
        }
        $scope.doSome = function () {
            console.log(111111);
        };
        //当销毁controller时会清除模态modal
        $scope.$on('$destroy', function() {
            MainData.isFromPersonToReceiptAddress = false;
            $scope.addressModal.remove();
            $scope.selectModal.remove();
            $scope.loadingOrPopTipsHide();

        });
        var selectType = '省份';
        //关闭selectModal 命名为$scope.modal.show()是为了配合加盟店的模态
        $scope.modal = {
            hide:function () {
                if (selectType == "省份"){
                    $scope.addressObj.selectedProvince = $scope.napaStores.text;
                    $scope.addressObj.selectedCity = '';
                }
                if (selectType == "城市"){
                    $scope.addressObj.selectedCity = $scope.napaStores.text;
                }
                $scope.selectModal.hide();
            }
        };
        //打开省份和失去的选择模态窗口
        function selectAddressModalShow(str) {
            selectType = str;
            if (str == "省份"){
                $scope.napaObj.provinces = $scope.addressObj.provinces;
            }
            if(selectType == "城市"){
                selectedChange($scope.addressObj.selectedProvince);
                $scope.napaObj.provinces = $scope.addressObj.cities;
            }
            $scope.selectModal.show();
        }
    }]);