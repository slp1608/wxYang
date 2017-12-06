/**
 * Created by qingyun on 16/12/2.
 */
angular.module('cftApp.factories',[]).factory('HttpFactory',['$http','$q',function ($http,$q) {
    return {
        getData:function (url,params,type) {
            if (url){
                url = ROOT_URL + url;
                var promise = $q.defer();
                type = type ? type:"GET";
                params = params ? params:{};
                $http({
                    url:url,
                    method:type,
                    params:params,
                    withCredentials: true,
                    timeout:20000
                }).then(function (reslut) {
                    reslut =reslut.data;
                    // reslut = reslut[Object.keys(reslut)[0]];
                    promise.resolve(reslut);
                },function (err) {
                    console.log("error");
                    console.log(err);
                    promise.reject(err);
                });
                return promise.promise;
            }
        }
    };
}]).value('MainData',{
    shopping_car_goodsArray:null,
    userSelectAddress:null,
    selectedOrder_datas: null,
    isFromPersonToReceiptAddress:false
});