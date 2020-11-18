[4W字长文带你深度解锁Webpack系列（基础篇）](https://segmentfault.com/a/1190000021953371)

# npm warn package.json @1.0.0 no repository field

npm warn package.json @1.0.0 no repository field.
看字面意思大概是package.json里缺少repository字段，也就是说缺少项目的仓库字段

{
    ...
    "repository": {
        "type": "git",
        "url": "http://baidu.com"
    },
    ...
}
但作为测试项目或者练习用，只需在package.json里面做如下配置即可:

{
    ...
    "private": true,
    ...
}
以这种方式把项目声明为私有。