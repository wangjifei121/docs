## Zookeeper介绍
### 1. 什么是zookeeper
Zookeeper是一种分布式协调服务，用于管理大型主机。在分布式环境中协调和管理服务是一种复杂的 过程。Zookeeper通过其简单的架构和API解决了这个问题。Zookeeper允许开发人员专注于核心应用程序逻辑，二不必担心应用程序的分布式特性。
### 2. Zookeeper的应用场景
- 分布式协调组件
 Zookeeper是一个分布式服务协调组件，是Hadoop、Hbase、Kafka重要的依赖组件，为分布式应用提供一致性服务的组件。
- 分布式锁
  
  Zookeeper可以实现保持独占和控制时序两种类型的分布式锁
    - 保持独占（通过Zookeeper中的一个临时节点）
      - 1.当线程要获取锁时，创建一个临时节点，如果创建失败,则表示锁已经被其他线程所持有。
      - 2.如果创建成功则表示获取了锁，然后进行业务处理，当处理完毕后释放锁，删除该节点。
    - 控制时序（利用通知机制）
 
      首先创建一个locker持久化节点。
      - 1.当线程要获取锁时，需要在locker持久化节点下创建顺序编号的临时节点。
      - 2.然后获取locker节点下的所有子节点，判断刚创建的临时节点的编号在locker的子节点中是否是最小的。
      - 3.如果是最小的，则表示获取锁成功，那么进行业务处理，当处理完毕后删除该节点。
      - 4.如果不是最小的，则找到它的前一个节点，然后对它进行监听，建立Watch。
      - 5.当节点被删除时将会通知正在监听它的节点，此时其他线程就获取到锁。

- 统一命名服务
  
  在分布式环境下，经常需要对应用/服务进行统一命名，便于识别(比如hadoop集群的命名)。例如：IP不容易记住，而域名容易记住。
- 统一配置管理
  
  ZK能够实现全局配置的容错和统一。分布式环境下，配置文件同步非常常见。一般要求一个集群中，所有节点的配置信息是一致的，比如 Kafka 集群。对配置文件修改后，希望能够快速同步到各个节点上。配置管理可交由ZooKeeper实现。可将配置信息写入ZooKeeper上的一个Znode。各个客户端服务器监听这个Znode。一旦Znode中的数据被修改，ZooKeeper将通知各个分服务器。
- 统一集群管理
  
  ZK能够实现集群管理，了解每台服务器的状态，对服务器节点的新增和删除会进行“周知”，能够进行主服务器选举。分布式环境中，实时掌握每个节点的状态是必要的。可根据节点实时状态做出一些调整。ZooKeeper可以实现实时监控节点状态变化可将节点信息写入ZooKeeper上的一个ZNode。监听这个ZNode可获取它的实时状态变化。
## 搭建Zookeeper服务器
### 1. zoo.cfg配置文件说明
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
### 2.Zookeeper常用命令
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
  - 创建持久顺序节点 `create -s /test data`
  - 创建临时节点 `create -e /test data`
  - 创建临时顺序节点 `create -e -s /test data`
  - 创建容器节点 `create -c /test`
  - 修改节点 `set /test newdata`
  - 删除指定节点 `delete /test`
  - 指定节点版本删除（乐观锁删除） `delete -v version /test`
  - 递归删除指定节点集 `deleteall /test`
- 权限设置
  - 注册当前会话的账号和密码 `addauth digest xiaowang:123456`
  - 创建节点并设置权限 `create /test abcd auth:xiaowang:123456:cdwra`
  - 在另一个会话中必须先使用账号密码，才能拥有操作该节点的权限
## Zookeeper内部的数据模型
### 1.zk是如何保存数据的

在 zookeeper 中，可以说 zookeeper 中的所有存储的数据是由 znode 组成的，节点也称为 znode，并以 key/value 形式存储数据。

整体结构类似于 linux 文件系统的模式以树形结构存储。其中根路径以 / 开头。

### 2.zk中的znode是什么结构
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

