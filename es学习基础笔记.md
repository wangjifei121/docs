```
@author wangjifei@cewell.com.cn
@date 2020-03-22
```

# 前言---ES的数据组织类比

| Relational DB| Elasticsearch|
|:-------------:| :-----:|
|  数据库（database） |  索引（indices） |
| 表（tables） |	types|
|行（rows）|documents |
|字段（columns）|fields|

# 一、 ES简单的增删改查
#### 1、创建一篇文档（有则修改，无则创建)
```
PUT test/doc/2
{
  "name":"wangfei",
  "age":27,
  "desc":"热天还不让后人不认同"
}

PUT test/doc/1
{
  "name":"wangjifei",
  "age":27,
  "desc":"萨芬我反胃为范围额"
}

PUT test/doc/3
{
  "name":"wangyang",
  "age":30,
  "desc":"点在我心内的几首歌"
}
```

#### 2、查询指定索引信息
```
GET test
```

#### 3、 查询指定文档信息
```
GET test/doc/1
GET test/doc/2
```
#### 4、查询对应索引下所有数据
```
GET test/doc/_search
或
GET test/doc/_search
{
  "query": {
    "match_all": {}
  }
}
```

#### 5、删除指定文档
```
DELETE test/doc/3
```

#### 6、删除索引
```
DELETE test
```

#### 7、修改指定文档方式
- 修改时，不指定的属性会自动覆盖，只保留指定的属性(不正确的修改指定文档方式)

```
PUT test/doc/1
{
  "name":"王计飞"
}
```

- 使用POST命令，在id后面跟_update，要修改的内容放到doc文档（属性）中(正确的修改指定文档方式)

```
POST test/doc/1/_update
{
  "doc":{
    "desc":"生活就像 茫茫海上"
  }
}
```
# 二、ES查询的两种方式
#### 1、查询字符串搜索
```
GET test/doc/_search?q=name:wangfei
```

#### 2、结构化查询(单字段查询,不能多字段组合查询)
```
GET test/doc/_search
{
  "query":{
    "match":{
      "name":"wang"
    }
  }
}
```

# 三、match系列之操作
#### 1、match系列之match_all (查询全部)
```
GET test/doc/_search
{
  "query":{
    "match_all": {
    }
  }
}
```
#### 2、match系列之match_phrase（短语查询）
```
准备数据

PUT test1/doc/1
{
  "title": "中国是世界上人口最多的国家"
}
PUT test1/doc/2
{
  "title": "美国是世界上军事实力最强大的国家"
}
PUT test1/doc/3
{
  "title": "北京是中国的首都"
}
```
```
查询语句

GET test1/doc/_search
{
  "query":{
    "match":{
      "title":"中国"
    }
  }
}

>>>输出结果
{
  "took" : 241,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 3,
    "max_score" : 0.68324494,
    "hits" : [
      {
        "_index" : "test1",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.68324494,
        "_source" : {
          "title" : "中国是世界上人口最多的国家"
        }
      },
      {
        "_index" : "test1",
        "_type" : "doc",
        "_id" : "3",
        "_score" : 0.5753642,
        "_source" : {
          "title" : "北京是中国的首都"
        }
      },
      {
        "_index" : "test1",
        "_type" : "doc",
        "_id" : "2",
        "_score" : 0.39556286,
        "_source" : {
          "title" : "美国是世界上军事实力最强大的国家"
        }
      }
    ]
  }
}

```

##### 通过观察结果可以发现，虽然如期的返回了中国的文档。但是却把和美国的文档也返回了，这并不是我们想要的。是怎么回事呢？因为这是elasticsearch在内部对文档做分词的时候，对于中文来说，就是一个字一个字分的，所以，我们搜中国，中和国都符合条件，返回，而美国的国也符合。而我们认为中国是个短语，是一个有具体含义的词。所以elasticsearch在处理中文分词方面比较弱势。后面会讲针对中文的插件。但目前我们还有办法解决，那就是使用短语查询 用match_phrase

```
GET test1/doc/_search
{
  "query":{
    "match_phrase": {
      "title": "中国"
    }
  }
}

>>>查询结果
{
  "took" : 10,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 2,
    "max_score" : 0.5753642,
    "hits" : [
      {
        "_index" : "test1",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.5753642,
        "_source" : {
          "title" : "中国是世界上人口最多的国家"
        }
      },
      {
        "_index" : "test1",
        "_type" : "doc",
        "_id" : "3",
        "_score" : 0.5753642,
        "_source" : {
          "title" : "北京是中国的首都"
        }
      }
    ]
  }
}
```

##### 我们搜索中国和世界这两个指定词组时，但又不清楚两个词组之间有多少别的词间隔。那么在搜的时候就要留有一些余地。这时就要用到了slop了。相当于正则中的中国.*?世界。这个间隔默认为0
```
GET test1/doc/_search
{
  "query":{
    "match_phrase": {
      "title": {
        "query": "中国世界",
        "slop":2
      }
    }
  }
}

>>>查询结果
{
  "took" : 23,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 0.7445889,
    "hits" : [
      {
        "_index" : "test1",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.7445889,
        "_source" : {
          "title" : "中国是世界上人口最多的国家"
        }
      }
    ]
  }
}
```

#### 3、match系列之match_phrase_prefix（最左前缀查询）智能搜索--以什么开头

```
数据准备

PUT test2/doc/1
{
  "title": "prefix1",
  "desc": "beautiful girl you are beautiful so"
}

PUT test2/doc/2
{
  "title": "beautiful",
  "desc": "I like basking on the beach"
}
```

##### 搜索特定英文开头的数据
```
查询语句

GET test2/doc/_search
{
  "query": {
    "match_phrase_prefix": {
      "desc": "bea"
    }
  }
}

>>>查询结果（）
{
  "took" : 5,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 2,
    "max_score" : 0.39556286,
    "hits" : [
      {
        "_index" : "test2",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.39556286,
        "_source" : {
          "title" : "prefix1",
          "desc" : "beautiful girl you are beautiful so"
        }
      },
      {
        "_index" : "test2",
        "_type" : "doc",
        "_id" : "2",
        "_score" : 0.2876821,
        "_source" : {
          "title" : "beautiful",
          "desc" : "I like basking on the beach"
        }
      }
    ]
  }
}

查询短语
GET test2/doc/_search
{
  "query": {
    "match_phrase_prefix": {
      "desc": "you are bea"
    }
  }
}

>>>查询结果
{
  "took" : 28,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 0.8630463,
    "hits" : [
      {
        "_index" : "test2",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.8630463,
        "_source" : {
          "title" : "prefix1",
          "desc" : "beautiful girl you are beautiful so"
        }
      }
    ]
  }
}

```


