/**
 * Created by chaoshen on 2016/12/27.
 */
void function (global) {
    function cftRequestUrl(/*requestUrl*/requestUrl,/*paramters*/params) {
        //判断传入的是不是对象
        var property,
            urlStr = ROOT_URL + requestUrl;
        if (Object.prototype.toString.call(params) === '[object Object]' && params != null){
            var paramsCount = 0;//主要作用是让参数的第一位有所区别
            for (property in params){
                if (params.hasOwnProperty(property)){
                    if (paramsCount == 0){
                        urlStr = urlStr + "?" + property + "=" + params[property];
                    }else {
                        urlStr = urlStr + "&" + property + "=" + params[property];
                    }
                    paramsCount ++;
                }
            }
            console.log(urlStr);
            return urlStr;
        //参数作为字符串的时候
        }else if(typeof params == 'string' && params.indexOf("?") == 0){
            return urlStr + params;
        }else {
            return urlStr;
        }
    }
    global.cftRequestUrl = cftRequestUrl;
}(window);