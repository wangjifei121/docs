### 借助awk统计日志计算每天请求量

```
cat $1|grep 'cwtapMiddleware 本次请求响应时间'|cut -c 56-72|awk '{sum+=$1} END {print "total request = " NR; print "request average = " sum/NR}'
```
### shell命令统计文件夹中的python代码行数
```
find ./chatbot -name '*.py'| xargs cat |grep -v ^$|wc -l
```
### 指定文件最后修改时间删除
```
for filename in *; do if [ `date -r $filename +%H%M` == "1622" ];then rm -f $filename; fi done
```