##### max_expansions 参数理解 前缀查询会非常的影响性能，要对结果集进行限制，就加上这个参数。
```
GET test2/doc/_search
{
  "query": {
    "match_phrase_prefix": {
      "desc": {
        "query": "bea",
        "max_expansions":1
      }
    }
  }
}
```

#### 4、match系列之multi_match（多字段查询)  
- multi_match是要在多个字段中查询同一个关键字  除此之外，mulit_match甚至可以当做match_phrase和match_phrase_prefix使用，只需要指定type类型即可

```
GET test2/doc/_search
{
  "query": {
    "multi_match": {
      "query": "beautiful",
      "fields": ["title","desc"]
    }
  }
}

>>查询结果
{
  "took" : 43,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 2,
    "max_score" : 0.39556286,
    "hits" : [
      {
        "_index" : "test2",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.39556286,
        "_source" : {
          "title" : "prefix1",
          "desc" : "beautiful girl you are beautiful so"
        }
      },
      {
        "_index" : "test2",
        "_type" : "doc",
        "_id" : "2",
        "_score" : 0.2876821,
        "_source" : {
          "title" : "beautiful",
          "desc" : "I like basking on the beach"
        }
      }
    ]
  }
}
```
- 当设置属性 type:phrase 时 等同于 短语查询

```
GET test1/doc/_search
{
  "query": {
    "multi_match": {
      "query": "中国",
      "fields": ["title"],
      "type": "phrase"
    }
  }
}

>>>查询结果
{
  "took" : 47,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 2,
    "max_score" : 0.5753642,
    "hits" : [
      {
        "_index" : "test1",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.5753642,
        "_source" : {
          "title" : "中国是世界上人口最多的国家"
        }
      },
      {
        "_index" : "test1",
        "_type" : "doc",
        "_id" : "3",
        "_score" : 0.5753642,
        "_source" : {
          "title" : "北京是中国的首都"
        }
      }
    ]
  }
}
```
- 当设置属性 type:phrase_prefix时 等同于 最左前缀查询

```
GET test2/doc/_search
{
  "query": {
    "multi_match": {
      "query": "bea",
      "fields": ["desc"],
      "type": "phrase_prefix"
    }
  }
}

>>查询结果
{
  "took" : 5,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 2,
    "max_score" : 0.5753642,
    "hits" : [
      {
        "_index" : "test1",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.5753642,
        "_source" : {
          "title" : "中国是世界上人口最多的国家"
        }
      },
      {
        "_index" : "test1",
        "_type" : "doc",
        "_id" : "3",
        "_score" : 0.5753642,
        "_source" : {
          "title" : "北京是中国的首都"
        }
      }
    ]
  }
}
```

> **match 查询相关总结**
> 
> 1、match：返回所有匹配的分词。
> 
> 2、match_all：查询全部。
> 
> 3、match_phrase：短语查询，在match的基础上进一步查询词组，可以指定slop分词间隔。
> 
> 4、match_phrase_prefix：前缀查询，根据短语中最后一个词组做前缀匹配，可以应用于搜索提示，但注意和max_expanions搭配。其实默认是50.......
> 
> 5、multi_match：多字段查询，使用相当的灵活，可以完成match_phrase和match_phrase_prefix的工作。



# 四、ES的排序查询 
	注意：排序字段只能是数字和日期类型的字段，其他的都不行

- name字段排序报错

```
GET test/doc/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "name": {
        "order": "asc"
      }
    }
  ]
}

>>查询结果
{
  "error": {
    "root_cause": [
      {
        "type": "illegal_argument_exception",
        "reason": "Fielddata is disabled on text fields by default. Set fielddata=true on [name] in order to load fielddata in memory by uninverting the inverted index. Note that this can however use significant memory. Alternatively use a keyword field instead."
      }
    ],
    "type": "search_phase_execution_exception",
    "reason": "all shards failed",
    "phase": "query",
    "grouped": true,
    "failed_shards": [
      {
        "shard": 0,
        "index": "test",
        "node": "INueKtviRpO1dbNWngcjJA",
        "reason": {
          "type": "illegal_argument_exception",
          "reason": "Fielddata is disabled on text fields by default. Set fielddata=true on [name] in order to load fielddata in memory by uninverting the inverted index. Note that this can however use significant memory. Alternatively use a keyword field instead."
        }
      }
    ],
    "caused_by": {
      "type": "illegal_argument_exception",
      "reason": "Fielddata is disabled on text fields by default. Set fielddata=true on [name] in order to load fielddata in memory by uninverting the inverted index. Note that this can however use significant memory. Alternatively use a keyword field instead.",
      "caused_by": {
        "type": "illegal_argument_exception",
        "reason": "Fielddata is disabled on text fields by default. Set fielddata=true on [name] in order to load fielddata in memory by uninverting the inverted index. Note that this can however use significant memory. Alternatively use a keyword field instead."
      }
    }
  },
  "status": 400
}
```
- 倒叙排序

```
GET test/doc/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "age": {
        "order": "desc"
      }
    }
  ]
}

>>排序结果
{
  "took" : 152,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 3,
    "max_score" : null,
    "hits" : [
      {
        "_index" : "test",
        "_type" : "doc",
        "_id" : "3",
        "_score" : null,
        "_source" : {
          "name" : "wangyang",
          "age" : 30,
          "desc" : "点在我心内的几首歌"
        },
        "sort" : [
          30
        ]
      },
      {
        "_index" : "test",
        "_type" : "doc",
        "_id" : "2",
        "_score" : null,
        "_source" : {
          "name" : "wangfei",
          "age" : 27,
          "desc" : "热天还不让后人不认同"
        },
        "sort" : [
          27
        ]
      },
      {
        "_index" : "test",
        "_type" : "doc",
        "_id" : "1",
        "_score" : null,
        "_source" : {
          "name" : "wangjifei",
          "age" : 27,
          "desc" : "生活就像 茫茫海上"
        },
        "sort" : [
          27
        ]
      }
    ]
  }
}
```
- 升序排序

