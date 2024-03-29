```
@author wangjifei@cewell.com.cn
@date 2021-07-02
```

**注：NLP服务拆分为master、elk、mysql、bert、redis，以下是master image的创建方式，其他image是通用的，非特殊情况下不需要重新构建**

- 拉取svn最新CWTAP到 /mnt/mfs/version_management/nlp_xxx/dockerfiles/master
- 检查CWTAP配置
   settings.py
   static/jsPages/common.js
   sbin/init.sh
- 将CWTAP、lib等源码包及依赖打包tar.gz
- 编写Dockerfile
  **eg:nlp1.9**
```
      #! /bin/bash

      # 这是一个cwtap的基础镜像
      # 版本为：1.9.0


      # 镜像由来
      FROM baseimage/cwtap:1.8.1
      MAINTAINER by wangjifei@cewell.com.cn

      # 更新项目代码
      RUN rm -rf /opt/CWTAP
      ADD CWTAP.20210701.tar.gz /opt/
      RUN rm -rf /opt/hanlp_datas
      ADD hanlp_datas.20210629.tar.gz /opt/
      RUN rm -rf /root/.venvs/cwtap/lib
      ADD lib.20210629.tar.gz /root/.venvs/cwtap/

      CMD ["/run.sh"]
```

   
- 在dockerfile所在目录执行docker build -t tag:version .
   **eg: docker build -t baseimage/cwtap:1.9.0 .**
```
      Sending build context to Docker daemon  4.321GB
      Step 1/9 : FROM baseimage/cwtap:1.8.1
       ---> 9056d0284683
      Step 2/9 : MAINTAINER by xiongqiang wangjifei@cewell.com.cn
       ---> Using cache
       ---> 30eae8f588ba
      Step 3/9 : RUN rm -rf /opt/CWTAP
       ---> Using cache
       ---> c54c6f4411ce
      Step 4/9 : ADD CWTAP.20210629.tar.gz /opt/
       ---> Using cache
       ---> 609b158ed939
      Step 5/9 : RUN rm -rf /opt/hanlp_datas
       ---> Using cache
       ---> 3f7472d6b0e6
      Step 6/9 : ADD hanlp_datas.20210629.tar.gz /opt/
       ---> Using cache
       ---> 9f8692568cad
      Step 7/9 : RUN rm -rf /root/.venvs/cwtap/lib
       ---> Running in 53dbb8eb2d67
      Removing intermediate container 53dbb8eb2d67
       ---> 4c8de40d5540
      Step 8/9 : ADD lib.20210629.tar.gz /root/.venvs/cwtap/
       ---> 465516756f4c
      Step 9/9 : CMD ["/run.sh"]
       ---> Running in cb8bdd0d3162
      Removing intermediate container cb8bdd0d3162
       ---> 3a40258061ed
      Successfully built 3a40258061ed
      Successfully tagged baseimage/cwtap:1.9.0
```
- 保存docker image 到本地磁盘：
      `docker save -o baseimage_cwtap.v1.9.0.tar.gz baseimage/cwtap:1.9.0`
- 加载docker image
      `docker load -i baseimage_cwtap.v1.9.0.tar.gz`
- 本次镜像中的源代码包中sbin目录下遗漏的init_ip.sh脚本
