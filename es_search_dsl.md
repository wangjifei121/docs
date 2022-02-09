### 分词测试
```
GET industry_knowledge/_analyze
{
  "field": "name",
  "text": ["我想订张机票"]
}
```

### 指定字段分词测试
```
GET industry_knowledge/_analyze
{
  "field": "name", 
  "text": ["我想订张机票"]
}
```

### 指定字段值累加1
```
POST industry_knowledge/doc/_update_by_query
{
    "query": {
        "match": {
            "_id": "sEUpL3sBNqQYC4otj5gY"
        }
    },
    "script": {
        "lang": "painless",
        "inline": "if (ctx._source.like == null) {ctx._source.like = 0} ctx._source.like +=1"
    }
}
```
### 高亮查询
```
GET industry_knowledge/doc/_search
{
  "query": {
    "match": {
      "name": "机票语音说明"
    }
  },
  "highlight": {
    "pre_tags": [
      "<h1>",
      "<h3>"
    ],
    "post_tags": [
      "</h1>",
      "</h3>"
    ],
    "fields": {
      "name": {"fragment_size":1}
    }
  }
}
```
### nested基本查询
```
GET industry_graph/doc/_search
{
  "query": {
    "nested": {
      "path": "relations",
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "relations.rel": "20"
              }
            }
          ]
        }
      }
    }
  }
}
```
### nested bool查询
```
GET industry_graph/doc/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "label": {
              "value": "2"
            }
          }
        },
        {
          "term": {
            "tenant": {
              "value": "1"
            }
          }
        },
        {
          "nested": {
            "path": "relations",
            "query": {
              "bool": {
                "must": [
                  {
                    "term": {
                      "relations.rel": {
                        "value": "11"
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  }
}
```

### nested 聚合查询
```
GET industry_graph/doc/_search
{
  "size": 0,
  "aggs": {
    "nest_rel": {
      "nested": {
        "path": "relations"
      },
      "aggs": {
        "rel_count": {
          "value_count": {
            "field": "relations.rel_node"
          }
        }
      }
    },
    "nest_pro": {
      "nested": {
        "path": "props"
      },
      "aggs": {
        "pro_count": {
          "value_count": {
            "field": "props.pro_val"
          }
        }
      }
    }
  }
}

```

### 查询脚本修改
```
POST industry_graph/doc/_update_by_query
{
    "query":{
        "bool":{
            "must":[
                {
                    "term":{
                        "tenant":{
                            "value":"1"
                        }
                    }
                },
                {
                    "term":{
                        "label":{
                            "value":"2"
                        }
                    }
                },
                {
                    "nested":{
                        "path":"relations",
                        "query":{
                            "bool":{
                                "must":[
                                    {
                                        "term":{
                                            "relations.rel_node":{
                                                "value":"年年金_14"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            ]
        }
    },
    "script":{
        "source":"for (int i = 0;i <= ctx._source['relations'].size() - 1;i++){if(ctx._source.relations[i].rel_node=='年年金_14'){ctx._source.relations[i].rel_node='年年金_1400'}}",
        "lang":"painless"
    }
}

POST industry_graph/doc/_update_by_query
{
    "query":{
        "bool":{
            "must":[
                {
                    "term":{
                        "tenant":{
                            "value":"1"
                        }
                    }
                },
                {
                    "term":{
                        "label":{
                            "value":"2"
                        }
                    }
                },
                {
                    "nested":{
                        "path":"relations",
                        "query":{
                            "bool":{
                                "must":[
                                    {
                                        "term":{
                                            "relations.rel":{
                                                "value":"15"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            ]
        }
    },
    "script":{
        "source":"List new_relations = [];for (int i = 0;i <= ctx._source['relations'].size() - 1;i++){if(ctx._source.relations[i].rel!=15){new_relations.add(ctx._source.relations[i])}} ctx._source.relations = new_relations",
        "lang":"painless"
    }
}

```

### 脚本更新数据优化写法
```
POST industry_graph/doc/_update_by_query
{
  "query": {
    "bool": {
      "filter": [
        {
          "term": {
            "_id": "qqq"
          }
        }
      ]
    }
  },
  "script": {
    "inline": "for (int i = 0;i <= ctx._source[params.path].size() - 1;i++){if(ctx._source[params.path][i][params.field]==params.field_val){ctx._source[params.path][i]=params.value}}",
    "lang": "painless",
    "params": {
      "path": "props",
      "field": "pro_name",
      "field_val": "伤残判定条件",
      "value": {
        "pro_name": "身故条件",
        "pro_val": "按照国家统一评定伤残登记标准来划分",
        "extract": ""
      }
    }
  }
}
```
### 指定ID修改字段值
```
POST industry_graph_task_report/doc/Xfh0-n0B5AdzH4DLFQNI/_update
{
  "doc":{
    "latest_news":"生命安顺康伴意外伤害保险"
  }
}
```

### es字符串替换示例
```
POST industry_knowledge/doc/_update_by_query
{
  "query": {
    "match": {
      "path":"1-2"
    }
  },
  "script": {
    "source": """ctx._source.intent=ctx._source.intent.replace('60','80')""",
    "lang": "painless"
  }
}
```