```
GET test/doc/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "age": {
        "order": "asc"
      }
    }
  ]
}
```

# 五、ES的分页查询 
- from：从哪开始查  size：返回几条结果

```
GET test/doc/_search
{
  "query": {
    "match_phrase_prefix": {
      "name": "wang"
    }
  },
  "from": 0,
  "size": 1
}

>>查询结果
{
  "took" : 3,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 3,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "test",
        "_type" : "doc",
        "_id" : "2",
        "_score" : 0.2876821,
        "_source" : {
          "name" : "wangfei",
          "age" : 27,
          "desc" : "热天还不让后人不认同"
        }
      }
    ]
  }
}
```
# 六、ES的bool查询 (must、should)

- must (must字段对应的是个列表，也就是说可以有多个并列的查询条件，一个文档满足各个子条件后才最终返回)

```
#### 单条件查询
GET test/doc/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
          "name": "wangfei"
          }
        }
      ]
    }
  }
}

>>查询结果
{
  "took" : 4,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "test",
        "_type" : "doc",
        "_id" : "2",
        "_score" : 0.2876821,
        "_source" : {
          "name" : "wangfei",
          "age" : 27,
          "desc" : "热天还不让后人不认同"
        }
      }
    ]
  }
}
```
```
#### 多条件组合查询
GET test/doc/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "name": "wanggfei"
          }
        },{
          "match": {
            "age": 25
          }
        }
      ]
    }
  }
}

>>查询结果
{
  "took" : 21,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 0,
    "max_score" : null,
    "hits" : [ ]
  }
}

```

- should (只要符合其中一个条件就返回)

```
GET test/doc/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
          "name": "wangjifei"
        }
        },{
          "match": {
            "age": 27
          }
        }
      ]
    }
  }
}

>>查询结果
{
  "took" : 34,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 2,
    "max_score" : 1.287682,
    "hits" : [
      {
        "_index" : "test",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 1.287682,
        "_source" : {
          "name" : "wangjifei",
          "age" : 27,
          "desc" : "生活就像 茫茫海上"
        }
      },
      {
        "_index" : "test",
        "_type" : "doc",
        "_id" : "2",
        "_score" : 1.0,
        "_source" : {
          "name" : "wangfei",
          "age" : 27,
          "desc" : "热天还不让后人不认同"
        }
      }
    ]
  }
}
```
- must_not 顾名思义

```
GET test/doc/_search
{
  "query": {
    "bool": {
      "must_not": [
        {
          "match": {
            "name": "wangjifei"
          }
        },{
          "match": {
            "age": 27
          }
        }
      ]
    }
  }
}

>>查询结果
{
  "took" : 13,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "test",
        "_type" : "doc",
        "_id" : "3",
        "_score" : 1.0,
        "_source" : {
          "name" : "wangyang",
          "age" : 30,
          "desc" : "点在我心内的几首歌"
        }
      }
    ]
  }
}
```


- filter(条件过滤查询，过滤条件的范围用range表示gt表示大于、lt表示小于、gte表示大于等于、lte表示小于等于)

```
GET test/doc/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "name": "wangjifei"
          }
        }
      ],
      "filter": {
        "range": {
          "age": {
            "gte": 10,
            "lt": 27
          }
        }
      }
    }
  }
}

>>查询结果
{
  "took" : 33,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 0,
    "max_score" : null,
    "hits" : [ ]
  }
}

```

> **bool查询总结**
> 
> must：与关系，相当于关系型数据库中的 and。
>
> should：或关系，相当于关系型数据库中的 or。
>
> must_not：非关系，相当于关系型数据库中的 not。
>
>  filter：过滤条件。
>
>  range：条件筛选范围。
>
>  gt：大于，相当于关系型数据库中的 >。
>
>  gte：大于等于，相当于关系型数据库中的 >=。
>
>  lt：小于，相当于关系型数据库中的 <。
>
>  lte：小于等于，相当于关系型数据库中的 <=。



# 七、ES之查询结果过滤
```
#### 准备数据

PUT test3/doc/1
{
  "name":"顾老二",
  "age":30,
  "from": "gu",
  "desc": "皮肤黑、武器长、性格直",
  "tags": ["黑", "长", "直"]
}
```

- 现在，在所有的结果中，我只需要查看name和age两个属性,提高查询效率

```
GET test3/doc/_search
{
  "query": {
    "match": {
      "name": "顾"
    }
  },
  "_source": ["name","age"]
}

>>查询结果
{
  "took" : 58,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "test3",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.2876821,
        "_source" : {
          "name" : "顾老二",
          "age" : 30
        }
      }
    ]
  }
}
```

# 八、ES之查询结果高亮显示 
- ES的默认高亮显示

```
GET test3/doc/_search
{
  "query": {
    "match": {
      "name": "顾老二"
    }
  },
  "highlight": {
    "fields": {
      "name": {}
    }
  }
}

>>查询结果
{
  "took" : 216,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 0.8630463,
    "hits" : [
      {
        "_index" : "test3",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.8630463,
        "_source" : {
          "name" : "顾老二",
          "age" : 30,
          "from" : "gu",
          "desc" : "皮肤黑、武器长、性格直",
          "tags" : [
            "黑",
            "长",
            "直"
          ]
        },
        "highlight" : {
          "name" : [
            "<em>顾</em><em>老</em><em>二</em>"
          ]
        }
      }
    ]
  }
}
```

##### ES自定义高亮显示（在highlight中，pre_tags用来实现我们的自定义标签的前半部分，在这里，我们也可以为自定义的 标签添加属性和样式。post_tags实现标签的后半部分，组成一个完整的标签。至于标签中的内容，则还是交给fields来完成）
```
GET test3/doc/_search
{
  "query": {
    "match": {
      "desc": "性格直"
    }
  },
  "highlight": {
    "pre_tags": "<b class='key' style='color:red'>",
    "post_tags": "</b>",
    "fields": {
      "desc": {}
    }
  }
}

>>查询结果
{
  "took" : 6,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 0.8630463,
    "hits" : [
      {
        "_index" : "test3",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.8630463,
        "_source" : {
          "name" : "顾老二",
          "age" : 30,
          "from" : "gu",
          "desc" : "皮肤黑、武器长、性格直",
          "tags" : [
            "黑",
            "长",
            "直"
          ]
        },
        "highlight" : {
          "desc" : [
            "皮肤黑、武器长、<b class='key' style='color:red'>性</b><b class='key' style='color:red'>格</b><b class='key' style='color:red'>直</b>"
          ]
        }
      }
    ]
  }
}

```

