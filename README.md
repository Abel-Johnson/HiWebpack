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


[万字长文带你深度解锁Webpack系列(进阶篇)](https://segmentfault.com/a/1190000022041106)

# 按需加载
很多时候我们不需要一次性加载所有的JS文件，而应该在不同阶段去加载所需要的代码。webpack内置了强大的分割代码的功能可以实现按需加载。

比如，我们在点击了某个按钮之后，才需要使用使用对应的JS文件中的代码，需要使用 import() 语法：

document.getElementById('btn').onclick = function() {
    import('./handle').then(fn => fn.default());
}
import() 语法，需要 @babel/plugin-syntax-dynamic-import 的插件支持，但是因为当前 @babel/preset-env 预设中已经包含了 @babel/plugin-syntax-dynamic-import，因此我们不需要再单独安装和配置。

webpack 遇到 import(****) 这样的语法的时候，会这样处理：

以** 为入口新生成一个 Chunk
当代码执行到 import 所在的语句时，才会加载该 Chunk 所对应的文件（如这里的1.bundle.8bf4dc.js）
大家可以在浏览器中的控制台中，在 Network 的 Tab页 查看文件加载的情况，只有点击之后，才会加载对应的 JS 。





10.利用webpack解决跨域问题
假设前端在3000端口，服务端在4000端口，我们通过 webpack 配置的方式去实现跨域。

首先，我们在本地创建一个 server.js：

let express = require('express');

let app = express();

app.get('/api/user', (req, res) => {
    res.json({name: '刘小夕'});
});

app.listen(4000);
执行代码(run code)，现在我们可以在浏览器中访问到此接口: http://localhost:4000/api/user。

在 index.js 中请求 /api/user，修改 index.js 如下:

//需要将 localhost:3000 转发到 localhost:4000（服务端） 端口
fetch("/api/user")
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => console.log(err));
我们希望通过配置代理的方式，去访问 4000 的接口。

配置代理
修改 webpack 配置:

//webpack.config.js
module.exports = {
    //...
    devServer: {
        proxy: {
            "/api": "http://localhost:4000"
        }
    }
}
重新执行 npm run dev，可以看到控制台打印出来了 {name: "刘小夕"}，实现了跨域。

大多情况，后端提供的接口并不包含 /api，即：/user，/info、/list 等，配置代理时，我们不可能罗列出每一个api。

修改我们的服务端代码，并重新执行。

//server.js
let express = require('express');

let app = express();

app.get('/user', (req, res) => {
    res.json({name: '刘小夕'});
});

app.listen(4000);
尽管后端的接口并不包含 /api，我们在请求后端接口时，仍然以 /api 开头，在配置代理时，去掉 /api，修改配置:

//webpack.config.js
module.exports = {
    //...
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                pathRewrite: {
                    '/api': ''
                }
            }
        }
    }
}
重新执行 npm run dev，在浏览器中访问： http://localhost:3000/，控制台中也打印出了{name: "刘小夕"}，跨域成功，

11.前端模拟数据
简单数据模拟
module.exports = {
    devServer: {
        before(app) {
            app.get('/user', (req, res) => {
                res.json({name: '刘小夕'})
            })
        }
    }
}
在 src/index.js 中直接请求 /user 接口。

fetch("user")
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => console.log(err));
使用 mocker-api mock数据接口
mocker-api 为 REST API 创建模拟 API。在没有实际 REST API 服务器的情况下测试应用程序时，它会很有用。

安装 mocker-api:
npm install mocker-api -D
在项目中新建mock文件夹，新建 mocker.js.文件，文件如下:
module.exports = {
    'GET /user': {name: '刘小夕'},
    'POST /login/account': (req, res) => {
        const { password, username } = req.body
        if (password === '888888' && username === 'admin') {
            return res.send({
                status: 'ok',
                code: 0,
                token: 'sdfsdfsdfdsf',
                data: { id: 1, name: '刘小夕' }
            })
        } else {
            return res.send({ status: 'error', code: 403 })
        }
    }
}
修改 webpack.config.base.js:
const apiMocker = require('mocker-api');
module.export = {
    //...
    devServer: {
        before(app){
            apiMocker(app, path.resolve('./mock/mocker.js'))
        }
    }
}
这样，我们就可以直接在代码中像请求后端接口一样对mock数据进行请求。

重启 npm run dev，可以看到，控制台成功打印出来 {name: '刘小夕'}
我们再修改下 src/index.js，检查下POST接口是否成功
//src/index.js
fetch("/login/account", {
    method: "POST",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        username: "admin",
        password: "888888"
    })
})
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => console.log(err));
可以在控制台中看到接口返回的成功的数据。

进阶篇就到这里结束啦，下周约优化篇。