|  属性   | 属性介绍  |
|  ----  | ----  |
| cZxid  | 创建节点时的事务id |
| ctime  | 创建节点的时间 |
| mZxid  |	修改节点时的事务id, 与子节点无关 |
| mtime  | 修改节点的时间 |
| pZxid  | 创建或删除子节点时的事务id，与孙子节点无关 |
| cversion | 创建或删除子节点时的版本号，操作一次加1 |
| dataVersion | 本节点的版本号：更新数据时会增长 |
| aclVersion | 权限版本号，修改权限时，加1 |
| ephemeralOwner | 与临时节点绑定的sessionId， 如果不是临时节点，数值为0 |
| dataLength | 本节点的数据长度 |
| numChildren | 本节点的子节点个数，与孙子节点无关 |

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
### 3.zk中节点的类型
- 持久节点（PERSISTENT）
  所谓持久节点，是指在节点创建后，就一直存在，直到有删除操作来主动清除这个节点——不会因为创建该节点的客户端会话失效而消失。
- 持久顺序节点（PERSISTENT_SEQUENTIAL）
  这类节点的基本特性和上面的节点类型是一致的。额外的特性是，在ZK中，每个父节点会为他的第一级子节点维护一份时序，会记录每个子节点创建的先后顺序。基于这个特性，在创建子节点的时候，可以设置这个属性，那么在创建节点过程中，ZK会自动为给定节点名加上一个数字后缀，作为新的节点名。这个数字后缀的范围是整型的最大值。
- 临时节点（EPHEMERAL）
  和持久节点不同的是，临时节点的生命周期和客户端会话绑定。也就是说，如果客户端会话失效，那么这个节点就会自动被清除掉。注意，这里提到的是会话失效，而非连接断开。另外，在临时节点下面不能创建子节点。
- 临时顺序节点（EPHEMERAL_SEQUENTIAL）
  临时节点的生命周期和客户端会话绑定。也就是说，如果客户端会话失效，那么这个节点就会自动被清除掉。注意创建的节点会自动加上编号
  
<img width="930" alt="屏幕快照 2022-01-23 下午9 33 48" src="https://user-images.githubusercontent.com/40445471/150681033-402ede63-635d-40fa-8a76-d9da75e5adbc.png">
- container节点
   容器节点是 3.5 以后新增的节点类型，只要在调用 create 方法时指定 CreateMode 为 CONTAINER 即可创建容器的节点类型，容器节点的表现形式和持久节点是一样的，但是区别是 ZK 服务端启动后，会有一个单独的线程去扫描，所有的容器节点，当发现容器节点的子节点数量为 0 时，会自动删除该节点（60s），除此之外和持久节点没有区别，官方注释给出的使用场景是 Container nodes are special purpose nodes useful for recipes such as leader, lock, etc. 说可以用在 leader 或者锁的场景中。
- 持久 TTL、持久顺序 TTL
    关于持久和顺序这两个关键字，不用我再解释了，这两种类型的节点重点是后面的 TTL，TTL 是 time to live 的缩写，指带有存活时间，简单来说就是当该节点下面没有子节点的话，超过了 TTL 指定时间后就会被自动删除，特性跟上面的容器节点很像，只是容器节点没有超时时间而已，但是 TTL 启用是需要额外的配置(这个之前也有提过)配置是 zookeeper.extendedTypesEnabled 需要配置成 true，否则的话创建 TTL 时会收到 Unimplemented 的报错。

### 4.zk的数据持久化
zk的数据是运行在内存中的，zk提供了两种持久化机制
- 事务日志
   
   zk把执行的命令以日志形式保存在dataLogDir指定的路径中的文件中（如果没有指定dataLogDir，则按dataDir指定的路径）
- 数据快照
   
   zk会在一定的时间间隔内做一次内存数据的快照，把该时刻的内存数据保存在快照文件中

zk通过两种形式的持久化，在恢复时先恢复快照文件中的数据到内存中，再用日志文件中的数据做增量恢复，这样恢复效率更高

## zk实现分布式锁
### 1.zk中锁的种类
 - 读锁：大家都可以读，但是在上读锁的前提是存在的锁中没有写锁
 - 写锁：只有得到写锁才可以写，上写锁的前提是没有任何锁
### 2.zk如何上读锁
- 1. 创建一个临时顺序节点，节点的数据定义为read，表示读锁
- 2. 获取当前节点中序号比自己小的所有兄弟节点
- 3. 判断最小节点中的数据读锁（依据为-最小节点存放的数据是否等于read）
  - 如果是读锁：则上锁成功
  - 如果不是读锁，则上锁失败，为最小节点设置监听事件，阻塞等待，zk的监听机制会当最小节点发生改变时通知当前节点，然后再回到第二步流程继续执行

