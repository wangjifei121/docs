# 智汇核v1.9.0详细部署文档
### 一、准备工作
- 服务器要求

```
服务器指标    			要求
系统				Centos7系统版本以上
系统磁盘				至少500G
系统内存				至少40G
系统CPU			   至少20C
系统指令集			需支持AVX
```
- 数据准备

```
版本镜像包在物理机 10.0.3.24:22 
 root/root123  /mnt/mfs/version_management/nlp_1.9.1 目录下

镜像文件images - /stable/images/
	baseimage_mysq_generic.v5.7.tar.gz	Mysql镜像(服务自启)
	baseimage_redis_generic.v2.8.13.tar.gz	Redis镜像(服务自启)
	baseimage_elk_generic.v6.5.4.tar.gz	ELK镜像(服务自启)
	baseimage_bert_generic.v1.9.6.tar.gz 	Bert镜像(服务自启)
	baseimage.cwtap.v1.8.1.tar.gz	智汇核应用镜像
预置文件	
	mnt.mfs.1.8.1.tar.gz	mfs预置文件
数据库初始化文件，cenlp和cwtap库初始化sql
	cenlp.sql
	v1.8.1.cwtap.sql	
Docker安装包	
	docker_repo.zip
docker rancher编排文件	
	compose.zip
		- docker-compose.yml
		- rancher-compose.yml

```
- 更改宿主机名

```
 # 设置主机名
[root@localhost ~]# hostnamectl set-hostname rancher-server
[root@localhost ~]#

# 重新进入终端后显示
[root@rancher-server ~]#

```
- 关闭防火墙

```
# 永久关闭防火墙
[root@rancher-server ~]# systemctl stop firewalld  && systemctl disable firewalld  && systemctl status firewalld
● firewalld.service - firewalld - dynamic firewall daemon
   Loaded: loaded (/usr/lib/systemd/system/firewalld.service; disabled; vendor preset: enabled)
   Active: inactive (dead)
     Docs: man:firewalld(1)
[root@rancher-server ~]# 

```
- 关闭selinux

```
# 永久关闭selinux
[root@rancher-server ~]# 
[root@rancher-server ~]# setenforce 0  || sed -i 's/enforcing/disabled/g' /etc/selinux/config  && sed -i 's/permissive/disabled/g' /etc/selinux/config  && getenforce
setenforce: SELinux is disabled
Disabled
[root@rancher-server ~]#
```
### 二、Docker安装
- 安装包准备

