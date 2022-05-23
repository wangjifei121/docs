```
@author wangjifei@cewell.com.cn
@date 2021-07-14
```

## Linux 上安装 Node.js

```
直接使用已编译好的包
Node 官网已经把 linux 下载版本更改为已编译好的版本了，我们可以直接下载解压后使用：
# cd /usr/local/
# wget https://nodejs.org/dist/v12.19.0/node-v12.19.0-linux-x64.tar.xz    // 下载
# tar xf  node-v12.19.0-linux-x64.tar.xz       // 解压
# cd node-v12.19.0-linux-x64/                  // 进入解压目录
# ./bin/node -v                               // 执行node命令 查看版本
v12.19.0

解压文件的 bin 目录底下包含了 node、npm 等命令，我们可以使用 ln 命令来设置软连接：

ln -s /usr/local/node-v12.19.0-linux-x64/bin/npm   /usr/bin/ 
ln -s /usr/local/node-v12.19.0-linux-x64/bin/node   /usr/bin/
```

## python后台执行js及通过XMLHttpRequest发送请求
- 下载第三方包PyExecJS
```
pip install PyExecJS
```
- 在python执行文件所在的运行目录下，使用npm安装jsdom
```
npm install jsdom
```
- JS文件开头添上下述固定代码
```
//解决TextEncoder is not defined
const textencoding = require('text-encoding');
TextEncoder = textencoding.TextEncoder;
TextDecoder = textencoding.TextDecoder;

//解决浏览器环境问题
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const dom = new JSDOM('<!DOCTYPE html><p>Hello world</p>');
window = dom.window;
document = window.document;
XMLHttpRequest = window.XMLHttpRequest;
```
