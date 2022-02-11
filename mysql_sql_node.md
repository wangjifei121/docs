### 联表条件查询更新sql
`UPDATE intent_industryintentversion v LEFT JOIN intent_industryintent i on v.intent_id=i.id set v.threshold=70 where i.path='1-2'`