```
# 将docker安装包/mnt/mfs/version_management/nlp_1.8.1/stable/docker_repo.zip放到/home/下
- 放到/home/目录下的原因是：docker_repo.zip中的docker源文件docker-ce-local.repo中的源文件路径为/home/docker/

- docker-ce-local.repo文件内容如下：
	[docker]
	name=docker_local
	baseurl=file:///home/docker/
	gpgcheck=0
	enabled=1
```
```
# 执行命令
# 切换目录
[root@rancher-server ~]# cd /home/
# 解压
[root@rancher-server home]# unzip docker_repo.zip
# 检查
[root@rancher-server home]# ll
总用量 143092
-rw-r--r-- 1 root root   255648 11月 12 2018 audit-2.8.4-4.el7.x86_64.rpm
-rw-r--r-- 1 root root   102448 11月 12 2018 audit-libs-2.8.4-4.el7.x86_64.rpm
-rw-r--r-- 1 root root    78216 11月 12 2018 audit-libs-python-2.8.4-4.el7.x86_64.rpm
-rw-r--r-- 1 root root   302068 11月 12 2018 checkpolicy-2.5-8.el7.x86_64.rpm
-rw-r--r-- 1 root root 23157088 11月  8 2018 containerd.io-1.2.0-3.el7.x86_64.rpm
-rw-r--r-- 1 root root    38436 12月  1 2018 container-selinux-2.74-1.el7.noarch.rpm
-rw-r--r-- 1 root root    95840 8月  10 2017 createrepo-0.9.9-28.el7.noarch.rpm
-rw-r--r-- 1 root root    83984 7月   4 2014 deltarpm-3.6-3.el7.x86_64.rpm
-rw-r--r-- 1 root root   299288 11月 21 2018 device-mapper-1.02.149-10.el7_6.2.x86_64.rpm
-rw-r--r-- 1 root root   192328 11月 21 2018 device-mapper-event-1.02.149-10.el7_6.2.x86_64.rpm
-rw-r--r-- 1 root root   191868 11月 21 2018 device-mapper-event-libs-1.02.149-10.el7_6.2.x86_64.rpm
-rw-r--r-- 1 root root   327236 11月 21 2018 device-mapper-libs-1.02.149-10.el7_6.2.x86_64.rpm
-rw-r--r-- 1 root root   414576 4月  25 2018 device-mapper-persistent-data-0.7.3-3.el7.x86_64.rpm
-rw-r--r-- 1 root root 19603880 11月  8 2018 docker-ce-18.09.0-3.el7.x86_64.rpm
-rw-r--r-- 1 root root 72149679 8月  12 11:18 docker-ce-18-local.tar.gz
-rw-r--r-- 1 root root 14676972 11月  8 2018 docker-ce-cli-18.09.0-3.el7.x86_64.rpm
-rw-r--r-- 1 root root     1627 10月 25 2018 gpg
-rw-r--r-- 1 root root    67652 11月 12 2018 libcgroup-0.41-20.el7.x86_64.rpm
-rw-r--r-- 1 root root    56988 8月  11 2017 libseccomp-2.3.1-3.el7.x86_64.rpm
-rw-r--r-- 1 root root   165932 11月 12 2018 libselinux-2.5-14.1.el7.x86_64.rpm
-rw-r--r-- 1 root root   241132 11月 12 2018 libselinux-python-2.5-14.1.el7.x86_64.rpm
-rw-r--r-- 1 root root   155092 11月 12 2018 libselinux-utils-2.5-14.1.el7.x86_64.rpm
-rw-r--r-- 1 root root   154244 11月 12 2018 libsemanage-2.5-14.el7.x86_64.rpm
-rw-r--r-- 1 root root   115284 11月 12 2018 libsemanage-python-2.5-14.el7.x86_64.rpm
-rw-r--r-- 1 root root   304196 11月 12 2018 libsepol-2.5-10.el7.x86_64.rpm
-rw-r--r-- 1 root root   252528 6月  24 2016 libxml2-python-2.9.1-6.el7_2.3.x86_64.rpm
-rw-r--r-- 1 root root  1366568 11月 21 2018 lvm2-2.02.180-10.el7_6.2.x86_64.rpm
-rw-r--r-- 1 root root  1125716 11月 21 2018 lvm2-libs-2.02.180-10.el7_6.2.x86_64.rpm
-rw-r--r-- 1 root root   937868 11月 12 2018 policycoreutils-2.5-29.el7.x86_64.rpm
-rw-r--r-- 1 root root   466616 11月 12 2018 policycoreutils-python-2.5-29.el7.x86_64.rpm
-rw-r--r-- 1 root root   232224 7月  23 2015 python-chardet-2.2.1-1.el7_1.noarch.rpm
-rw-r--r-- 1 root root    32084 7月   4 2014 python-deltarpm-3.6-3.el7.x86_64.rpm
-rw-r--r-- 1 root root    32880 7月   4 2014 python-IPy-0.75-6.el7.noarch.rpm
-rw-r--r-- 1 root root   273012 7月   4 2014 python-kitchen-1.1.1-5.el7.noarch.rpm
drwxr-xr-x 2 root root     4096 1月   4 2019 repodata
-rw-r--r-- 1 root root   494472 11月 29 2018 selinux-policy-3.13.1-229.el7_6.6.noarch.rpm
-rw-r--r-- 1 root root  7245312 11月 29 2018 selinux-policy-targeted-3.13.1-229.el7_6.6.noarch.rpm
-rw-r--r-- 1 root root   635184 11月 12 2018 setools-libs-3.3.8-4.el7.x86_64.rpm
-rw-r--r-- 1 root root   124108 11月 12 2018 yum-utils-1.1.31-50.el7.noarch.rpm

# 移动源文件到指定目录
[root@rancher-server home] cd /home/docker/
[root@rancher-server docker] mv docker-ce-local.repo /etc/yum.repos.d/
# 清缓存
[root@rancher-server docker] yum clean all
    已加载插件：fastestmirror
    正在清理软件源： docker
    Cleaning up list of fastest mirrors
    Other repos take up 82 M of disk space (use --verbose for details)
# 加载repo
[root@rancher-server docker] yum repolist
    已加载插件：fastestmirror
    Determining fastest mirrors
    docker                       | 2.9 kB  00:00:00     
    docker/primary_db            |  59 kB  00:00:00     
    源标识                       源名称             状态
    docker                       docker_local               36
    repolist: 36
# 检查
[root@rancher-server docker] yum list | grep docker-ce
    docker-ce.x86_64                      3:18.09.0-3.el7                  @docker  
    docker-ce-cli.x86_64                  1:18.09.0-3.el7                  @docker 
```
- 安装docker

