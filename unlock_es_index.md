```
#! /usr/bin/env python
# -*- coding: utf-8 -*-
# @file: main.py
# Date: 2021/11/25


def unlock():
    es_indexs = ['corpus', 'train_corpus', 'knowledge_graph', 'keyword', 'general_chat', 'industry_chat', 'robot_chat',
                 'general_knowledge', 'industry_knowledge', 'robot_knowledge', 'general_graph', 'industry_graph',
                 'robot_graph', 'general_graph_task_report', 'industry_graph_task_report', 'robot_graph_task_report',
                 'branch_info', 'rule_model_task_report', 'rule_model_task_label_report',
                 'rule_model_task_label_detail_report', 'complain_analysis_task_report',
                 'talk_classification_task_report', 'paragraph_discrimination_report',
                 'paragraph_discrimination_details', 'emotion_model_task_report', 'hot_words_task_report',
                 'knowledge_graph_summary_report', 'knowledge_graph_task_detail', 'text_filter_task_report',
                 'text_extend_task_report', 'text_cluster_task_report', 'text_classification_task_report',
                 'call_summary_task_report', 'summary_of_corpus_analysis_results', 'model_call_information',
                 'agent_verbal_trick_task_report', 'agent_verbal_trick_task_report_details']

    base_url = 'http://172.20.97.67:9200/'
    check_url = base_url + "{}/_settings?pretty"
    modify_url = base_url + "{}/_settings"
    headers = {'Content-Type': 'application/json'}
    data = {'index.blocks.read_only_allow_delete': None}
    for name in es_indexs:
        print('>>>>>>>>>>>>>><<<<<<<<<<<<<<<<')
        # 检查
        response = requests.get(check_url.format(name))
        if response.status_code == 200:
            print(json.loads(response.content))
        # 修改
        response = requests.put(modify_url.format(name), data=json.dumps(data), headers=headers)
        if response.status_code == 200:
            print(json.loads(response.content))
        # 复查
        response = requests.get(check_url.format(name))
        if response.status_code == 200:
            print(json.loads(response.content))


if __name__ == '__main__':
    import json
    import requests

    unlock()
```