# 十、ES之精确查询与模糊查询

-  term查询查找包含文档精确的倒排索引指定的词条。也就是精确查找。

##### term和match的区别是：match是经过analyer的，也就是说，文档首先被分析器给处理了。根据不同的分析器，分析的结果也稍显不同，然后再根据分词结果进行匹配。term则不经过分词，它是直接去倒排索引中查找了精确的值了。
```
#### 准备数据
PUT w1
{
  "mappings": {
    "doc": {
      "properties":{
        "t1":{
          "type": "text"
        },
        "t2": {
          "type": "keyword"
        }
      }
    }
  }
}

PUT w1/doc/1
{
  "t1": "hi single dog",
  "t2": "hi single dog"
}
```

- 对比两者的不同 (结果就不展示出来了，只展示结果的文字叙述)

```
# t1类型为text，会经过分词，match查询时条件也会经过分词，所以下面两种查询都能查到结果
GET w1/doc/_search
{
  "query": {
    "match": {
      "t1": "hi single dog" 
    }
  }
}

GET w1/doc/_search
{
  "query": {
    "match": {
      "t1": "hi" 
    }
  }
}

# t2类型为keyword类型，不会经过分词，match查询时条件会经过分词，所以只能当值为"hi single dog"时能查询到
GET w1/doc/_search
{
  "query": {
    "match": {
      "t2": "hi" 
    }
  }
}

GET w1/doc/_search
{
  "query": {
    "match": {
      "t2": "hi single dog" 
    }
  }
}

# t1类型为text，会经过分词，term查询时条件不会经过分词，所以只有当值为"hi"时能查询到
GET w1/doc/_search
{
  "query": {
    "term": {
      "t1": "hi single dog" 
    }
  }
}

GET w1/doc/_search
{
  "query": {
    "term": {
      "t1": "hi" 
    }
  }
}

# t2类型为keyword类型，不会经过分词，term查询时条件不会经过分词，所以只能当值为"hi single dog"时能查询到

GET w1/doc/_search
{
  "query": {
    "term": {
      "t2": "hi single dog" 
    }
  }
}

GET w1/doc/_search
{
  "query": {
    "term": {
      "t2": "hi" 
    }
  }
}
```

- 查找多个精确值（terms）

```
#### 第一个查询方式
GET test/doc/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "term": {
            "age":27
          }
        },{
          "term":{
            "age":28
          }
        }
      ]
    }
  }
}


# 第二个查询方式
GET test/doc/_search
{
  "query": {
    "terms": {
      "age": [
        "27",
        "28"
      ]
    }
  }
}

>>>两种方式的查询结果都是一下结果 
{
  "took" : 10,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 2,
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "test",
        "_type" : "doc",
        "_id" : "2",
        "_score" : 1.0,
        "_source" : {
          "name" : "wangfei",
          "age" : 27,
          "desc" : "热天还不让后人不认同"
        }
      },
      {
        "_index" : "test",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "name" : "wangjifei",
          "age" : 27,
          "desc" : "生活就像 茫茫海上"
        }
      }
    ]
  }
}
```


# 十一、ES的聚合查询avg、max、min、sum
```
####  数据准备

PUT zhifou/doc/1
{
  "name":"顾老二",
  "age":30,
  "from": "gu",
  "desc": "皮肤黑、武器长、性格直",
  "tags": ["黑", "长", "直"]
}

PUT zhifou/doc/2
{
  "name":"大娘子",
  "age":18,
  "from":"sheng",
  "desc":"肤白貌美，娇憨可爱",
  "tags":["白", "富","美"]
}

PUT zhifou/doc/3
{
  "name":"龙套偏房",
  "age":22,
  "from":"gu",
  "desc":"mmp，没怎么看，不知道怎么形容",
  "tags":["造数据", "真","难"]
}


PUT zhifou/doc/4
{
  "name":"石头",
  "age":29,
  "from":"gu",
  "desc":"粗中有细，狐假虎威",
  "tags":["粗", "大","猛"]
}

PUT zhifou/doc/5
{
  "name":"魏行首",
  "age":25,
  "from":"广云台",
  "desc":"仿佛兮若轻云之蔽月,飘飘兮若流风之回雪,mmp，最后竟然没有嫁给顾老二！",
  "tags":["闭月","羞花"]
}

GET zhifou/doc/_search
{
  "query": {
    "match_all": {}
  }
}
```

- 需求1、查询from是gu的人的平均年龄。

```
GET zhifou/doc/_search
{
  "query": {
    "match": {
      "from": "gu"
    }
  },
  "aggs": {
    "my_avg": {
      "avg": {
        "field": "age"
      }
    }
  },
  "_source": ["name", "age"]
}

>>>查询结果
{
  "took" : 83,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 3,
    "max_score" : 0.6931472,
    "hits" : [
      {
        "_index" : "zhifou",
        "_type" : "doc",
        "_id" : "4",
        "_score" : 0.6931472,
        "_source" : {
          "name" : "石头",
          "age" : 29
        }
      },
      {
        "_index" : "zhifou",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.2876821,
        "_source" : {
          "name" : "顾老二",
          "age" : 30
        }
      },
      {
        "_index" : "zhifou",
        "_type" : "doc",
        "_id" : "3",
        "_score" : 0.2876821,
        "_source" : {
          "name" : "龙套偏房",
          "age" : 22
        }
      }
    ]
  },
  "aggregations" : {
    "my_avg" : {
      "value" : 27.0
    }
  }
}
```
###### 上例中，首先匹配查询from是gu的数据。在此基础上做查询平均值的操作，这里就用到了聚合函数，其语法被封装在aggs中，而my_avg则是为查询结果起个别名，封装了计算出的平均值。那么，要以什么属性作为条件呢？是age年龄，查年龄的什么呢？是avg，查平均年龄。

