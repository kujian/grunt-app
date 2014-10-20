/**
 * seajs配置文件
 * @description 该文件将会与seajs打包成1个,为了做版本区分, 是动态获取seajsnode上的src连接时间缀
 */
(function() {
    'use strict';
    
    var version = (document.getElementById('seajsnode') || {}).src;
    if (version && version.indexOf('?') > -1) {
        seajs.config({
            map: [
                function(uri) {
                    return uri + version.substr(version.indexOf('?'));
                }
            ]
        });
    }
}());