### 3.zk如何上写锁
- 1. 创建一个临时顺序节点，节点的数据是write，表示写锁
- 2. 获取1步骤中创建节点的所有的子节点
- 3. 判断当前节点是否是最小的节点
   - 如果是：则上写锁成功
   - 如果不是：则证明前面还有锁，上锁失败。监听最小节点，zk的监听机制会当最小节点发生改变时通知当前节点，然后再回到第二步流程继续执行
   
### 4.羊群效应
如果用上述上锁的方式，只要节点发生变化，就会出发其他所有节点的监听事件，这样的话对zk的压力非常大。
可以调整成链式监听来解决这个问题

<img width="616" alt="屏幕快照 2022-01-24 下午9 33 04" src="https://user-images.githubusercontent.com/40445471/150792090-69eecce4-3c4c-4aee-9bd2-bbf35f921b68.png">

## zk的watch机制
### 1.watch机制介绍
我们可以把 watch 理解成注册在特定znode上的触发器，当这个znode发生改变（create、set、delete），就会出发znode上注册的事件，watch当前节点的客户端会接收到异步通知
具体的交互过程如下：
- 客户端调用`getData`方法，watch参数为true，服务端接到请求，返回节点数据，并且在对应的哈希表中插入被watch的节点路径，以及watcher列表
<img width="680" alt="屏幕快照 2022-01-24 下午9 42 46" src="https://user-images.githubusercontent.com/40445471/150794672-6f468354-195d-45cb-a0f9-e439f39a135d.png">

- 当被watch的节点已删除，服务端回查找哈希表，找到该znode对应的所有watcher，异步通知客户端，并且删除哈希表中的key-value
<img width="689" alt="屏幕快照 2022-01-24 下午9 48 57" src="https://user-images.githubusercontent.com/40445471/150794646-caca41bc-928b-4e16-a746-ed45ecb25d27.png">

### 2.zkCli客户端使用watch
```
create /test data
get -w /test  //一次性监听节点
ls -w /test  //监听目录，创建和删除子节点会收到通知，子节点中新增节点不会收到通知
ls -R -w /test  //监听子节点中子节点的变化，但是内容的变化不会收到通知
```
## Zookeeper集群实战
### 1.zookeeper集群角色
zookeeper集群中的节点有三种角色
 - Leader：处理集群的所有事务请求，集群中只有一个Leader
 - Follower：只能处理读请求，参与Leader选举
 - Observer：只能处理读请求，提升集群读的性能，但是不参与Leader选举
 
### 集群搭建
#### 1.为什么zookeeper节点是奇数
   
```
   我们知道，在每台机器数据保持一致的情况下，zookeeper集群可以保证，客户端发起的每次查询操作，集群节点都能返回同样的结果。
　　但是对于客户端发起的修改、删除等能改变数据的操作呢？集群中那么多台机器，你修改你的，我修改我的，最后返回集群中哪台机器的数据呢？
　　这就是一盘散沙，需要一个领导，于是在zookeeper集群中，leader的作用就体现出来了，只有leader节点才有权利发起修改数据的操作，
  而follower节点即使接收到了客户端发起的修改操作，也要将其转交给   leader来处理，leader接收到修改数据的请求后，
  会向所有follower广播一条消息，让他们执行某项操作，follower 执行完后，便会向 leader 回复执行完毕。当 leader 收到半数以上的 
  follower 的确认消息，便会判定该操作执行完毕，然后向所有 follower 广播该操作已经生效。
　　所以zookeeper集群中leader是不可缺少的，但是 leader 节点是怎么产生的呢？其实就是由所有follower 节点选举产生的，讲究民主嘛，
  而且leader节点只能有一个，毕竟一个国家不能有多个总统。
　　这个时候回到我们的小标题，为什么 zookeeper 节点数是奇数，我们下面来一一来说明：
　　①、容错率
　　首先从容错率来说明：（需要保证集群能够有半数进行投票）
　　2台服务器，至少2台正常运行才行（2的半数为1，半数以上最少为2），正常运行1台服务器都不允许挂掉，但是相对于 单节点服务器，2台服务器还有两个单点故障，所以直接排除了。
　　3台服务器，至少2台正常运行才行（3的半数为1.5，半数以上最少为2），正常运行可以允许1台服务器挂掉
　　4台服务器，至少3台正常运行才行（4的半数为2，半数以上最少为3），正常运行可以允许1台服务器挂掉
　　5台服务器，至少3台正常运行才行（5的半数为2.5，半数以上最少为3），正常运行可以允许2台服务器挂掉
　　②、防脑裂
　　脑裂集群的脑裂通常是发生在节点之间通信不可达的情况下，集群会分裂成不同的小集群，小集群各自选出自己的leader节点，导致原有的集群出现多个leader节点的情况，这就是脑裂。
　　3台服务器，投票选举半数为1.5，一台服务裂开，和另外两台服务器无法通行，这时候2台服务器的集群（2票大于半数1.5票），所以可以选举出leader，而 1 台服务器的集群无法选举。
　　4台服务器，投票选举半数为2，可以分成 1,3两个集群或者2,2两个集群，对于 1,3集群，3集群可以选举；对于2,2集群，则不能选择，造成没有leader节点。
　　5台服务器，投票选举半数为2.5，可以分成1,4两个集群，或者2,3两集群，这两个集群分别都只能选举一个集群，满足zookeeper集群搭建数目。
　　以上分析，我们从容错率以及防止脑裂两方面说明了3台服务器是搭建集群的最少数目，4台发生脑裂时会造成没有leader节点的错误。
```
#### 2.下载zookeeper
 官网下载地址：http://mirror.bit.edu.cn/apache/zookeeper/

