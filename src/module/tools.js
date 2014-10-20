/**
 * 公用方法集
 * @description 常用方法集合
 * @list
 *     cookie操作 cookie
 *     浏览器判断 browser
 *     解析URL(普通类) queryUrl
 *     随机数 random
 *     打开新窗口 open
 *     节流方法 delay
 * @author xieliang
 * @date 20140630
 */
define(function (require) {
    'use strict';

    var $ = require('./jquery');

    /**
     * 方法对象
     * @global
     * @namespace tools
     * @type {Object}
     */
    var tools = {},
        cookie = tools.cookie = {};



    /**
     * 版本
     * @type {String}
     */
    tools.version = '2.0';

    /**
     * 判断浏览器
     * @memberOf tools
     * @namespace tools.browser
     * @example
     *     1: tools.browser.msie; //ie浏览器
     *     2: tools.browser.webkit; //谷歌内核
     *     3: tools.browser.mozilla; //火狐内核
     *     4: tools.browser.isIe6; //是否为ie6
     *     5: tools.browser.isMedia; //浏览器是否支持css3中的media特性, 此判断为判断浏览器版本，ie9(包括)++和标准浏览器支持
     *     6: tools.browser.isCss3; //浏览器支持css3标准动画，此判断为判断浏览器版本，标准浏览器和ie10支持
     */
    tools.browser = (function () {
        var obj = {},
            d = (function (ua) {
                ua = ua.toLowerCase();
                var b = /(chrome|version)[ \/]([\w.]+)/.exec(ua) ||
                    /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) ||
                    /(msie) ([\w.]+)/.exec(ua) ||
                    ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua) || [];
                return {
                    browser: b[1] || '',
                    version: b[2] || '0'
                }
            }(navigator.userAgent));
        if (d.browser) {
            obj[d.browser] = true;
            obj.version = d.version;
        }
        if (obj.webkit) {
            obj.safari = true;
        }

        //判断ie6
        obj.isIe6 = navigator.appVersion.indexOf('MSIE 6') > -1;

        //判断是否支持media, ie6 7 8
        obj.isMedia = !!window.addEventListener;

        //判断是否支持transition ie6789
        obj.isCss3 = !!(obj.isMedia ? (obj.msie && parseInt(obj.version, 10) <= 9 ? 0 : 1) : 0);


        return obj;
    }());




    /**
     * 解析URL, 获取地址栏参数
     * @param  {string} name 要获取的参数名, 可以为空则表示解析url为对象
     * @param  {string} [url=location.URL]  被解析的url, 如果为空则使用当面页面的url
     * @return {string}      得到的值, 或者解析后的对象
     *
     * @memberOf tools
     * @function
     * @example
     *     1:
     *         url: index.php?a=1&b=2&c=3
     *         tools.queryUrl('a') => 2
     *         tools.queryUrl('b') => 3
     *         tools.reuqest('xx') => ''
     *         tools.queryUrl() => {a:1,b:2,c:3}
     *     2:
     *         tools.queryUrl('a','?a=1&b=2&c=3') => 1
     *     3:
     *         tools.queryUrl('', '?a=1&b=2&c=3') => {a:1, b:2, c:3}
     */
    tools.queryUrl = function (name, url) {
        var results,
            params, qrs2, i, len;


        url = typeof(url) === 'string' ? 
            (url.indexOf('?') === 0 ? url.substr(1) : url) : 
                location.search.substr(1);

        if (name) {
            results = url.match(new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'));
            results = results === null ? '' : decodeURIComponent(results[2]);
        } else {
            results = {};
            if (url) {
                params = url.split('&');
                i = 0;
                len = params.length;
                for (i = 0; i < len; i++) {
                    qrs2 = params[i].split('=');
                    results[qrs2[0]] = (qrs2[1] === void 0 ? '' : decodeURIComponent(qrs2[1]));
                }
            }
        }
        return results;
    }


    /**
     * 获取hash
     * @param  {string|null} name 要获取的值,如果为空则获取hash为对象
     * @return {string|object} 结果
     *
     * @example
     *     1, hash = #xl=1&a=2
     *         getHash('xl') => 1
     *         getHash('a') => 2
     *         getHash('b') => '';
     *         gethash() => {xl:1, a:2}
     */
    tools.getHash = function(name){
        var url = tools.queryUrl(null, location.hash.substr(1));

        if(name){
            url = url[name] || '';
        }

        return url;
    }


    /**
     * 设置hash
     * @param {string|null} key 要设置的key, 如果为空则清空所有
     * @param {string|null} value 要设置的值,如果为空则删除该key
     * @return {object} tools对象
     *
     * @example
     *     1, hash = #xl=1&a=2
     *         setHash('xl', 3) => #xl=3&a=2
     *         setHash('a') => #xl=3
     *         getHash() => #
     */
    tools.setHash = function(key, value){
        var hash;

        if(!key){
            location.hash = '';
        } else {
            hash = tools.getHash();
            if(!value){
                delete hash[key];
            } else {
                hash[key] = value;
            }
            location.hash = $.param(hash);
        }
        
        return tools;
    }



    /**
     * 获取随机数
     * @param  {number} start 起数 或者 空
     * @param  {number} end   结束数
     * @return {number}       随机的数字
     *
     * @function
     * @memberOf tools
     * @example
     *     1, tools.random();// 随机一个数
     *     2, tools.random(1,200);//随机1-200之间
     */
    tools.random = function (start, end) {
        if (start === void 0) {
            return Math.round(Math.random() * 1e6);
        }
        return Math.round(Math.random() * (end - start) + start);
    }


    /**
     * 延迟, 感谢雨夜带刀 http://stylechen.com/dom-event-optimize.html  
     * @param {function} fn 回调函数
     * @param {number} timeout 延迟ms
     * @returns {function} 生成的节流方法
     *
     * @example
     *     1, 滚动节流
     *         window.onscroll = tools.delay(function(event){
     *             
     *         }, 100);
     */
    tools.delay = function (fn, timeout) {
        var timer;
        timeout = parseInt(timeout, 10) || 0;

        return function () {
            var self = this,
                args = arguments;

            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(self, args);
            }, timeout);
        }
    }





    /**
     * 打开新窗口
     * @param {string} url 连接
     * @param {(object|undefined)} options 可选的配置参数, 其中包含width,height,left,top四个参数
     * @param {number} [options.width=550] 窗口宽, 默认为 550
     * @param {number} [options.height=420] 窗口高, 默认为420
     * @param {number} [options.left=auto] 窗口x, 默认居中
     * @param {number} [options.top=auto] 窗口y, 默认居中
     * @return {object} 当前新窗口的实例
     *
     * @example
     *     1, tools.open('/');
     *     2, tools.open('/',{
     *            width:1000,
     *            height:300
     *        });
     *     3, tools.open('/', {
     *         left:0,
     *         top:0,
     *         width:100,
     *         height:100
     *     })
     *     4,  var a = tools.open('/html',{width:1000});
     *         setTimeout(function(){
     *             a.close();
     *         },3000);
     */
    tools.open = function (url, options) {
        var str = '',
            key;
        if (options) {
            
            if('object' !== typeof options){
                options = {};
            }

            options.height = options.height || 420;
            options.width = options.width || 550;
            options.left = options.left || ((screen.width - options.width) / 2); //默认为居中
            options.top = options.top || ((screen.height - options.height) / 2); //默认为居中

            for (key in options) {
                str += ',' + key + '=' + options[key];
            }
            str = str.substr(1);
        }
        return window.open(url, 'window_' + (+new Date()), str);
    }



    /**
     * 设置cookie的域
     * @type {String}
     */
    cookie.domain = '';

    /**
     * 获取cookie
     * @param  {string} name 要获取的名
     * @return {string}      获取到的值, 如果不存在则为 空字符串
     */
    cookie.get = function (name) {
        if (name) {
            name = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
            if (name !== null) {
                return decodeURIComponent(name[2]);
            }
        }
        return '';
    }


    /**
     * 设置cookie
     * @param {(string|object)} name  键名或者一组对象
     * @param {string} value 键值
     * @param {(number|Date)} time  过期的时间, 如果为数字单位为天, 或者为date对象
     * @return {object} cookie对象
     */
    cookie.set = function (name, value, time) {
        var key,
            expires = '',
            date;
            
        if (!name) { //没有名称或者没有值则返回this
            return cookie;
        }

        //如果是 ({xl:1, xl2:2})
        if ('object' === typeof (name)) {
            for (key in name) {
                cookie.set(key, name[key]);
            }
            return cookie;
        }


        if (time && (typeof time === 'number' || time.toUTCString)) {
            if (typeof time === 'number') {
                date = new Date();
                date.setTime(date.getTime() + (time * 24 * 60 * 60 * 1000));
            } else {
                date = time;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
            date = null;
        }

        document.cookie = name + '=' + encodeURIComponent(value) + ';path=/;domain=' + cookie.domain + expires;
        return cookie;
    }

    /**
     * 删除cookie
     * @param  {string} name 要移除的名
     * @return {object}      cookie对象
     */
    cookie.remove = function (name) {
        if (!!this.get(name)) {
            this.set(name, 0, -10);
        }
        return cookie;
    }


    //配置cookie的domain
    ;(function () {
        var host = location.host,
            domain;

        if(host === 'localhost'){//如果是本地地址
            domain = host;
        } else if(host.match(/^(\d{1,3}\.){3}(\d{1,3})$/)){//如果是数字IP
            domain = host;
        } else if(host.match(/\w+(?:(\.(gov|com|net|org))?)\.\w+$/)){//如果是自定义域名
            domain = host.match(/\w+(?:(\.(gov|com|net|org))?)\.\w+$/)[0];
        }

        cookie.domain = domain;
    })();

    return tools;
});