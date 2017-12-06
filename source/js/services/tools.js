/**
 * Created by chaoshen on 2016/12/29.
 */
void function (global) {
    //用于数组删除指定字符串元素元素
    Array.prototype.cftRemove = function (val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index,1);
        }
    }
}(window);