```
# 安装命令
[root@rancher-server ~]# yum -y install docker-ce
[...]
已安装:
  docker-ce.x86_64 3:18.09.0-3.el7                                                                                                                                                                                                    

作为依赖被安装:
  audit-libs-python.x86_64 0:2.8.4-4.el7  checkpolicy.x86_64 0:2.5-8.el7       container-selinux.noarch 2:2.74-1.el7       containerd.io.x86_64 0:1.2.0-3.el7  docker-ce-cli.x86_64 1:18.09.0-3.el7  libcgroup.x86_64 0:0.41-20.el7 
  libsemanage-python.x86_64 0:2.5-14.el7  policycoreutils.x86_64 0:2.5-29.el7  policycoreutils-python.x86_64 0:2.5-29.el7  python-IPy.noarch 0:0.75-6.el7      setools-libs.x86_64 0:3.3.8-4.el7    

完毕！
# 启动docker
[root@rancher-server ~]# systemctl start docker
# 检查docker
[root@rancher-server ~]# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
# 检查docker * 2
[root@rancher-server ~]# systemctl status docker
● docker.service - Docker Application Container Engine
   Loaded: loaded (/usr/lib/systemd/system/docker.service; disabled; vendor preset: disabled)
   Active: active (running) since 一 2019-08-12 16:22:20 CST; 21min ago
     Docs: https://docs.docker.com
 Main PID: 28345 (dockerd)
    Tasks: 99
   Memory: 22.3G
   CGroup: /system.slice/docker.service
           ├─28345 /usr/bin/dockerd -H unix://
           └─28372 containerd --config /var/run/docker/containerd/containerd.toml --log-level info

8月 12 16:22:20 zhijian-analysis-2 dockerd[28345]: time="2019-08-12T16:22:20.270041455+08:00" level=info msg="pickfirstBalancer: HandleSubConnStateChange: 0xc4208021e0, READY" module=grpc
8月 12 16:22:20 zhijian-analysis-2 dockerd[28345]: time="2019-08-12T16:22:20.312675426+08:00" level=info msg="Graph migration to content-addressability took 0.00 seconds"
8月 12 16:22:20 zhijian-analysis-2 dockerd[28345]: time="2019-08-12T16:22:20.317205723+08:00" level=info msg="Loading containers: start."
8月 12 16:22:20 zhijian-analysis-2 dockerd[28345]: time="2019-08-12T16:22:20.464684428+08:00" level=info msg="Default bridge (docker0) is assigned with an IP address 172.17.0.0/16. Daemon option --bip can be use...red IP address"
8月 12 16:22:20 zhijian-analysis-2 dockerd[28345]: time="2019-08-12T16:22:20.508263908+08:00" level=info msg="Loading containers: done."
8月 12 16:22:20 zhijian-analysis-2 dockerd[28345]: time="2019-08-12T16:22:20.556957414+08:00" level=info msg="Docker daemon" commit=4d60db4 graphdriver(s)=overlay2 version=18.09.0
8月 12 16:22:20 zhijian-analysis-2 dockerd[28345]: time="2019-08-12T16:22:20.557076857+08:00" level=info msg="Daemon has completed initialization"
8月 12 16:22:20 zhijian-analysis-2 dockerd[28345]: time="2019-08-12T16:22:20.567794860+08:00" level=warning msg="Could not register builder git source: failed to find git binary: exec: \"git\": executable file not found in $PATH"
8月 12 16:22:20 zhijian-analysis-2 dockerd[28345]: time="2019-08-12T16:22:20.575961387+08:00" level=info msg="API listen on /var/run/docker.sock"
8月 12 16:22:20 zhijian-analysis-2 systemd[1]: Started Docker Application Container Engine.
Hint: Some lines were ellipsized, use -l to show in full.	
```
- 加载镜像

