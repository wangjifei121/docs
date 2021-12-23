###开启go mod步骤
```
 开启go mod命令：
    go env -w GO111MODULE=on # 开启go mod
    go env -w GOPROXY=https://goproxy.cn,direct //设置使用go mod时需要添加代理
 
 go mod命令：
    download    download modules to local cache
    edit        edit go.mod from tools or scripts
    graph       print module requirement graph
    init        initialize new module in current directory
    tidy        add missing and remove unused modules
    vendor      make vendored copy of dependencies
    verify      verify dependencies have expected content
    why         explain why packages or modules are needed
 常用的命令为：
    go mod init 项目名  # 初始化  会在项目下生成go.mod文件
    go mod tidy  # go mod自动查找当前项目依赖的第三方包并下载，删除无用的包
  
```
