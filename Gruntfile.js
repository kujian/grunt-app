/**
 * 易结网前端自动化编译, 请先配置 app.json
 *
 * @copyright 易结网
 *
 * @author xieliang
 *
 * @version 2.0
 *
 * @link
 *     1, http://www.xuexb.com/html/223.html
 *     2, http://www.xuexb.com/html/222.html
 *     
 * @description 文档待整理
 * 
 */
module.exports = function(grunt) {
    'use strict'; //严禁模式

    var transport_script = require('grunt-cmd-transport').script.init(grunt),
        config = grunt.file.readJSON('package.json'), //读取 package.json 配置
        banner = '/*' + config.name + ' - v' + config.version + ' - <%= grunt.template.today("yyyy-mm-dd  HH:mm:ss") %>*/';//默认添加压缩文件头信息

    //应用配置
    var App = grunt.file.readJSON("app.json");



    var obj = {}; //初始化对象
    var transport = obj.transport = {}; //seajs提取依赖
    var concat = obj.concat = {}; //合并代码
    var uglify = obj.uglify = {}; //压缩js
    var copy = obj.copy = {}; //复制文件
    var cssmin = obj.cssmin = {}; //css压缩
    var watch = obj.watch = {}; //文件监听
    var connect = obj.connect = {}; //web server
    var sprite = obj.sprite = {};//雪碧图
    var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;//url重写


    //配置包
    obj.pkg = config;


    //抽取cmd依赖配置
    //不使用alias
    transport.options = {
        debug: false,
        paths: [''],
        // alias: { //命名引用, 这里写的生成前的地址
        //     // 'jquery': 'lib/jquery',//jquery库
        //     // 'base': 'lib/base',//初类
        //     // 'dialog': 'lib/dialog'//弹出层
        // },
        parsers: { //解析方式
            '.js': [transport_script.jsParser]
        }
    }

    //复制文件配置
    copy.options = {
        paths: ['']
    }

    //js压缩配置
    uglify.options = {
        banner: banner
    }


    //css压缩配置
    cssmin.options = {
        banner: banner,
        compatibility: 'ie7'
    }


    // http服务配置
    connect.options = {
        port: config.port,
        base: "./",
        hostname: config.hostname,
        middleware: function(connect, options) {
            var middlewares = [];

            // RewriteRules support
            middlewares.push(rewriteRulesSnippet);

            if (!Array.isArray(options.base)) {
                options.base = [options.base];
            }

            var directory = options.directory || options.base[options.base.length - 1];
            options.base.forEach(function(base) {
                // Serve static files.
                middlewares.push(connect.static(base));
            });

            // Make directory browse-able.
            middlewares.push(connect.directory(directory));

            return middlewares;
        }
    }
    connect.server = {}
    connect.server_keepalive = {
        options: {
            keepalive: true
        }
    }



    // 自动雪碧图配置
    sprite.options = {
        // 各图片间间距，如果设置为奇数，会强制+1以保证生成的2x图片为偶数宽高，默认 0
        padding: 0,
        // 是否使用 image-set 作为2x图片实现，默认不使用
        useimageset: false,
        // 是否以时间戳为文件名生成新的雪碧图文件，如果启用请注意清理之前生成的文件，默认不生成新文件
        newsprite: false,
        // 给雪碧图追加时间戳，默认不追加
        spritestamp: false,
        // 在CSS文件末尾追加时间戳，默认不追加
        cssstamp: false,
        // 默认使用二叉树最优排列算法
        algorithm: 'binary-tree',
        // 默认使用`pngsmith`图像处理引擎
        engine: 'pngsmith',
        // 映射CSS中背景路径，支持函数和数组，默认为 null
        imagepath_map: null
    }




    grunt.initConfig(obj);



    //激活插件
    grunt.loadNpmTasks('grunt-css-sprite');//雪碧图
    grunt.loadNpmTasks('grunt-cmd-transport');//cmd抽取依赖
    grunt.loadNpmTasks('grunt-cmd-concat');//合并
    grunt.loadNpmTasks('grunt-contrib-watch');//兼听
    grunt.loadNpmTasks('grunt-contrib-copy');//复制
    grunt.loadNpmTasks('grunt-contrib-uglify');//js压缩
    grunt.loadNpmTasks('grunt-contrib-cssmin');//css压缩
    grunt.loadNpmTasks('grunt-contrib-connect');//服务http
    grunt.loadNpmTasks('grunt-connect-rewrite');//url rewrite




    grunt.registerTask("debug", "http调试", function(){
        var taskName = [];
        if (config.rewrite !== "src" && config.rewrite !== "src->src") {
            create_rules();//创建路由映射
            taskName.push('configureRewriteRules');
        }
        taskName.push('connect:server_keepalive');
        grunt.task.run(taskName);
    });




    grunt.registerTask("init-css", "初始化css", function(type, name, noSprite) {
        var app,
            src_path,
            result;

        //检查方法
        if(!check_app('css', type, name)){
            return false;
        }
        
        //app.home.css.common
        app = App[type]['css'][name];

        //兼容直接写源文件地址
        if(Array.isArray(app) || 'string' === typeof(app)){
            app = {
                src: app
            }
        }

        //定义路径,如果配有cwd则为 src + cwd, 否则为 src/
        src_path = get_path('src') + (app.cwd || '');

        //如果有依赖包
        if (app.dest) {

            result = {//提前声明好用
                options: {
                    noncmd: true
                },
                dest: get_path_str(src_path + app.dest),
            }

            if (app.src) {//如果有源
                result.src = get_path_arr(app.src, src_path);
            }

            if(app.sprite){//如果有sprite图

                if(!result.src){
                    result.src = [];//让下面可以push用                   
                }

                if(!Array.isArray(app.sprite)){//如果不是数组则整成数组
                    app.sprite = [app.sprite];
                }

                app.sprite.forEach(function(val){//遍历所有的sprite, 把sprite的src追加到src里
                    val.src && result.src.push(get_path_str(src_path + val.src));
                });

            }

        }


        if(result && result.src && result.src.length){//如果有src才算真爱, 才让欺全并
            grunt.config.set('concat.init', result);
            grunt.task.run('concat:init');
        } else {
            log("app."+ type +".css."+ name +" 包里没有配置源css值, 如: src, sprite");
        }
    });



    grunt.registerTask("build-css", "编译css", function(type, name) {
        var app,
            src_path,
            build_path,
            result;

        //检查方法
        if(!check_app('css', type, name)){
            return false;
        }


        //app.home.css.common
        app = App[type]['css'][name];

        //兼容直接写源文件地址
        if(Array.isArray(app) || 'string' === typeof(app)){
            app = {
                src: app
            }
        }


        //定义路径,如果配有cwd则为 src + cwd, 否则为 src/
        src_path = get_path('src') + (app.cwd || '');


        // 定义编译路径
        build_path = src_path.replace(config.src_path, config.build_path);


        //处理sprite到build, 但不压缩
        if(app.sprite){
            if(!Array.isArray(app.sprite)){
                app.sprite = [app.sprite];
            }

            app.sprite.forEach(function(val, index){
                var sprite_src = get_path_str(build_path + val.src);

                //把需要sprite的css复制到build里
                grunt.config.set('copy.sprite-'+ index, {
                    src: get_path_str(src_path + val.src),
                    dest: sprite_src
                });
                grunt.task.run('copy:sprite-'+ index);



                


                var options = val.options;
                if(!Array.isArray(options)){
                    options = [options];
                }


                //自动雪碧sprite
                options.forEach(function(val2, index2){

                    //如果没有定义或者不为false则复制图
                    if(val2.copy === void 0 || !val2.copy === false){
                        //把sprite的图复制到build里, 要不spriet会失败
                        grunt.config.set('copy.sprite-img-'+ index2, {
                            files: [{
                                cwd: val2.imagepath,
                                expand: true,
                                src: '*.png',
                                dest: val2.imagepath.replace(config.src_path, config.build_path),
                                filter: 'isFile'
                            }]
                        });
                        grunt.task.run('copy:sprite-img-'+ index2);
                    }

                    



                    //替换变量 src => build
                    val2.imagepath = val2.imagepath ? val2.imagepath.replace(config.src_path, config.build_path) : '';
                    val2.spritedest = val2.spritedest ? val2.spritedest.replace(config.src_path, config.build_path) : '';
                    grunt.config.set('sprite.build-'+ index2, {
                        options: val2,
                        src: sprite_src,
                        dest: sprite_src
                    });
                    grunt.task.run('sprite:build-'+ index2);
                });
            });


            // grunt.task.run('copy');
            // grunt.task.run('sprite');
        }


        //处理源到build, 但不压缩
        if(app.src){
            // 复制
            result = {
                files: [{
                    expand: true,
                    cwd: src_path,
                    src: app.src,
                    dest: build_path,
                    filter: 'isFile'
                }]
            }
            grunt.config.set('copy.src', result);
            grunt.task.run('copy:src');
        }


        if(app.dest){//如果有依赖处理

            result = {//提前声明好用
                options: {
                    noncmd: true
                },
                dest: get_path_str(build_path + app.dest),
            }

            if (app.src) {//如果有源
                result.src = get_path_arr(app.src, build_path);
            }

            if(app.sprite){//如果有sprite图

                if(!result.src){
                    result.src = [];//让下面可以push用                   
                }

                if(!Array.isArray(app.sprite)){//如果不是数组则整成数组
                    app.sprite = [app.sprite];
                }

                app.sprite.forEach(function(val){//这里的sprite css已经在build层里, 且处理过合并img了
                    val.src && result.src.push(get_path_str(build_path + val.src));
                });

            }




            if(result.src && result.src.length){

                //合并
                grunt.config.set('concat.dest', result);
                grunt.task.run('concat:dest');


                //压缩
                grunt.config.set('cssmin.dest', {
                    options: {
                        banner: app.banner || banner
                    },
                    src: get_path_str(build_path + app.dest),
                    dest: get_path_str(build_path + app.dest)
                });
                grunt.task.run('cssmin:dest');
            }
        }




        if(app.src){//如果有源则压缩源
            grunt.config.set('cssmin.src', {
                options: {
                    banner: app.banner || banner
                },
                files:  [{
                    expand: true,
                    cwd: build_path,
                    src: app.src,
                    dest: build_path,
                    filter: 'isFile'
                }]
            });
            grunt.task.run('cssmin:src');
        }


        if(app.sprite){//如果有雪碧压缩她吧... 强占她吧
            result = [];//要压缩的路径包, 这里是要遍历sprite的src生成出来

            if(!Array.isArray(app.sprite)){
                app.sprite = [app.sprite];
            }

            app.sprite.forEach(function(val){
                val.src && result.push(val.src);
            });


            if(result.length){
                grunt.config.set('cssmin.sprite', {
                    options: {
                        banner: app.banner || banner
                    },
                    files:  [{
                        expand: true,
                        cwd: build_path,
                        src: result,
                        dest: build_path,
                        filter: 'isFile'
                    }]
                });
                grunt.task.run('cssmin:sprite');
            }
        }
    });


    grunt.registerTask("release-css", "发布css", function(type, name) {
        var app,
            dist_path,
            build_path,
            result;

        //检查方法
        if(!check_app('css', type, name)){
            return false;
        }


        //app.home.css.common
        app = App[type]['css'][name];

        //兼容直接写源文件地址
        if(Array.isArray(app) || 'string' === typeof(app)){
            app = {
                src: app
            }
        }


        //定义路径,如果配有cwd则为 src + cwd, 否则为 src/
        build_path = get_path('build') + (app.cwd || '');


        // 定义最终路径
        dist_path = build_path.replace(config.build_path, config.dist_path);


        // 定义最终文件数组
        result = [];

        //如果有依赖文件, 只复制依赖文件, 从 build->dist里
        if (app.dest) {
            if (grunt.file.exists(get_path_str(build_path + app.dest))) {
                result.push(app.dest);
            } else {
                log("依赖文件不存在, 请先编译 : "+ get_path_str(build_path + app.dest));
                return false;
            }
        }


        //如果有源文件则添加队列
        if(app.src){
            result.push(app.src);
        }


        //如果有sprite图
        if(app.sprite){
            if(!Array.isArray(app.sprite)){
                app.sprite = [app.sprite];
            }

            app.sprite.forEach(function(val){
                val.src && result.push(val.src);
            });
        }


        //如果队列里有
        if(result.length){
            grunt.config.set('copy.result', {
                files: [{
                    expand: true,
                    cwd: build_path,
                    src: result,
                    dest: dist_path,
                    filter: 'isFile'
                }]
            });
            grunt.task.run('copy');
        }
    });


    grunt.registerTask("debug-css", "调试css", function(type, name, noserver) {
        var app,
            src_path,
            result,
            isSprite;

        //检查方法
        if(!check_app('css', type, name)){
            return false;
        }
        


        //app.home.css.common
        app = App[type]['css'][name];


        //兼容直接写源文件地址
        if(Array.isArray(app) || 'string' === typeof(app)){
            app = {
                src: app
            }
        }


        //定义路径,如果配有cwd则为 src + cwd, 否则为 src/
        src_path = get_path('src') + (app.cwd || '');



        //如果有依赖包
        if (app.dest) {
            result = [];


            //如果有源则 "插入" 源的路径
            if(app.src){    
                result = get_path_arr(app.src, src_path);
            }

            // 如果有sprite图, 则也插入
            if(app.sprite){
                if(!Array.isArray(app.sprite)){//保证是数组
                    app.sprite = [app.sprite];
                }


                result = result.concat(app.sprite.map(function(val){
                    return get_path_str(src_path + val.src);
                }));
            }
        }


        var taskName;
        if(result && result.length){
            if(!noserver){//需要启用http
                if (config.rewrite !== 'src' && config.rewrite !== 'src->src') {
                    create_rules();//创建路由映射
                    taskName = ['configureRewriteRules', 'connect:server'];
                } else {
                    taskName = ['connect:server'];
                }

                grunt.task.run(taskName);
            }
            grunt.config.set('watch.dest', {
                files: result,
                tasks: ['init-css:' + type + ":" + name +":true"] //运行初始化任务
            });
            grunt.task.run('watch');
        } else {
            log("没有找到要监听的文件, 请查看是否配置过 src, sprite");
        }

    });




    /**
     * 初始化生成
     */
    grunt.registerTask("init-js", "初始化js", function(type, name) {
        var app,
            src_path,
            result;

        //检查方法
        if(!check_app('js', type, name)){
            return false;
        }
        


        //app.home.js.common
        app = App[type]['js'][name];

        //兼容直接写源文件地址
        if(Array.isArray(app) || 'string' === typeof(app)){
            app = {
                src: app
            }
        }


        //定义路径,如果配有cwd则为 src + cwd, 否则为 src/
        src_path = get_path('src') + (app.cwd || '');


        //如果没有生成版本
        if (!app.dest) {
            log("没有依赖文件, 不需要初始化");
            return false;
        }


        //如果没有cmd
        if(!app.noCmd){
            log("全部是cmd模块文件, 不需要初始化, 如果说你是在页面中直接引用的可在配置里添加一个 noCmd 空文件来解决");
            return false;
        }


        //如果有非cmd模块,则只生成 非cmd 模块
        result = {
            options: {
                noncmd: true
            },
            dest: get_path_str(src_path + app.dest),
            src: get_path_arr(app.noCmd, src_path)
        }


        grunt.config.set('concat.init', result);
        grunt.task.run('concat:init');
    });

    
    grunt.registerTask("build-js", "编译js", function(type, name) {
        var app,
            src_path,
            build_path,
            result;

        //检查方法
        if(!check_app('js', type, name)){
            return false;
        }
        


        //app.home.js.common
        app = App[type]['js'][name];

        //兼容直接写源文件地址
        if(Array.isArray(app) || 'string' === typeof(app)){
            app = {
                src: app
            }
        }


        //定义路径,如果配有cwd则为 src + cwd, 否则为 src/
        src_path = get_path('src') + (app.cwd || '');

        //编译目录
        build_path = src_path.replace(config.src_path, config.build_path);



        //如果有cmd模块, 先提取依赖到 build 里
        if (app.src) {
            result = {
                files: [{
                    expand: true, //智能搜索
                    cwd: src_path,
                    src: app.src,
                    dest: build_path,
                    filter: 'isFile'
                }]
            }


            //处理id前缀
            if (app.idleading) {
                result.options = {
                    idleading: app.idleading
                }
            } else {
                if (app.cwd) {
                    if (app.cwd.slice(-type.length + 1, -1) === type) {
                        result.options = {
                            idleading: type + "/"
                        }
                    }
                } else {
                    result.options = {
                        idleading: type + "/"
                    }
                }
            }

            grunt.config.set('transport.src', result);
            grunt.task.run('transport:src');
        }



        //分情况进行合并
        //如果有 dest, 则dest已经有nocmd了,所有只需要处理src
        if(app.dest){

            if (!grunt.file.exists(get_path_str(src_path + app.dest))) {
                log("依赖文件不存在, 请先初始化 : "+ get_path_str(src_path + app.dest));
                return false;
            }

            //先把src里的dest移动过来
            result = {
                options: {
                    noncmd: true
                },
                src: [ get_path_str(src_path + app.dest) ],//下面要用数组
                dest: get_path_str(build_path + app.dest)
            }

            //如果有 源文件, 则一并合成,这里的源已经在build层了
            if (app.src) {
                result.src = result.src.concat(get_path_arr(app.src, build_path));
                // result.src.push.apply(result.src, get_path_arr(app.src, build_path));
            }
            grunt.config.set('concat.dest', result);
            grunt.task.run('concat:dest');

            //压缩最终版
            result = {
                options: {
                    banner: app.banner || banner
                },
                src: get_path_str(build_path + app.dest),
                dest: get_path_str(build_path + app.dest)
            }
            grunt.config.set("uglify.dest", result);
            grunt.task.run("uglify:dest");
        } 


        //如果有非cmd模块
        if(app.noCmd){
            //复制src到build
            result = {
                files: [{
                    expand: true, //智能搜索
                    cwd: src_path,
                    src: app.noCmd,
                    dest: build_path,
                    filter: 'isFile'
                }]
            }
            grunt.config.set("copy.noCmd", result);
            grunt.task.run("copy:noCmd");

            // 压缩build
            result = {
                options: {
                    banner: app.banner || banner
                },
                files: [{
                    expand: true, //智能搜索
                    cwd: build_path,
                    src: app.noCmd,
                    dest: build_path,
                    filter: 'isFile'
                }]
            }
            grunt.config.set("uglify.noCmd", result);
            grunt.task.run("uglify:noCmd");
        }


        if(app.src){
            //这里的源已经在build里了
            //开始压缩src
            result = {
                options: {
                    banner: app.banner || banner
                },
                files: [{
                    expand: true, //智能搜索
                    cwd: build_path,
                    src: app.src,
                    dest: build_path,
                    filter: 'isFile'
                }]
            }
            grunt.config.set("uglify.src", result);
            grunt.task.run("uglify:src");
        }
    });


    grunt.registerTask("debug-js", "调试js", function(type, name, noserver) {
        var app,
            src_path,
            result;

        //检查方法
        if(!check_app('js', type, name)){
            return false;
        }
        


        //app.home.js.common
        app = App[type]['js'][name];

        //兼容直接写源文件地址
        if(Array.isArray(app) || 'string' === typeof(app)){
            app = {
                src: app
            }
        }


        //定义路径,如果配有cwd则为 src + cwd, 否则为 src/
        src_path = get_path('src') + (app.cwd || '');



        //如果有依赖包
        if (app.dest) {
            if (app.noCmd) { //必须有源才行, 没有源的话去找个妹子要点吧
                grunt.task.run('init-js:' + type + ":" + name);//这里先初始化, 以防文件没有初始化过
                result = {
                    files: get_path_arr(app.noCmd, src_path),
                    tasks: ['init-js:' + type + ":" + name] //运行初始化任务
                }
            }
        }

        //如果有则说明有源文件和依赖文件, 需要监听
        var taskName;
        if (result) {
            if (!noserver) {
                if (config.rewrite !== 'src' && config.rewrite !== 'src->src') {
                    create_rules(); //创建路由映射
                    taskName = ['configureRewriteRules', 'connect:server'];
                } else {
                    taskName = ['connect:server'];
                }
                grunt.task.run(taskName);
            }
            grunt.config.set('watch.dest', result);
            grunt.task.run('watch:dest');
        } else { //如果没有依赖文件, 则只启动web server,后期可以做成监听并刷新
            log("没有配置源文件, 不需要调试")
        }

    });
    


    grunt.registerTask("release-js", "发布js", function(type, name) {
        var app,
            dist_path,
            build_path,
            result;

        //检查方法
        if(!check_app('js', type, name)){
            return false;
        }
        


        //app.home.js.common
        app = App[type]['js'][name];

        //兼容直接写源文件地址
        if(Array.isArray(app) || 'string' === typeof(app)){
            app = {
                src: app
            }
        }

        //定义路径,如果配有cwd则为 build + cwd, 否则为 build/
        build_path = get_path('build') + (app.cwd || '');

        //编译目录
        dist_path = build_path.replace(config.build_path, config.dist_path);


        //移动 build 文件到 dist里
        //如果有依赖文件, 只复制依赖文件
        //这里需要再加上app.src
        //如果有cmd模块
        if(app.src){
            //复制build到dist
            result = {
                files: [{
                    expand: true, //智能搜索
                    cwd: build_path,
                    src: app.src,
                    dest: dist_path,
                    filter: 'isFile'
                }]
            }
            grunt.config.set("copy.src", result);
            grunt.task.run("copy:src");
        }
        if (app.dest) {
            if (!grunt.file.exists(get_path_str(build_path + app.dest))) {
                log("依赖文件不存在, 请先编译 : "+ get_path_str(build_path + app.dest));
                return false;
            }
            result = {
                src: get_path_str(build_path + app.dest),
                dest: get_path_str(dist_path + app.dest)
            }
            grunt.config.set("copy.dest", result);
            grunt.task.run("copy:dest");
        }
        //如果有非cmd模块
        if(app.noCmd){
            //复制build到dist
            result = {
                files: [{
                    expand: true, //智能搜索
                    cwd: build_path,
                    src: app.noCmd,
                    dest: dist_path,
                    filter: 'isFile'
                }]
            }
            grunt.config.set("copy.nocmd", result);
            grunt.task.run("copy:nocmd");
        }
    });
    
    
    grunt.registerTask("init-copy", function(){
        log("复制文件不需要初始化");
    });

    grunt.registerTask("debug-copy", function(){
        log("复制文件不需要调试");
    });


    grunt.registerTask("build-copy", "复制文件到build层", function(type, name){
        var app,
            src_path;

        //检查方法
        if(!check_app('copy', type, name)){
            return false;
        }
        

        

        app = App[type]['copy'][name];

        //兼容直接写源文件地址
        if(Array.isArray(app) || 'string' === typeof(app)){
            app = {
                src: app
            }
        }


        if(!app.src){
            log("请先配置源文件地址");
            return false;
        }


        //定义路径,如果配有cwd则为 src + cwd, 否则为 src/
        src_path = get_path('src') + (app.cwd || '');



        grunt.config.set("copy.build", {
            files: [{
                expand: true, //智能搜索
                cwd: src_path,
                src: app.src,
                dest: src_path.replace(config.src_path, config.build_path),
                filter: 'isFile'
            }]
        });
        grunt.task.run("copy:build");
    });



    grunt.registerTask("release-copy", "复制文件到dist层", function(type, name){
        var app,
            isCwd,
            build_path,
            result;

        //检查方法
        if(!check_app('copy', type, name)){
            return false;
        }

        app = App[type]['copy'][name];


        //兼容直接写源文件地址
        if(Array.isArray(app) || 'string' === typeof(app)){
            app = {
                src: app
            }
        }



        if(!app.src){
            log("请先配置源文件地址");
            return false;
        }


        //定义路径,如果配有cwd则为 build + cwd, 否则为 build/
        build_path = get_path('build') + (app.cwd || '');



        grunt.config.set("copy.build", {
            files: [{
                expand: true, //智能搜索
                cwd: src_path,
                src: app.src,
                dest: src_path.replace(config.build_path, config.dist_path),
                filter: 'isFile'
            }]
        });


    });




    /**
     * 打印日志
     * @param  {string} str 要打印的信息
     */
    function log(str) {
        grunt.log.writeln("Error => "+ str);
    }



    /**
     * 获取目标路径
     * @param  {string} type   类型， 如： css,js,img
     * @param  {string} target 目标，如：src源，build编译，dist发布版
     * @return {string}        最终路径
     */
    function get_path(target) {
        return config[(target || 'src') + '_path'];
    }





    /**
     * 转换路径, 摘自sea.js
     * @param  {string} path 要转换的路径
     * @return {string} 转换后的路径
     * @example
     *     1, ./a/../b => ./b
     *     2, ./a/b/c/d/../../e => ./a/b/e
     */
    function get_path_str(path) {
        var DIRNAME_RE = /[^?#]*\//
        var DOT_RE = /\/\.\//g
        var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//
        var MULTI_SLASH_RE = /([^:/])\/+\//g
        path = path.replace(DOT_RE, "/")

        path = path.replace(MULTI_SLASH_RE, "$1/")
        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, "/")
        }
        return path
    }


    /**
     * 转换路径, 数组类型
     * @param  {array} arr  数组
     * @param  {undefined | string} path 路径前缀或者空
     * @return {array}      转换后的数组
     */
    function get_path_arr(arr, path) {
        if (!Array.isArray(arr)) {
            arr = [arr];
        }

        return arr.map(function(key) {
            return get_path_str(key.indexOf('!') === 0 ? //解决如果是 ("!xl.txt", "src/txt/") 的问题
                    ('!'+ path + key.substr(1)) : 
                    path + key);
        });
    }




    /**
     * 创建路由
     */
    function create_rules() {
        var rules,
            rewrite = config.rewrite;


        if("string" === typeof(rewrite)){
            /*if (rewrite === 'src' || rewrite === 'src->src' || rewrite === 'build->build' || rewrite === 'dist->dist') {//默认监听src

            } else */if (rewrite === 'build' || rewrite === 'build->src') {//把编译指向源
                rules = [{
                    from: '^/'+ config.build_path +'(.*)$',
                    to: '/'+ config.src_path +'$1'
                }]
            } else if (rewrite === 'dist' || rewrite === 'dist->src') {//把线上指向源
                rules = [{
                    from: '^/'+ config.dist_path +'(.*)$',
                    to: '/'+ config.src_path +'$1'
                }]
            } else if (rewrite === 'dist->build') {//把线上指向编译
                rules = [{
                    from: '^/'+ config.dist_path +'(.*)$',
                    to: '/'+ config.build_path +'$1'
                }]
            } else if(rewrite === 'src->build'){
                rules = [{
                    from: '^/'+ config.src_path +'(.*)$',
                    to: '/'+ config.build_path +'$1'
                }]
            } else if(rewrite === 'src->dist'){
                rules = [{
                    from: '^/'+ config.src_path +'(.*)$',
                    to: '/'+ config.dist_path +'$1'
                }]
            } else if(rewrite === 'build->dist'){
                rules = [{
                    from: '^/'+ config.build_path +'(.*)$',
                    to: '/'+ config.dist_path +'$1'
                }]
            }
        } else if(Array.isArray(rewrite)){
            rules = rewrite;
        } else if("object" === typeof(rewrite)){
            rules = [ rewrite ];
        }

        if(rules){
            console.log("启动重写: "+ config.hostname + ":"+ config.port);
            grunt.config.set('connect.rules', rules);
            rules = null;
        }
    }




    /**
     * 检查配置里是否存在 自己要找的方法
     * @param  {string} type    要查找的类型, 有css,js,img
     * @param  {string} objName 应该名, 有home
     * @param  {string} fnName  方法如
     * @return {boolean}         是否存在该方法
     */
    function check_app(type, objName, fnName){
        var app = App;
        if(!app[objName]){
            return !log("没有找到项目 : "+ objName);
        }

        if(!app[objName][type]){
            return !log("项目 '"+ objName +"'里没有配置"+ type);
        }

        if (!app[objName][type][fnName]) {
            return !log("项目 '"+ objName +"'中 '"+ type +"' 里没有配置"+ fnName);
        }
        return true;
    }

}