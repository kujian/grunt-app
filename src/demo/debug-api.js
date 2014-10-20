/**
 * 调试接口js
 * @copyright 嫁拍
 * @author xieliang
 * @email admin@xuexb.com
 */

define(function(require){
    'use strict';

    var $ = require('../module/jquery');

    var __$ = (function(){
        var dom = {};
        return function(id){
            return dom[id] || (dom[id] = $('#J-'+ id));
        }
    }());



    //绑定添加数据
    __$('data-btn').on('click', function(){
        var key = __$('data-key').val(),
            val = __$('data-val').val();

        if(key === ''){
            __$('tips').html('key为空!');
            __$('data-key').focus();
        } else if(!/^[\w\-]+$/.test(key)) {
            __$('tips').html('key不正确!');
            __$('data-key').select().focus();
        } else if($('#J-data-key-'+ key).length){//如果已经添加
            __$('tips').html('key已经存在!');
            __$('data-key').select().focus();
        } else if(val === ''){
            __$('tips').html('val为空!');
            __$('data-val').focus();
        } else {
            __$('data-list').append('<li title="点击删除该数据">'+ key +'='+ val +'\
                    <input type="hidden" id="J-data-key-'+ key +'" value="'+ val +'" name="'+ key +'"></li>');
            
            __$('data-val').val('');
            __$('tips').empty();
            __$('data-key').val('').focus();
        }
    });

    //委托删除数据
    __$('data-list').on('click', 'li', function(){
        $(this).remove();
    });

    //url中按回车
    __$('url').on('keydown', function(event){
        if(event.keyCode === 13){
            __$('post').triggerHandler('click');
            return !1;
        }
    });


    //jsonp单选
    __$('data-type').on('click', 'input', function(){
        if(this.value === 'jsonp'){
            __$('type').find('input').eq(1).prop('checked', !0);
            __$('type').find('input').eq(0).prop('disabled', !0);
        } else {
            __$('type').find('input').eq(0).prop('disabled', !1);
        }
    });


    __$('data-key').add(__$('data-val')).on('keydown', function(){
        if(event.keyCode === 13){
            __$('data-btn').triggerHandler('click');
            return !1;
        }
    });


    //绑定提交事件
    __$('post').on('click', function(){
        var url_val = $.trim(__$('url').val()),
            type_val = __$('type').find('input:checked').val(),
            data_type_val = __$('data-type').find('input:checked').val();

        if(url_val === ''){
            __$('tips').html('请输入链接!');
            __$('url').focus();
        } else if(!type_val){
            __$('tips').html('请选择请求类型!');
        } else if(!data_type_val){
            __$('tips').html('请选择响应类型!');
        } else {
            __$('tips').empty();
            __$('post').addClass('loading');

            setTimeout(function(){
                $.ajax({
                    url: url_val,
                    type: type_val,
                    dataType: data_type_val,
                    data: __$('data-form').serialize()
                }).success(function(res, statusText, XMLHttpRequest){
                    __$('response').text(XMLHttpRequest.responseText);
                }).error(function(XMLHttpRequest, textStatus, errorThrown){

                    //输出返回值
                    __$('response').text(XMLHttpRequest.responseText || errorThrown || '是不是跨域了?');

                    //在tips上提示状态
                    if(errorThrown === ''){
                        __$('tips').text('是不是跨域了?');
                    } else {
                        __$('tips').text('status: '+ XMLHttpRequest.status +', \
                            statusText: '+ XMLHttpRequest.statusText +', \
                            textStatus: '+ textStatus +', \
                            errorThrown: '+ errorThrown);
                    }
                    
                }).complete(function(){
                    __$('post').removeClass('loading');
                });
            }, 300);
        }

        return !1;
    });


    /**
     * 
     */
});