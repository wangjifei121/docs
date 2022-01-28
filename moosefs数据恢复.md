## MFS数据恢复操作步骤
### mfsgettrashtime 用来查看已删除文件能够在回收站存放的时间

确定mfs设置的回收站存放时间，如果超过了回收时间或者回收时间设置为0，不可能数据恢复
```
[root@rancher-server mfs]# 
[root@rancher-server mfs]# mfsgettrashtime /mnt/mfs
/mnt/mfs: 86400
[root@rancher-server mfs]# 
```
### 获取回收站目录
如果部署MooseFS 文件系统时没有指定文件回收站位置，默认是不自动创建的，但是被删除的文件时间没超过过期时间的仍然存在。
解决这个问题只需要创建或选择一个目录，将mfs挂载到回收站所用目录即可
 ```
 [root@rancher-server mnt]# pwd
/mnt
[root@rancher-server mnt]# mkdir mfsmeta
[root@rancher-server mnt]#/usr/local/mfs/bin/mfsmount -m /mnt/mfsmeta -H mfsmaster
[root@rancher-server mnt]# cd mfsmeta
[root@rancher-server mfsmeta]# pwd
/mnt/mfsmeta
[root@rancher-server mfsmeta]# ls
sustained  trash
[root@rancher-server mfsmeta]# 
 ```
 ### MFS回收站中的数据恢复
 进入`/mnt/mfs/mfsmeta/trash`目录，将要进行回复的数据移动到`/mnt/mfs/mfsmeta/trash/undel/`目录中，数据会自动恢复至删除前的位置
 
 附：文件数量过多的情况下，没法用mv命令，可以使用这样的命令`find ./ -type f | xargs  -i mv {} ./undel/  &`
