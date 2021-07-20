## Linux 上安装 Node.js
```
@author wangjifei@cewell.com.cn
@date 2021-07-14
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
