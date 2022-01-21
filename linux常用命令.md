### 查看文件编码
- 在Vim中可以直接查看文件编码
`:set fileencoding`即可显示文件编码格式。
- 如果你只是想查看其它编码格式的文件或者想解决用Vim查看文件乱码的问题，那么你可以在
~/.vimrc 文件中添加以下内容：
`set encoding=utf-8 fileencodings=ucs-bom,utf-8,cp936`
这样，就可以让vim自动识别文件编码（可以自动识别UTF-8或者GBK编码的文件），其实就是依照fileencodings提供的编码列表尝试，如果没有找到合适的编码，就用latin-1(ASCII)编码打开。
### 查看linux文件目录的大小和文件夹包含的文件数
```
 - 统计总数大小
    du -sh xmldb/
    du -sm * | sort -n //统计当前目录大小 并按大小 排序
    du -sk * | sort -n
    du -sk * | grep guojf //看一个人的大小
    du -m | cut -d "/" -f 2 //看第二个/ 字符前的文字
 - 查看此文件夹有多少文件 /*/*/* 有多少文件
    du xmldb/
    du xmldb/*/*/* |wc -l
    参数说明：wc [-lmw]
    -l :多少行
    -m:多少字符
    -w:多少字
 ```
### 重启服务器
- shutdown命令
```
shutdown命令是最常用也是最安全的关机和重启命令，它会在关机之前调用fsck检查磁盘，其中-h和-r是最常用的参数：
　●　-h：停止系统服务并关机
　●　-r： 停止系统服务后重启
 
 eg:
  shutdown -h now  --立即关机 
  shutdown -h 10:53  --到10:53关机，如果该时间小于当前时间，则到隔天 
  shutdown -h +10  --10分钟后自动关机 
  shutdown -r now  --立即重启 
  shutdown -r +30 'The System Will Reboot in 30 Mins'   --30分钟后重启并并发送通知给其它在线用户
```
- reboot命令
```
reboot表示立即重启，效果等同于shutdown -r now。
```
- init命令
```
init是所有进程的祖先﹐它的进程号始终为1﹐所以发送TERM信号给init会终止所有的 用户进程﹑守护进程等。shutdown 就是使用这种机制。
 - init定义的运行级别(runlevel)， 
　　　　0：关机
　　　　1：服务器出问题（单用户状态）
　　　　2：无NFS的多用户模式
　　　　3：完整的多用户模式
　　　　4：无保留无使用
　　　　5：桌面模式
　　　　6：重新启动
　- 设置运行级别（例：init 0）
　- 查看当前运行级别（runlevel）
```
- halt 命令
```
若系统的 runlevel 为 0 或 6 ，则Linux halt命令关闭系统，否则以 shutdown 指令（加上 -h 参数）来取代。

- 语法
    halt [-n] [-w] [-d] [-f] [-i] [-p]
    参数说明：

    -n : 在关机前不做将记忆体资料写回硬盘的动作
    -w : 并不会真的关机，只是把记录写到 /var/log/wtmp 文件里
    -d : 不把记录写到 /var/log/wtmp 文件里（-n 这个参数包含了 -d） -f : 强迫关机，不呼叫 shutdown 这个指令
    -i : 在关机之前先把所有网络相关的装置先停止
    -p : 当关机的时候，顺便做关闭电源（poweroff）的动作
- 实例
  关闭系统
  # halt
  关闭系统并关闭电源
  # halt -p
  关闭系统，但不留下纪录
  # halt -d
```
- poweroff 命令
```
poweroff 命令命令用于关闭计算器并切断电源。
- 语法
   poweroff [-n] [-w] [-d] [-f] [-i] [-h]
   参数说明：

   -n : 在关机前不做将记忆体资料写回硬盘的动作
   -w : 并不会真的关机，只是把记录写到 /var/log/wtmp 档案里
   -d : 不把记录写到 /var/log/wtmp 文件里
   -i : 在关机之前先把所有网络相关的装置先停止
   -p : 关闭操作系统之前将系统中所有的硬件设置为备用模式。
- 实例
  关闭系统
  # poweroff
```