##### 如果只想看输出的值，而不关心输出的文档的话可以通过size=0来控制
```
GET zhifou/doc/_search
{
  "query": {
    "match": {
      "from": "gu"
      }
    },
    "aggs":{
      "my_avg":{
        "avg": {
          "field": "age"
        }
      }
    },
    "size":0,
    "_source":["name","age"]
}

>>>查询结果
{
  "took" : 35,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 3,
    "max_score" : 0.0,
    "hits" : [ ]
  },
  "aggregations" : {
    "my_avg" : {
      "value" : 27.0
    }
  }
}
```

- 需求2、查询年龄的最大值

```
GET zhifou/doc/_search
{
  "query": {
    "match_all": {}
  },
  "aggs": {
    "my_max": {
      "max": {
        "field": "age"
      }
    }
  },
  "size": 0, 
  "_source": ["name","age","from"]
}

>>>查询结果
{
  "took" : 10,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 5,
    "max_score" : 0.0,
    "hits" : [ ]
  },
  "aggregations" : {
    "my_max" : {
      "value" : 30.0
    }
  }
}
```
- 需求3、查询年龄的最小值

```
GET zhifou/doc/_search
{
  "query": {
    "match_all": {}
  },
  "aggs": {
    "my_min": {
      "min": {
        "field": "age"
      }
    }
  },
  "size": 0, 
  "_source": ["name","age","from"]
}

>>>查询结果
{
  "took" : 2,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 5,
    "max_score" : 0.0,
    "hits" : [ ]
  },
  "aggregations" : {
    "my_min" : {
      "value" : 18.0
    }
  }
}
```
- 需求4、查询符合条件的年龄之和

```
GET zhifou/doc/_search
{
  "query": {
    "match": {
      "from": "gu"
    }
  },
    "aggs": {
    "my_sum": {
      "sum": {
        "field": "age"
      }
    }
  },
  "size": 0, 
  "_source": ["name","age","from"]
}

>>>查询结果
{
  "took" : 4,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 3,
    "max_score" : 0.0,
    "hits" : [ ]
  },
  "aggregations" : {
    "my_sum" : {
      "value" : 81.0
    }
  }
}
```


# 十二、ES的分组查询 

- 需求： 要查询所有人的年龄段，并且按照15~20，20~25,25~30分组，并且算出每组的平均年龄。

```
GET zhifou/doc/_search
{
  "size": 0, 
  "query": {
    "match_all": {}
  },
  "aggs": {
    "age_group": {
      "range": {
        "field": "age",
        "ranges": [
          {
            "from": 15,
            "to": 20
          },
          {
            "from": 20,
            "to": 25
          },
          {
            "from": 25,
            "to": 30
          }
        ]
      }
    }
  }
}

>>>查询结果
{
  "took" : 9,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 5,
    "max_score" : 0.0,
    "hits" : [ ]
  },
  "aggregations" : {
    "age_group" : {
      "buckets" : [
        {
          "key" : "15.0-20.0",
          "from" : 15.0,
          "to" : 20.0,
          "doc_count" : 1
        },
        {
          "key" : "20.0-25.0",
          "from" : 20.0,
          "to" : 25.0,
          "doc_count" : 1
        },
        {
          "key" : "25.0-30.0",
          "from" : 25.0,
          "to" : 30.0,
          "doc_count" : 2
        }
      ]
    }
  }
}
```

###### 上例中，在aggs的自定义别名age_group中，使用range来做分组，field是以age为分组，分组使用ranges来做，from和to是范围

- 接下来，我们就要对每个小组内的数据做平均年龄处理。

```
GET zhifou/doc/_search
{
  "size": 0, 
  "query": {
    "match_all": {}
  },
  "aggs": {
    "age_group": {
      "range": {
        "field": "age",
        "ranges": [
          {
            "from": 15,
            "to": 20
          },
          {
            "from": 20,
            "to": 25
          },
          {
            "from": 25,
            "to": 30
          }
        ]
      },
      "aggs": {
        "my_avg": {
          "avg": {
            "field": "age"
          }
        }
      }
    }
  }
}

>>>查询结果
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 5,
    "max_score" : 0.0,
    "hits" : [ ]
  },
  "aggregations" : {
    "age_group" : {
      "buckets" : [
        {
          "key" : "15.0-20.0",
          "from" : 15.0,
          "to" : 20.0,
          "doc_count" : 1,
          "my_avg" : {
            "value" : 18.0
          }
        },
        {
          "key" : "20.0-25.0",
          "from" : 20.0,
          "to" : 25.0,
          "doc_count" : 1,
          "my_avg" : {
            "value" : 22.0
          }
        },
        {
          "key" : "25.0-30.0",
          "from" : 25.0,
          "to" : 30.0,
          "doc_count" : 2,
          "my_avg" : {
            "value" : 27.0
          }
        }
      ]
    }
  }
}
```
> ES的聚合查询的总结：聚合函数的使用，一定是先查出结果，然后对结果使用聚合函数做处理
>
>  avg：求平均
> 
> max：最大值
> 
> min：最小值
> 
> sum：求和



# 十三、ES之Mappings
```
GET test

>>>查询结果
{
  "test" : {
    "aliases" : { },
    "mappings" : {
      "doc" : {
        "properties" : {
          "age" : {
            "type" : "long"
          },
          "desc" : {
            "type" : "text",
            "fields" : {
              "keyword" : {
                "type" : "keyword",
                "ignore_above" : 256
              }
            }
          },
          "name" : {
            "type" : "text",
            "fields" : {
              "keyword" : {
                "type" : "keyword",
                "ignore_above" : 256
              }
            }
          }
        }
      }
    },
    "settings" : {
      "index" : {
        "creation_date" : "1569133097594",
        "number_of_shards" : "5",
        "number_of_replicas" : "1",
        "uuid" : "AztO9waYQiyHvzP6dlk4tA",
        "version" : {
          "created" : "6080299"
        },
        "provided_name" : "test"
      }
    }
  }
}

```
##### 由返回结果可以看到，分为两大部分：
	第一部分关于t1索引类型相关的，包括该索引是否有别名aliases，然后就是mappings信息，
	包括索引类型doc，各字段的详细映射关系都收集在properties中。
	
	另一部分是关于索引t1的settings设置。包括该索引的创建时间，主副分片的信息，UUID等等。

#### 1. mappings 是什么？   
	映射就是在创建索引的时候，有更多定制的内容，更加的贴合业务场景。
	用来定义一个文档及其包含的字段如何存储和索引的过程。