```
将镜像包放到任意文件夹下：本文档示例放到 /mnt/images/下
# 切换目录
[root@rancher-server ~]# cd /mnt/images/
# 检查
[root@rancher-server images]# ll
总用量 45704198
-rw------- 1 root root  6655580672 6月  29 18:06 baseimage_bert_generic.v1.9.6.tar.gz
-rw------- 1 root root 36556067840 7月   1 15:42 baseimage_cwtap.v1.9.0.tar.gz
-rw------- 1 root root  2372410368 6月  30 15:09 baseimage_elk_generic.v6.5.4.tar.gz
-rw------- 1 root root   440163328 6月  29 18:08 baseimage_mysq_generic.v5.7.tar.gz
-rw------- 1 root root   776876032 6月  29 18:09 baseimage_redis_generic.v2.8.13.tar.gz
[root@rancher-server images]#
# 将镜像导入到docker中
[root@rancher-server images]# for i in `ls *tar.gz`; do docker load < $i; done
[root@rancher-server images]# for i in `ls *tar.gz`; do docker load < $i; done
[……]
f66ed577df6e: Loading layer [==================================================>]  58.48MB/58.48MB
f25045e2d47d: Loading layer [==================================================>]  338.4kB/338.4kB
0312e0db70e2: Loading layer [==================================================>]  10.44MB/10.44MB
[……]
[root@rancher-server images]#
# 查看导入的镜像
[root@rancher-server images]# docker images
baseimage/cwtap                 1.9.0               9056d0284683        6 weeks ago         36.4GB
baseimage/bert_generic          1.9.6               f0f18a9ad939        7 months ago        6.61GB
baseimage/redis_generic         2.8.13              aea5b86916b6        7 months ago        758MB
baseimage/elk_generic           6.5.4               e00927ff4bd6        9 months ago        2.78GB
baseimage/mysql                 5.7                 d675b4039743        16 months ago       435MB
```
### 三、rancher管理
- 创建rancher
- rancher界面设置
- 创建rancher镜像

```
# 检查镜像
[root@rancher-server ~]#  docker ps
CONTAINER ID        IMAGE                             COMMAND                  CREATED             STATUS              PORTS                              NAMES

# 运行rancher镜像，物理机上执行下面命令即可
[root@rancher-server ~]#  docker run -d --restart=unless-stopped -p 6060:8080 rancher/server:stable
# 再次检查
[root@rancher-server ~]#  docker ps
CONTAINER ID        IMAGE                             COMMAND                  CREATED             STATUS              PORTS                              NAMES
f33a4318573b        rancher/net:v0.13.17              "/rancher-entrypoint…"   2 months ago        Up 2 months                                            r-ipsec-ipsec-router-1-db440cc3
14d3a4480555        rancher/net:v0.13.17              "/rancher-entrypoint…"   2 months ago        Up 2 months                                            r-ipsec-ipsec-connectivity-check-1-82ce6112
1e1bd1f5d562        rancher/dns:v0.17.4               "/rancher-entrypoint…"   2 months ago        Up 2 months                                            r-network-services-metadata-dns-1-975a7c00
748bab0dd6d4        rancher/net:holder                "/.r/r /rancher-entr…"   2 months ago        Up 2 months                                            r-ipsec-ipsec-1-9f647ff6
1054d9cf7130        rancher/metadata:v0.10.4          "/rancher-entrypoint…"   2 months ago        Up 2 months                                            r-network-services-metadata-1-7282873b
d8d210a74625        rancher/network-manager:v0.7.22   "/rancher-entrypoint…"   2 months ago        Up 2 months                                            r-network-services-network-manager-1-12976799
e3108209c63b        rancher/net:v0.13.17              "/rancher-entrypoint…"   2 months ago        Up 2 months                                            r-ipsec-cni-driver-1-1b8e2193
2d0ed162ff67        rancher/server:stable             "/usr/bin/entry /usr…"   2 months ago        Up 2 months         3306/tcp, 0.0.0.0:6060->8080/tcp   eager_mirzakhani
[root@rancher-server ~]#

```
- rancher 界面设置  http://ip:6060

