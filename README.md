# 学习吧

> 这是一个练习项目




## 说明

* 由于项目使用原生`grunt`模式, 任务(`task`)代码较大, 使用`app.json`配置方式, 完成一切操作, 只需配置一次, 全局使用
* 项目基于`grunt`部署
* `js`使用`jquery`+`seajs`模式
* 使用`git`同步
* 自动`sprite`处理
* `js`必须通过`jsHint`检查
* 样式基于`aliceui`
* `js`勾子为 `J-*'
* 常用状态有：`hover`, `current`, `selected`, `disabled`, `focus`, `blur`, `checked`, `success`, `error`, `loading` 等, 不能以这些名称直接命名



## 目录说明 

* `src`为源代码
* `dist`为正式代码
* `html`为静态文件



## git说明

* `master`为线上正式代码分支
* `develop`为开发分支

## demo

* 安装`nodejs` [下载](http://www.nodejs.org/)

* 安装 [grunt](http://www.gruntjs.com/)
    * `$ npm install -g grunt-cli`

* 创建目录
    * `$ mkdir demo & cd demo`

* 克隆项目
    * `$ git clone https://github.com/xuexb/grunt-app.git ./`

* 安装依赖模块
    * `$ npm install`

* 运行
    * `$ grunt server`

## grunt 命令

* 开启`http`服务
    * `$ grunt server`
    * 根据`package.json`里的`rules`配置进行重写, 方便调试

* 监听`css`样式并动态合并
    * 在某场景下是会对不同的样式进行`concat`合并的, 而`FEer`只需要维护源模块, 该命令会监听需要合并的, 
    发现改动则合并样式文件并覆盖, 需要配置`package.json`
    * `$ grunt watch-css:配置名称`

* 监听`js`文件并动态合并
    * 由于使用的`seajs`模块加载器加载`js`文件, so合并的时候不用合并`cmd`模块文件, 但发布的时候会合并, 
    需要配置`package.json`
    * `$ grunt watch-js:配置名称`

* 初始化样式

* 初始化`js`

* 检查代码
    * `$ grunt jsHint:配置名称`

* 发布样式

* 发布`js`

* 复制命令

* 合成任务



## 开发者

* [谢亮](http://www.xuexb.com/)



## Todo

work

