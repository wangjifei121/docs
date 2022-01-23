## Zookeeper介绍
#### 1. 什么是zookeeper
Zookeeper是一种分布式协调服务，用于管理大型主机。在分布式环境中协调和管理服务是一种复杂的 过程。Zookeeper通过其简单的架构和API解决了这个问题。Zookeeper允许开发人员专注于核心应用程序逻辑，二不必担心应用程序的分布式特性。
#### 2. Zookeeper的应用场景
- 分布式协调组件
 Zookeeper是一个分布式服务协调组件，是Hadoop、Hbase、Kafka重要的依赖组件，为分布式应用提供一致性服务的组件。
- 分布式锁
  
  zk在实现分布式锁上，可以做到强一致性
- 统一命名服务
  
  在分布式环境下，经常需要对应用/服务进行统一命名，便于识别(比如hadoop集群的命名)。例如：IP不容易记住，而域名容易记住。
- 统一配置管理
  
  ZK能够实现全局配置的容错和统一。分布式环境下，配置文件同步非常常见。一般要求一个集群中，所有节点的配置信息是一致的，比如 Kafka 集群。对配置文件修改后，希望能够快速同步到各个节点上。配置管理可交由ZooKeeper实现。可将配置信息写入ZooKeeper上的一个Znode。各个客户端服务器监听这个Znode。一旦Znode中的数据被修改，ZooKeeper将通知各个分服务器。
- 统一集群管理
  
  ZK能够实现集群管理，了解每台服务器的状态，对服务器节点的新增和删除会进行“周知”，能够进行主服务器选举。分布式环境中，实时掌握每个节点的状态是必要的。可根据节点实时状态做出一些调整。ZooKeeper可以实现实时监控节点状态变化可将节点信息写入ZooKeeper上的一个ZNode。监听这个ZNode可获取它的实时状态变化。
## 搭建Zookeeper服务器
#### 1. zoo.cfg配置文件说明
```
#ZK中的时间配置最小单位，其他时间配置以整数倍tickTime计算
tickTime=2000
#Leader允许Follower启动时在initLimit时间内完成数据同步，单位：tickTime
initLimit=10
#Leader发送心跳包给集群中所有Follower，若Follower在syncLimit时间内没有响应，那么Leader就认为该follower已经挂掉了，单位：tickTime
syncLimit=5
#配置ZK的数据目录
dataDir=/usr/local/zookeeper/data
#用于接收客户端请求的端口号
clientPort=2181
#配置ZK的日志目录
dataLogDir=/usr/local/zookeeper/logs
#ZK集群节点配置，端口号2888用于集群节点之间数据通信，端口号3888用于集群中Leader选举
server.1=192.168.123.100:2888:3888
server.2=192.168.123.101:2888:3888
server.3=192.168.123.102:2888:3888
```
#### 2.Zookeeper常用命令
- 服务端常见命令
  - 启动服务命令 `./bin/zkServer.sh start ./conf/zoo.cfg`
  - 查看服务状态 `./bin/zkServer.sh status ./conf/zoo.cfg`
  - 关闭服务 `./bin/zkServer.sh stop ./conf/zoo.cfg`
- 客户端常见命令
  - 连接服务器 `./bin/zkCli.sh`
  - 查询帮助命令 `help`
  - 获取某个节点的信息 `get path`
  - 查看根节点 `ls /`
  - 递归查看根节点 `ls -R /`
  - 创建普通持久节点 `create /test data`
  - 创建临时节点 `create -e /test data`

## Zookeeper内部的数据模型
#### 1.zk是如何保存数据的

在 zookeeper 中，可以说 zookeeper 中的所有存储的数据是由 znode 组成的，节点也称为 znode，并以 key/value 形式存储数据。

整体结构类似于 linux 文件系统的模式以树形结构存储。其中根路径以 / 开头。

#### 2.zk中的znode是什么结构
- zk中的znode包含了四部分信息
  - data: 保存的数据
  - acl: 权限信息
     - c：create 创建权限
     - w：write 更新权限
     - r：read 读取权限
     - d：delete 删除权限
     - a：admin 管理者权限 允许对该节点进行acl权限设置
  - stat：描述当前znode的元数据
  - child：当前节点的字节点
- 可通过 `get -s /test`查看节点详细信息
```
[zk: localhost:2181(CONNECTED) 13] get -s /test 
null
cZxid = 0x1d
ctime = Sun Jan 23 11:26:49 UTC 2022
mZxid = 0x1d
mtime = Sun Jan 23 11:26:49 UTC 2022
pZxid = 0x1d
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 0
numChildren = 0
[zk: localhost:2181(CONNECTED) 14] 
```
#### 3.zk中节点的类型
- 持久节点（PERSISTENT）
  所谓持久节点，是指在节点创建后，就一直存在，直到有删除操作来主动清除这个节点——不会因为创建该节点的客户端会话失效而消失。
- 持久顺序节点（PERSISTENT_SEQUENTIAL）
  这类节点的基本特性和上面的节点类型是一致的。额外的特性是，在ZK中，每个父节点会为他的第一级子节点维护一份时序，会记录每个子节点创建的先后顺序。基于这个特性，在创建子节点的时候，可以设置这个属性，那么在创建节点过程中，ZK会自动为给定节点名加上一个数字后缀，作为新的节点名。这个数字后缀的范围是整型的最大值。
- 临时节点（EPHEMERAL）
  和持久节点不同的是，临时节点的生命周期和客户端会话绑定。也就是说，如果客户端会话失效，那么这个节点就会自动被清除掉。注意，这里提到的是会话失效，而非连接断开。另外，在临时节点下面不能创建子节点。
- 临时顺序节点（EPHEMERAL_SEQUENTIAL）
  临时节点的生命周期和客户端会话绑定。也就是说，如果客户端会话失效，那么这个节点就会自动被清除掉。注意创建的节点会自动加上编号
