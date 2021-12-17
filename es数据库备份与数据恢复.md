### 一、安装工具elasticdump

```  
-  先安装node、npm
      $ wget https://nodejs.org/dist/v10.15.0/node-v10.15.0-linux-x64.tar.xz
      $ tar -xf node-v10.15.0-linux-x64.tar.xz
-  配置相关的环境变量
      $ vim /etc/profile
      > PATH=$PATH:/software/node-v10.15.0-linux-x64/bin
      $ source /etc/profile
-  或者添加软连接
      ln -s /usr/local/node-v12.19.0-linux-x64.tar/bin/npm   /usr/bin/ 
      rm -rf /usr/bin/npm 

- 通过npm安装elasticdump
      # 全局安装
      $ npm install elasticdump -g
      $ elasticdump
```
 
### 二、使用Elasticdump对数据导出
```
   * 导出 index 的 mapping 到 .json 文件
    elasticdump \
      --input=http://es:9200/my_index \
      --output=/data/my_index_mapping.json \
      --type=mapping
   * 导出 index 的所有数据到 .json 文件
    elasticdump \
      --input=http://es:9200/my_index \
      --output=/data/my_index.json \
      --type=data
   * 导出符合查询条件的数据
    elasticdump \
      --input=http://es:9200/keyword \
      --output=keyword.json \
      --searchBody '{"query":{"term":{"keywordbase": "14"}}}'
```
      
### 三、使用elasticdump导入数据
```
    elasticdump \
      --input=/mnt/mfs/金融领域业务词.json \
      --output=http://es:9200/keyword
```