#### 3.安装JDK
由于zookeeper集群的运行需要Java运行环境，所以需要首先安装 JDK

#### 4.解压zookeeper
在 /usr/local 目录下新建 software 目录，然后将 zookeeper 压缩文件上传到该目录中，然后通过如下命令解压。
`tar -zxvf zookeeper-3.3.6.tar.gz`

#### 5.修改配置文件zoo.cfg
将zookeeper压缩文件解压后，我们进入到 conf 目录：
![image](https://user-images.githubusercontent.com/40445471/151174340-6d88f2a8-e343-482c-b895-c9e164fe2f99.png)
将 zoo_sample.cfg 文件复制并重命名为 zoo.cfg 文件。
`cp zoo_sample.cfg zoo.cfg`
然后通过 vim zoo.cfg 命令对该文件进行修改：
![image](https://user-images.githubusercontent.com/40445471/151174456-14a5bc23-4111-4ca6-85dd-a74c15e57fc8.png)
```
集群配置说明
   server.A=B:C:D
　　　　A：其中 A 是一个数字，表示这个是服务器的编号；
　　　　B：是这个服务器的 ip 地址；
　　　　C：Zookeeper服务器之间的通信端口；
　　　　D：Leader选举的端口。

我们需要修改的第一个是 dataDir ,在指定的位置处创建好目录。
第二个需要新增的是 server.A=B:C:D 配置，其中 A 对应下面我们即将介绍的myid 文件。B是集群的各个IP地址，C:D 是端口配置。
```

#### 6。创建myid文件
在 上一步 dataDir 指定的目录下，创建 myid 文件。
![image](https://user-images.githubusercontent.com/40445471/151175468-fa7e1f93-b0a5-4e3f-85ed-dfe86d552cc0.png)
然后在该文件添加上一步 server 配置的对应 A 数字。
比如我们上面的配置：
   dataDir=/usr/local/software/zookeeper-3.3.6/data
然后下面配置是：
   server.0=192.168.146.200:2888:3888
   server.1=192.168.146.201:2888:3888
   server.2=192.168.146.202:2888:3888
那么就必须在 192.168.146.200 机器的的 /usr/local/software/zookeeper-3.3.6/data 目录下创建 myid 文件，然后在该文件中写上 0 即可。
![image](https://user-images.githubusercontent.com/40445471/151175628-404f9a4c-1492-4449-8eaa-d0f87aeee8c7.png)
后面的机器依次在相应目录创建myid文件，写上相应配置数字即可。
#### 7.启动zookeeper服务
启动命令：`zkServer.sh start`
停止命令：`zkServer.sh stop`
重启命令：`zkServer.sh restart`
查看集群节点状态：`zkServer.sh status`
我们分别对集群三台机器执行启动命令。执行完毕后，分别查看集群节点状态：
出现如下即是集群搭建成功
![image](https://user-images.githubusercontent.com/40445471/151176321-6ab07039-aff3-40c7-9bfe-26a51c21b4fb.png)



