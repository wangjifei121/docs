### 智汇核之CWTAP镜像构建指南

#### 基础python/java服务镜像构建流程
```
基础python/java服务镜像是在centos7.4:latest基础镜像之上构建的包括python-3.6.6、jdk-1.8.0、tomcat7、virtualenv-16.0.0，给智汇核CWTAP镜像提供的基础镜像，此基础镜像一旦构建，一般不会在改变
```
- 基于Dockerfile的镜像构建资源位置：10.0.3.24:/mnt/mfs/version_management/nlp_2.0.0/dockerfiles/baseimage
```
[root@rancher-server baseimage]# 
[root@rancher-server baseimage]# ll /mnt/mfs/version_management/nlp_2.0.0/dockerfiles/baseimage
总用量 603920
-rw-r--r-- 1 root root      1650 1月  14 13:40 Dockerfile
-rw-r--r-- 1 root root 366899200 1月  14 11:30 jdk-8u102-linux-x64.tar
-rw-r--r-- 1 root root  22930752 1月  14 11:31 Python-3.6.6.tar
-rw-r--r-- 1 root root 226611200 1月  14 11:47 tomcat7.tar
-rw-r--r-- 1 root root   1970558 1月  14 11:30 virtualenv-16.0.0.tar
[root@rancher-server baseimage]# 
```
- 基础python/java服务镜像的Dockerfile内容如下
```
#! /bin/bash

# 这是一个python和tomcat的基础镜像
# python-3.6.6 jdk-8u102-linux-x64.gz virtualenv-16.0.0.tar


# 镜像由来
FROM centos7.4:latest
MAINTAINER by wangjifei wangjifei@cewell.com.cn

# 指定系统字符
ENV LC_ALL zh_CN.UTF-8

# 指定时区
ENV TZ=Asia/Shanghai

# 添加依赖包
# ADD Python-3.6.6.tar /opt
# ADD virtualenv-16.0.0.tar /opt
# ADD jdk-8u102-linux-x64.tar /opt
# ADD tomcat7.tar /opt
ADD *.tar /opt/

# 安装依赖 # 配置ssh # 配置系统字符 # python编译安装 # 编译安装python的虚拟环境 
RUN yum -y install gcc passwd openssl openssh-server openssh-clients kde-l10n-Chinese glibc-common telnet \
   reinstall glibc-common vim wget ntp net-tools libaio numactl zlib-devel bzip2-devel openssl-devel \
   ncurses-devel sqlite-devel readline-devel tk-devel gdbm-devel db4-devel libpcap-devel xz-devel \
   && ssh-keygen -A && echo "root:root123" |chpasswd \
   && localedef -c -f UTF-8 -i zh_CN zh_CN.utf8 && chmod 755 /run.sh \
   && mkdir -p /usr/local/python3 && cd /opt/Python-3.6.6 && ./configure --prefix=/usr/local/python3 && make && make install \
   && mkdir -p ~/.venvs/cwtap && cd /opt/virtualenv-16.0.0 && python setup.py install && virtualenv -p /usr/local/python3/bin/python3 ~/.venvs/cwtap/

# make some useful symlinks that are expected to exist
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
   && ln -s /usr/local/python3/bin/python3 /usr/bin/python3 \
   && ln -s /usr/local/python3/bin/pip3 /usr/bin/pip3 \
   && ln -s /opt/jdk1.8.0_102/bin/java /usr/bin/java \

```
- 在 `/mnt/mfs/version_management/nlp_2.0.0/dockerfiles/baseimage` 目录下 执行docker命令 `docker build -t baseimage:2.0 .` 构建基础python/java服务镜像
```
[root@rancher-server baseimage]# 
[root@rancher-server baseimage]# docker build -t baseimage:2.0 .
Sending build context to Docker daemon  618.4MB
[WARNING]: Empty continuation line found in:
    RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone    && ln -s /usr/local/python3/bin/python3 /usr/bin/python3    && ln -s /usr/local/python3/bin/pip3 /usr/bin/pip3    && ln -s /opt/jdk1.8.0_102/bin/java /usr/bin/java 
[WARNING]: Empty continuation lines will become errors in a future release.
Step 1/7 : FROM centos7.4:latest
 ---> 451329265b4f
Step 2/7 : MAINTAINER by wangjifei wangjifei@cewell.com.cn
 ---> Using cache
 ---> 71c6f6f96c04
Step 3/7 : ENV LC_ALL zh_CN.UTF-8
 ---> Using cache
 ---> 809fd3907b84
Step 4/7 : ENV TZ=Asia/Shanghai
 ---> Using cache
 ---> c177f4f15b28
Step 5/7 : ADD *.tar /opt/
 ---> Using cache
 ---> 5bbb9319523c
Step 6/7 : RUN yum -y install gcc passwd openssl openssh-server openssh-clients kde-l10n-Chinese glibc-common telnet    reinstall glibc-common vim wget ntp net-tools libaio numactl zlib-devel bzip2-devel openssl-devel    ncurses-devel sqlite-devel readline-devel tk-devel gdbm-devel db4-devel libpcap-devel xz-devel    && ssh-keygen -A && echo "root:root123" |chpasswd    && localedef -c -f UTF-8 -i zh_CN zh_CN.utf8 && chmod 755 /run.sh    && mkdir -p /usr/local/python3 && cd /opt/Python-3.6.6 && ./configure --prefix=/usr/local/python3 && make && make install    && mkdir -p ~/.venvs/cwtap && cd /opt/virtualenv-16.0.0 && python setup.py install && virtualenv -p /usr/local/python3/bin/python3 ~/.venvs/cwtap/
 ---> Using cache
 ---> 1d965fb7d087
Step 7/7 : RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone    && ln -s /usr/local/python3/bin/python3 /usr/bin/python3    && ln -s /usr/local/python3/bin/pip3 /usr/bin/pip3    && ln -s /opt/jdk1.8.0_102/bin/java /usr/bin/java
 ---> Using cache
 ---> 0a13230215a3
Successfully built 0a13230215a3
Successfully tagged baseimage:2.0
[root@rancher-server baseimage]# 
```
- 构建完成 `docker images |grep baseimage` 查看已经构建好的镜像
```
[root@rancher-server baseimage]# 
[root@rancher-server baseimage]# docker images |grep baseimage
baseimage                       2.0                 0a13230215a3        9 hours ago         1.84GB
[......]
[root@rancher-server baseimage]# 

```

