# ajax-paging（PHP+AJAX+JQUERY分页，实现局部刷新表格、列表、div层等）
# 目录结构说明
    api
      --- getData.php --- <核心逻辑接口>
      --- objmysql.class.php --- <数据库操作类【单例】>
    static
      --- css
                 ---
           js
                 ---  bootstrap3.3
                      bootstable.js --- <核心js，所有逻辑在里面>
                      jquery.min.js
            images
                 ---
     index.html --- <入口文件，里面写了调用方法>
# DEMO说明
    本demo只是基本实现了效果，作者的目的是为了学习ajax分页的原理，因为有很多开源项目都设计到（bootstrap的bootstarpTable, 信呼系统自己的bootstable.....）。也就是说代码写的不好，该吐槽就吐槽吧！