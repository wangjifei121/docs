### 20210618
  1. 问题现象：java算法接口报500 词性分析、内容摘要、关键词提取
  2. 问题原因：新环境部署，hanlp缺少依赖的目录文件 java项目启动时报--/opt/hanlp_datas/data/dictionary/相关的错误
  3. 解决办法：将hanlp_datas文件拷贝到/opt/目录下
### 20210630
  1. 问题现象：24:18000测试环境服务启动失败，不能正常访问
  2. 问题原因：master服务无法通过主机名mysql、redis、es连接到对应服务
  3. 解决办法：将mysql、redis、es服务的ip和主机名的对应关系配置添加到 /etc/hosts文件中
```
          10.42.98.208 master
          10.42.50.135 es
          10.42.20.175 mysql
          10.42.34.53 redis
```
### 富徳项目出现es index被锁住的问题
  - 报错信息：`AuthorizationException: AuthorizationException(403, u'cluster_block_exception', u'blocked by: [FORBIDDEN/12/index read-only / allow delete (api)];')`
  - 问题原因: 当Elasticsearch所在磁盘占用大于等于95%时，Elasticsearch会把所有相关索引自动置为只读。
  - 问题分析: `curl -GET 'localhost:9200/index_name/_settings?pretty'`
  - 解决方案：解决磁盘满的问题后手动修改被锁的index  `curl -XPUT 'localhost:9200/index_name/_settings'  -H 'Content-Type: application/json' -d '{"index.blocks.read_only_allow_delete": null}'`
