## vue服务本地启动
1. 安装node.js
2. 切换npm镜像 
  `npm install -g cnpm --registry=https://registry.npm.taobao.or`
3. npm全局安装vue 
  `npm install -g @vue/cli`
4. npm项目依赖组件安装 
  `cnpm install`存在项目目录的node_modules文件夹
5. npm编译
  `npm run dev`启动本地vue项目

## vue启动服务问题记录
1. 使用vue框架写pc页面时，我们经常会用到element-ui这个框架。当我们吧把需要的东西都装在好运行项目的时候，有时会出现这样的错误
![image](https://user-images.githubusercontent.com/40445471/151734423-3d4bd51e-2bd7-4f30-a259-6822456bd885.png)

- 这是因为缺少了一个配置文件，postcss.config.js，配置内容如下
注意：这个文件是放在项目的根目录下的 
```
module.exports = {  
    plugins: {  
      'autoprefixer': {browsers: 'last 5 version'}  
    }  
  } 
```
这样配置好以后，再重新启动项目，就没有这方面的问题了