#### 2. 字段的数据类型  
	简单类型如文本（text）、关键字（keyword）、日期（data）、整形（long）、双精度
	（double）、布尔（boolean）或ip。 可以是支持JSON的层次结构性质的类型，如对象或嵌套。
	或者一种特殊类型，如geo_point、geo_shape或completion。为了不同的目的，
	以不同的方式索引相同的字段通常是有用的。例如，字符串字段可以作为全文搜索的文本字段进行索引，
	也可以作为排序或聚合的关键字字段进行索引。或者，可以使用标准分析器、英语分析器和
	法语分析器索引字符串字段。这就是多字段的目的。大多数数据类型通过fields参数支持多字段。

- 一个简单的映射示例

```
PUT mapping_test
{
  "mappings": {
    "test1":{
      "properties":{
        "name":{"type": "text"},
        "age":{"type":"long"}
      }
    }
  }
}
```
###### 我们在创建索引PUT mapping_test1的过程中，为该索引定制化类型（设计表结构），添加一个映射类型test1；指定字段或者属性都在properties内完成。
```
GET mapping_test

>>>查询结果
{
  "mapping_test" : {
    "aliases" : { },
    "mappings" : {
      "test1" : {
        "properties" : {
          "age" : {
            "type" : "long"
          },
          "name" : {
            "type" : "text"
          }
        }
      }
    },
    "settings" : {
      "index" : {
        "creation_date" : "1570794586526",
        "number_of_shards" : "5",
        "number_of_replicas" : "1",
        "uuid" : "P4-trriPTxq-nJj89iYXZA",
        "version" : {
          "created" : "6080299"
        },
        "provided_name" : "mapping_test"
      }
    }
  }
}
```
###### 返回的结果中你肯定很熟悉！映射类型是test1，具体的属性都被封装在properties中。



#### 3. ES mappings之dynamic的三种状态
- 一般的，mapping则又可以分为动态映射（dynamic mapping）和静态（显示）映射（explicit mapping）和精确（严格）映射（strict mappings），具体由dynamic属性控制。默认为动态映射

```
##### 默认为动态映射
PUT test4
{
  "mappings": {
    "doc":{
      "properties": {
        "name": {
          "type": "text"
        },
        "age": {
          "type": "long"
        }
      }
    }
  }
}

GET test4/_mapping
>>>查询结果
{
  "test4" : {
    "mappings" : {
      "doc" : {
        "properties" : {
          "age" : {
            "type" : "long"
          },
          "name" : {
            "type" : "text"
          },
          "sex" : {
            "type" : "text",
            "fields" : {
              "keyword" : {
                "type" : "keyword",
                "ignore_above" : 256
              }
            }
          }
        }
      }
    }
  }
}

#####添加数据
PUT test4/doc/1
{
  "name":"wangjifei",
  "age":"18",
  "sex":"不详"
}

#####查看数据
GET test4/doc/_search
{
  "query": {
    "match_all": {}
  }
}

>>>查询结果
{
  "took" : 8,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "test4",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "name" : "wangjifei",
          "age" : "18",
          "sex" : "不详"
        }
      }
    ]
  }
}
```

- 测试静态映射：当elasticsearch察觉到有新增字段时，因为dynamic:false的关系，会忽略该字段，但是仍会存储该字段。

```
#####创建静态mapping
PUT test5
{
  "mappings": {
    "doc":{
      "dynamic":false,
      "properties": {
        "name": {
          "type": "text"
        },
        "age": {
          "type": "long"
        }
      }
    }
  }
}

#####插入数据
PUT test5/doc/1
{
  "name":"wangjifei",
  "age":"18",
  "sex":"不详"
}

####条件查询
GET test5/doc/_search
{
  "query": {
    "match": {
      "sex": "不详"
    }
  }
}

>>>查询结果
{
  "took" : 9,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 0,
    "max_score" : null,
    "hits" : [ ]
  }
}

#####查看所有数据
GET /test5/doc/_search
{
  "query": {
    "match_all": {}
  }
}

>>>查询结果
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "test5",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "name" : "wangjifei",
          "age" : "18",
          "sex" : "不详"
        }
      }
    ]
  }
}

```


- 测试严格映射：当elasticsearch察觉到有新增字段时，因为dynamic:strict 的关系，就会报错，不能插入成功。

```
#####创建严格mapping
PUT test6
{
  "mappings": {
    "doc":{
      "dynamic":"strict",
      "properties": {
        "name": {
          "type": "text"
        },
        "age": {
          "type": "long"
        }
      }
    }
  }
}

#####插入数据
PUT test6/doc/1
{
  "name":"wangjifei",
  "age":"18",
  "sex":"不详"
}

>>>插入结果
{
  "error": {
    "root_cause": [
      {
        "type": "strict_dynamic_mapping_exception",
        "reason": "mapping set to strict, dynamic introduction of [sex] within [doc] is not allowed"
      }
    ],
    "type": "strict_dynamic_mapping_exception",
    "reason": "mapping set to strict, dynamic introduction of [sex] within [doc] is not allowed"
  },
  "status": 400
}
```

>小结：  动态映射（dynamic：true）：动态添加新的字段（或缺省）。 静态映射（dynamic：false）：忽略新的字段。在原有的映射基础上，当有新的字段时，不会主动的添加新的映射关系，只作为查询结果出现在查询中。        严格模式（dynamic：strict）：如果遇到新的字段，就抛出异常。一般静态映射用的较多。就像HTML的img标签一样，src为自带的属性，你可以在需要的时候添加id或者class属性。当然，如果你非常非常了解你的数据，并且未来很长一段时间不会改变，strict不失为一个好选择。


#### 4. ES之mappings的 index 属性
- index属性默认为true，如果该属性设置为false，那么，elasticsearch不会为该属性创建索引，也就是说无法当做主查询条件。

