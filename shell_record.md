### 借助awk统计日志计算每天请求量

```
cat $1|grep 'cwtapMiddleware 本次请求响应时间'|cut -c 56-72|awk '{sum+=$1} END {print "total request = " NR; print "request average = " sum/NR}'
```