#### 构建CWTAP项目镜像
```
CWTAP项目镜像的构建是在基础python/java服务镜像之上构建的，修改了代码或迭代了新版本后需要修改CWTAP对应依赖数据后从新构建新镜像
```
- 基于Dockerfile的镜像构建资源位置：10.0.3.24:/mnt/mfs/version_management/nlp_2.0.0/dockerfiles/master
```
[root@rancher-server master]# 
[root@rancher-server master]# ll /mnt/mfs/version_management/nlp_2.0.0/dockerfiles/master
总用量 10828513
-rw-r--r-- 1 root root  376586240 1月  14 22:42 CWTAP.20220114.tar
-rw-r--r-- 1 root root       1473 1月  14 16:08 Dockerfile
-rw-r--r-- 1 root root 1188997120 1月  13 09:58 hanlp_datas.tar
-rw-r--r-- 1 root root 4481781760 1月  12 12:52 hanlp_model.tar
-rw-r--r-- 1 root root  300428800 1月  11 18:13 logstash-6.5.4.tar
-rw-r--r-- 1 root root    6381568 1月  11 18:13 nginx-1.14.0.tar
-rw-r--r-- 1 root root 2903060480 1月  14 20:35 nlp_packages.tar
-rw-r--r-- 1 root root  156487680 1月  11 18:13 node-v12.19.0-linux-x64.tar
-rw-r--r-- 1 root root 1674670080 1月  14 14:50 python_hanlp_data.tar
-rwxr-xr-x 1 root root       1313 1月  14 22:31 start.sh
[root@rancher-server master]# 
```
- CWTAP项目镜像的Dockerfile内容如下
```
#! /bin/bash

# cwtap项目镜像

# 镜像由来
FROM baseimage:2.0
MAINTAINER by wangjifei wangjifei@cewell.com.cn

# 添加依赖包
# ADD logstash-6.5.4.tar /opt
# ADD nginx-1.14.0.tar /opt
# ADD node-v12.19.0-linux-x64.tar /opt
# ADD CWTAP.20220114.tar /opt
# ADD nlp_packages.tar /opt
# ADD python_hanlp_data.tar /opt
# ADD hanlp_datas.tar /opt
# ADD hanlp_model.tar.tar /opt
COPY start.sh /opt
ADD *.tar /opt/

# 编译安装nginx # pip install packages # 更新python hanlp依赖包 
RUN mkdir -p /usr/local/nginx && cd /opt/nginx-1.14.0 && ./configure --prefix=/usr/local/nginx && make && make install \
	&& yum install -y gcc gcc-c++ libffi-devel python-devel openssl-devel && source ~/.venvs/cwtap/bin/activate && \
	pip install setuptools==57.5.0 --no-index -f /opt/nlp_packages/ && pip install -r /opt/CWTAP/requirements.txt --no-index -f /opt/nlp_packages/ && \
	pip install Keras==2.4.1 --no-index -f /opt/nlp_packages/ &&  pip list | grep -E 'bert4keras|Keras' && rm -rf /opt/nlp_packages \
	&& mv /opt/python_hanlp_data/* ~/.venvs/cwtap/lib/python3.6/site-packages/pyhanlp/static/ && rm -rf /opt/python_hanlp_data \
	&& mv /opt/.hanlp ~/

# make some useful symlinks that are expected to exist
RUN ln -s /usr/local/nginx/sbin/nginx /usr/bin/nginx \
	&& ln -s /opt/node-v12.19.0-linux-x64/bin/npm /usr/bin/npm \
	&& ln -s /opt/node-v12.19.0-linux-x64/bin/node /usr/bin/node \
	&& ln -s /opt/node-v12.19.0-linux-x64/bin/elasticdump /usr/bin/elasticdump 

```
- 在 `/mnt/mfs/version_management/nlp_2.0.0/dockerfiles/master` 目录下 执行docker命令 `docker build -t baseimage/cwtap:2.0 .` 构建CWTAP2.0版本项目镜像
```

```
- 构建完成 `docker images |grep baseimage/cwtap` 查看已经构建好的镜像
```
[root@rancher-server baseimage]# 
[root@rancher-server baseimage]# docker images |grep baseimage/cwtap
baseimage                       2.0                 0a13230215a3        9 hours ago         1.84GB
[......]
[root@rancher-server baseimage]# 

```