```
PUT test7
{
  "mappings": {
    "doc": {
      "properties": {
        "name": {
          "type": "text",
          "index": true
        },
        "age": {
          "type": "long",
          "index": false
        }
      }
    }
  }
}

####插入数据
PUT test7/doc/1
{
  "name":"wangjifei",
  "age":18
}

####条件查询数据
GET test7/doc/_search
{
  "query": {
    "match": {
      "name": "wangjifei"
    }
  }
}

>>>查询结果
{
  "took" : 18,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "test7",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.2876821,
        "_source" : {
          "name" : "wangjifei",
          "age" : 18
        }
      }
    ]
  }
}

#####条件查询
GET test7/doc/_search
{
  "query": {
    "match": {
      "age": 18
    }
  }
}

>>>查询结果
{
  "error": {
    "root_cause": [
      {
        "type": "query_shard_exception",
        "reason": "failed to create query: {\n  \"match\" : {\n    \"age\" : {\n      \"query\" : 18,\n      \"operator\" : \"OR\",\n      \"prefix_length\" : 0,\n      \"max_expansions\" : 50,\n      \"fuzzy_transpositions\" : true,\n      \"lenient\" : false,\n      \"zero_terms_query\" : \"NONE\",\n      \"auto_generate_synonyms_phrase_query\" : true,\n      \"boost\" : 1.0\n    }\n  }\n}",
        "index_uuid": "fzN9frSZRy2OzinRjeMKGA",
        "index": "test7"
      }
    ],
    "type": "search_phase_execution_exception",
    "reason": "all shards failed",
    "phase": "query",
    "grouped": true,
    "failed_shards": [
      {
        "shard": 0,
        "index": "test7",
        "node": "INueKtviRpO1dbNWngcjJA",
        "reason": {
          "type": "query_shard_exception",
          "reason": "failed to create query: {\n  \"match\" : {\n    \"age\" : {\n      \"query\" : 18,\n      \"operator\" : \"OR\",\n      \"prefix_length\" : 0,\n      \"max_expansions\" : 50,\n      \"fuzzy_transpositions\" : true,\n      \"lenient\" : false,\n      \"zero_terms_query\" : \"NONE\",\n      \"auto_generate_synonyms_phrase_query\" : true,\n      \"boost\" : 1.0\n    }\n  }\n}",
          "index_uuid": "fzN9frSZRy2OzinRjeMKGA",
          "index": "test7",
          "caused_by": {
            "type": "illegal_argument_exception",
            "reason": "Cannot search on field [age] since it is not indexed."
          }
        }
      }
    ]
  },
  "status": 400
}
```


#### 5. ES 之 mappings 的copy_to属性
```
PUT test8
{
  "mappings": {
    "doc": {
      "dynamic":false,
      "properties": {
        "first_name":{
          "type": "text",
          "copy_to": "full_name"
        },
        "last_name": {
          "type": "text",
          "copy_to": "full_name"
        },
        "full_name": {
          "type": "text"
        }
      }
    }
  }
}

#####插入数据
PUT test8/doc/1
{
  "first_name":"tom",
  "last_name":"ben"
}
PUT test8/doc/2
{
  "first_name":"john",
  "last_name":"smith"
}

#####查询所有
GET test8/doc/_search
{
  "query": {
    "match_all": {}
  }
}

>>>查询结果
{
  "took" : 4,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 2,
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "test8",
        "_type" : "doc",
        "_id" : "2",
        "_score" : 1.0,
        "_source" : {
          "first_name" : "john",
          "last_name" : "smith"
        }
      },
      {
        "_index" : "test8",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "first_name" : "tom",
          "last_name" : "ben"
        }
      }
    ]
  }
}

#####条件查询
GET test8/doc/_search
{
  "query": {
    "match": {
      "first_name": "tom"
    }
  }
}

>>>查询结果
{
  "took" : 2,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "test8",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.2876821,
        "_source" : {
          "first_name" : "tom",
          "last_name" : "ben"
        }
      }
    ]
  }
}

######条件查询
GET test8/doc/_search
{
  "query": {
    "match": {
      "full_name": "ben"
    }
  }
}

>>>查询结果
{
  "took" : 3,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "test8",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.2876821,
        "_source" : {
          "first_name" : "tom",
          "last_name" : "ben"
        }
      }
    ]
  }
}
```

###### 上例中，我们将first_name和last_name都复制到full_name中。并且使用full_name查询也返回了结果

- 既要查询tom还要查询smith该怎么办？

```
GET test8/doc/_search
{
  "query": {
    "match": {
      "full_name": {
        "query": "tom smith",
        "operator": "or"
      }
    }
  }
}

>>>查询结果
{
  "took" : 3,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 2,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "test8",
        "_type" : "doc",
        "_id" : "2",
        "_score" : 0.2876821,
        "_source" : {
          "first_name" : "john",
          "last_name" : "smith"
        }
      },
      {
        "_index" : "test8",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.2876821,
        "_source" : {
          "first_name" : "tom",
          "last_name" : "ben"
        }
      }
    ]
  }
}
```
###### operator参数为多个条件的查询关系也可以是and
- 上面的查询还可以简写成一下：

```
GET test8/doc/_search
{
  "query": {
    "match": {
      "full_name": "tom smith"
    }
  }
}
```
- copy_to还支持将相同的属性值复制给不同的字段。

```
PUT test9
{
  "mappings": {
    "doc": {
      "dynamic":false,
      "properties": {
        "first_name":{
          "type": "text",
          "copy_to": ["full_name1","full_name2"]
        },
        "last_name": {
          "type": "text",
          "copy_to": ["full_name1","full_name2"]
        },
        "full_name1": {
          "type": "text"
        },
        "full_name2":{
          "type":"text"
        }
      }
    }
  }
}

####插入数据
PUT test9/doc/1
{
  "first_name":"tom",
  "last_name":"ben"
}

PUT test9/doc/2
{
  "first_name":"john",
  "last_name":"smith"
}

####条件查询
GET test9/doc/_search
{
  "query": {
    "match": {
      "full_name1": "tom smith"
    }
  }
}

>>>查询结果
{
  "took" : 7,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 2,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "test9",
        "_type" : "doc",
        "_id" : "2",
        "_score" : 0.2876821,
        "_source" : {
          "first_name" : "john",
          "last_name" : "smith"
        }
      },
      {
        "_index" : "test9",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.2876821,
        "_source" : {
          "first_name" : "tom",
          "last_name" : "ben"
        }
      }
    ]
  }
}

#####条件查询
GET test9/doc/_search
{
  "query": {
    "match": {
      "full_name2": "tom smith"
    }
  }
}

>>>查询结果
{
  "took" : 7,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 2,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "test9",
        "_type" : "doc",
        "_id" : "2",
        "_score" : 0.2876821,
        "_source" : {
          "first_name" : "john",
          "last_name" : "smith"
        }
      },
      {
        "_index" : "test9",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.2876821,
        "_source" : {
          "first_name" : "tom",
          "last_name" : "ben"
        }
      }
    ]
  }
}
```
###### full_name1 full_name2两个字段都可以查出来