> - 设置访问控制
![屏幕快照 20210702 上午11.39.48.png](1)
> - 注销重新登录
![屏幕快照 20210702 上午11.40.51.png](2)
> - 添加主机（首次添加，当前站点地址自动识别）
![屏幕快照 20210702 上午11.41.00.png](4)
![屏幕快照 20210702 上午11.43.45.png](5)
> - 物理界中添加执行命令
![屏幕快照 20210702 上午11.45.40.png](8)
> - 查看主机是否添加成功
![屏幕快照 20210702 上午11.46.28.png](9)
> - 添加CWTAP项目应用
![屏幕快照 20210702 上午11.49.17.png](11)
![屏幕快照 20210702 上午11.49.47.png](12)
- 添加服务
```
##第一种：手动添加各类服务
在rancher应用界面点击添加服务按钮，依次创建以下服务
    - mysql
	- 名称：mysql
	- 描述：xxx
	- 选择镜像：baseimage/mysql_generic:5.7  (去掉创建前总是拉取镜像)
	- 端口映射：13306 -> 3306
	- 命令
		环境变量：  MYSQL_ROOT_PASSWORD = root123
	- 网络
		- 网络： 托管
		- 主机名：设置主机名  mysql
	- 安全/主机
		- 特权：主机安全访问特权(勾上)
						
					
    - redis
	- 名称：redis
	- 描述：xxx
	- 选择镜像：baseimage/redis_generic:2.8.13  (去掉创建前总是拉取镜像)
	- 端口映射：16379 -> 6379
	- 命令 
		- 命令：/usr/sbin/init
	- 网络
		- 网络： 托管
		- 主机名：设置主机名  redis
	安全/主机
		- 特权：主机安全访问特权(勾上)

    - es
	- 名称：es
	- 描述：xxx
	- 选择镜像：baseimage/elk_generic:6.5.4  (去掉创建前总是拉取镜像)
	- 端口映射：19200 -> 9200   15601 -> 5601
	- 命令 
		- 命令：/usr/sbin/init
	- 网络
		- 网络： 托管
		- 主机名：设置主机名  es
	安全/主机
		- 特权：主机安全访问特权(勾上)

    - bert
	- 名称：bert
	- 描述：xxx
	- 选择镜像：baseimage/bert_generic:1.9.6  (去掉创建前总是拉取镜像)
	- 端口映射：15555 -> 5555   15556 -> 5556
	- 命令 
		- 命令：/usr/sbin/init
	- 网络
		- 网络： 托管
		- 主机名：设置主机名  bert
	安全/主机
		- 特权：主机安全访问特权(勾上)

    - master
	- 名称：master
	- 描述：xxx
	- 选择镜像：baseimage/cwtap:1.9.0  (去掉创建前总是拉取镜像)
	- 端口映射：18088 -> 8088   18000 -> 8000  10022 -> 22  18888 -> 8888(预留端口)
	- 命令 
		- 命令：/usr/sbin/init
	- 卷
		- 卷：添加卷 - 物理机目录:container目录
			eg:/mnt/mfs:/mnt/mfs
	- 网络
		- 网络： 托管
		- 主机名：设置主机名  master
	安全/主机
		- 特权：主机安全访问特权(勾上)

```
```
## 第二种：docker-compose添加
首先先将docker-compose.yml和rancher-compose.yml两个yml文件的内容做对应修改
**修改点主要是image的名称和版本号要和相应的images对应上**
docker-compose.yml文件示例：

version: '2'
services:
  mysql:
    image: baseimage/mysql_generic:5.7
    hostname: mysql
    environment:
      MYSQL_ROOT_PASSWORD: root123
    stdin_open: true
    volumes:
    - /mnt/mfs:/mnt/mfs
    tty: true
    ports:
    - 23306:3306/tcp
  bert:
    privileged: true
    image: baseimage/bert_generic:1.9.6
    hostname: bert
    stdin_open: true
    tty: true
    ports:
    - 25555:5555/tcp
    - 25556:5556/tcp
  es:
    privileged: true
    image: baseimage/elk_generic:6.5.4
    hostname: es
    stdin_open: true
    volumes:
    - /mnt/mfs:/mnt/mfs
    tty: true
    ports:
    - 29200:9200/tcp
    - 25601:5601/tcp
    command:
    - /usr/sbin/init
  redis:
    privileged: true
    image: baseimage/redis_generic:2.8.13
    hostname: redis
    stdin_open: true
    volumes:
    - /mnt/mfs:/mnt/mfs
    tty: true
    ports:
    - 26379:6379/tcp
    command:
    - /usr/sbin/init
  master:
    privileged: true
    image: baseimage/cwtap:1.8.1
    hostname: master
    stdin_open: true
    volumes:
    - /mnt/mfs:/mnt/mfs
    tty: true
    ports:
    - 20022:22/tcp
    - 28088:8088/tcp
    - 28000:8000/tcp
    - 28888:8888/tcp
    command:
    - /usr/sbin/init

rancher-compose.yml文件示例：

version: '2'
services:
  mysql:
    scale: 1
    start_on_create: true
  bert:
    scale: 1
    start_on_create: true
  es:
    scale: 1
    start_on_create: true
  redis:
    scale: 1
    start_on_create: true
  master:
    scale: 1
    start_on_create: true
	
```
### 四、启动服务
- mysql服务
```
# 自启动 检查方式
    - 客户端连接测试是否启动成功
    - telnet ip port 测试
# 创建cwtap、cenlp两个库
    - CREATE DATABASE `cwtap` CHARACTER SET utf8 COLLATE utf8_general_ci;
    - CREATE DATABASE `cenlp` CHARACTER SET utf8 COLLATE utf8_general_ci;
```
- es服务 
```
# es镜像现有维护自启动和非自启动两个版本
# 版本判断
    - 在es容器/etc/目录下存在supervisord.conf的版本为自启版本，否则为非自启版本
# 检查服务启动情况
    浏览器检查
        - http://ip:port/
        - http://ip:port/app/kibana
    命令行检查
	- curl 'htttp://127.0.0.1:9200' # 内网测试
	- curl 'http://ip:*9200' # 外网测试
	- netstat -plant | grep 5601 # 查看kibana进程
	- curl 'http://127.0.0.1:5601/app/kibana' # 内网测试
	- curl 'http://10.0.3.19:45601/app/kibana'  # 外网测试
# 自启动版本supervisord基本操作命令
    supervisord -c /etc/supervisord.conf此时默认开启了所有服务
    supervisorctl status 查看进程运行状态
    supervisorctl start 进程名 启动进程
    supervisorctl stop 进程名 关闭进程
    supervisorctl restart 进程名 重启进程
    supervisorctl update 重新载入配置文件
    supervisorctl shutdown 关闭supervisord
    supervisorctl clear 进程名 清空进程日志
    supervisorctl 进入到交互模式下。使用help查看所有命令。
    start stop restart + all 表示启动，关闭，重启所有进程。

    关闭服务：
    supervisorctl stop all先关闭supervisor服务
    之后再关闭supervisord服务 kill -9 pid    
# 手动启动版本启动命令
    **手动启动es时需要先切换用户 su - elsearch**
    启动elasticsearch
        cd /usr/local/elasticsearch-6.5.4/bin
        ./elasticsearch -d
        ps -ef|grep elasticsearch
    启动kinaba
        cd /usr/local/kibana-6.5.4-linux-x86_64/bin
        nohup ./kibana &
        lsof -i:5601

```
- bert服务
```
# 服务为自启动
 # bert启动方式：
      进入bert容器 
      cd /opt/bert/sbin 
      nohup sh sstart.sh &
# 检查bert服务启动情况
      telnet ip port
```
- redis服务
```
# 服务为自启动
# redis启动方式：
    cd /usr/local/redis/bin
    nohup ./redis-server &
```
- master服务
```
- cd /opt/CWTAP
- 修改配置 
    - 先检查sbin/init_ip.sh脚本配置情况，做ip:port的对应修改(详见下面👇)
    - sh sbin/init_ip.sh 
- 检查配置修改情况 
    cwtap/settings.py
    webroot/WEB-INF/classes/common.properties
- 初始化数据库
    - sh sbin/cwtap.sh init mysql 
- 加载fixtures文件数据
     - sh sbin/cwtap.sh init fixtures
- 构建es索引
    - sh sbin/cwtap.sh init es 
- 启动nginx
    - cd /usr/local/nginx
    - sbin/nginx
- 启动java服务
    - sh sbin/cwtap.sh start tomcat
- 启动Django项目
    - sh sbin/cwtap.sh start python
- 启动websocket服务
    - sh sbin/cwtap.sh start daphne
- 启动celery服务
    - sh sbin/cwtap.sh start celery
- 启动logstas
    - cd /opt/
    - cp -r /opt/logstash /opt/logstash2
    # 启动logstash监控分析任务调用日志文件
    - cd /opt/logstash 
    - nohup ./logstash-5.5.1/bin/logstash -f input_output_test.conf &
    # 启动logstash监控对话命中知识、子场景、闲聊的日志文件
    - cd /opt/logstash2/
    - nohup ./logstash-5.5.1/bin/logstash -f hot-degree.conf &
    # 检查是否启动了两个logstash
    - ps -ef|grep logstash
```
- 附
- 启动master时init_ip.sh脚本
- ![图片 1.png](16)