#### 6. ES 之mappings的对象属性
- 首先先看看ES自动创建的mappings

```
PUT test10/doc/1
{
  "name":"wangjifei",
  "age":18,
  "info":{
    "addr":"北京",
    "tel":"18500327026"
  }
}

GET test10

>>>查询结果
{
  "test10" : {
    "aliases" : { },
    "mappings" : {
      "doc" : {
        "properties" : {
          "age" : {
            "type" : "long"
          },
          "info" : {
            "properties" : {
              "addr" : {
                "type" : "text",
                "fields" : {
                  "keyword" : {
                    "type" : "keyword",
                    "ignore_above" : 256
                  }
                }
              },
              "tel" : {
                "type" : "text",
                "fields" : {
                  "keyword" : {
                    "type" : "keyword",
                    "ignore_above" : 256
                  }
                }
              }
            }
          },
          "name" : {
            "type" : "text",
            "fields" : {
              "keyword" : {
                "type" : "keyword",
                "ignore_above" : 256
              }
            }
          }
        }
      }
    },
    "settings" : {
      "index" : {
        "creation_date" : "1570975011394",
        "number_of_shards" : "5",
        "number_of_replicas" : "1",
        "uuid" : "YvMGDHxkSri0Lgx6GGXiNw",
        "version" : {
          "created" : "6080299"
        },
        "provided_name" : "test10"
      }
    }
  }
}
```

- 现在如果要以info中的tel为条件怎么写查询语句呢？

```
GET test10/doc/_search
{
  "query": {
    "match": {
      "info.tel": "18500327026"
    }
  }
}

>>>查询结果
{
  "took" : 5,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "test10",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.2876821,
        "_source" : {
          "name" : "wangjifei",
          "age" : 18,
          "info" : {
            "addr" : "北京",
            "tel" : "18500327026"
          }
        }
      }
    ]
  }
}
```
###### info既是一个属性，也是一个对象，我们称为info这类字段为对象型字段。该对象内又包含addr和tel两个字段，如上例这种以嵌套内的字段为查询条件的话，查询语句可以以字段点子字段的方式来写即可

#### 7. ES之mappings的settings 设置
- 在创建一个索引的时候，我们可以在settings中指定分片信息：

```
PUT test11
{
  "mappings": {
    "doc": {
      "properties": {
        "name": {
          "type": "text"
        }
      }
    }
  }, 
  "settings": {
    "number_of_replicas": 1,
    "number_of_shards": 5
  }
}
```
###### number_of_shards是主分片数量（每个索引默认5个主分片），而number_of_replicas是复制分片，默认一个主分片搭配一个复制分片。

#### 8. ES 之mappings的ignore_above参数
- ignore_above参数仅针对于keyword类型有用

```
# 这样设置是会报错的
PUT test12
{
  "mappings": {
    "doc": {
      "properties": {
        "name": {
          "type": "text",
          "ignore_above":5
        }
      }
    }
  }
}

>>>显示结果
{
  "error": {
    "root_cause": [
      {
        "type": "mapper_parsing_exception",
        "reason": "Mapping definition for [name] has unsupported parameters:  [ignore_above : 5]"
      }
    ],
    "type": "mapper_parsing_exception",
    "reason": "Failed to parse mapping [doc]: Mapping definition for [name] has unsupported parameters:  [ignore_above : 5]",
    "caused_by": {
      "type": "mapper_parsing_exception",
      "reason": "Mapping definition for [name] has unsupported parameters:  [ignore_above : 5]"
    }
  },
  "status": 400
}
```
```
##### 正确的打开方式
PUT test12
{
  "mappings": {
    "doc": {
      "properties": {
        "name": {
          "type": "keyword",
          "ignore_above":5
        }
      }
    }
  }
}

PUT test12/doc/1
{
  "name":"wangjifei"
}

##### 这样查询能查出结果
GET test12/doc/_search
{
  "query": {
    "match_all": {}
  }
}

>>>查询结果
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "test12",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "name" : "wangjifei"
        }
      }
    ]
  }
}


######这样查询不能查询出结果
GET test12/doc/_search
{
  "query": {
    "match": {
      "name": "wangjifei"
    }
  }
}

>>>查询结果
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 0,
    "max_score" : null,
    "hits" : [ ]
  }
}
```
###### 上面的例子证明超过ignore_above设定的值后会被存储但不会建立索引

- 那么如果字符串的类型是text时能用ignore_above吗，答案是能，但要特殊设置：

```
PUT test13
{
  "mappings": {
    "doc":{
      "properties":{
        "name1":{
          "type":"keyword",
          "ignore_above":5
        },
        "name2":{
          "type":"text",
          "fields":{
            "keyword":{
              "type":"keyword",
              "ignore_above": 10
            }
          }
        }
      }
    }
  }
}

PUT test13/doc/1
{
  "name1":"wangfei",
  "name2":"wangjifei hello"
}

##### 能查出来
GET test13/doc/_search
{
  "query": {
    "match_all": {}
  }
}

>>>查询结果
{
  "took" : 4,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "test13",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "name1" : "wangfei",
          "name2" : "wangjifei hello"
        }
      }
    ]
  }
}

##### 通过name1 字段查不出来，因为设置的是keyword类型 限制了5个字符的长度，
##### 存储的值超过了最大限制
GET test13/doc/_search
{
  "query": {
    "match": {
      "name1": "wangfei"
    }
  }
}

>>>查询结果
{
  "took" : 2,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 0,
    "max_score" : null,
    "hits" : [ ]
  }
}

##### 通过name2 字段能查出来，虽然限制了5个字符的长度，存储的值超过了最大限制，但是，
##### 当字段类型设置为text之后，ignore_above参数的限制就失效了。（了解就好，意义不大）
GET test13/doc/_search
{
  "query": {
    "match": {
      "name2": "wangjifei"
    }
  }
}

>>>查询结果
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "test13",
        "_type" : "doc",
        "_id" : "1",
        "_score" : 0.2876821,
        "_source" : {
          "name1" : "wangfei",
          "name2" : "wangjifei hello"
        }
      }
    ]
  }
}
```


