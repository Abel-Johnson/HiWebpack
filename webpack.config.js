//webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isDev = process.env.NODE_ENV === 'development';
const config = require('./public/config')[isDev ? 'dev' : 'build'];
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');

/*
test 字段是匹配规则，针对符合规则的文件进行处理。

use 字段有几种写法

可以是一个字符串，例如上面的 use: 'babel-loader'
use 字段可以是一个数组，例如处理CSS文件是，use: ['style-loader', 'css-loader']
use 数组的每一项既可以是字符串也可以是一个对象，当我们需要在webpack 的配置文件中对 loader 进行配置，就需要将其编写为一个对象，并且在此对象的 options 字段中进行配置
*/
module.exports = smp.wrap({
  /*
  development：将 process.env.NODE_ENV 的值设置为 development，启用 NamedChunksPlugin 和 NamedModulesPlugin
production：将 process.env.NODE_ENV 的值设置为 production，启用 FlagDependencyUsagePlugin, FlagIncludedChunksPlugin, ModuleConcatenationPlugin, NoEmitOnErrorsPlugin, OccurrenceOrderPlugin, SideEffectsFlagPlugin 和 UglifyJsPlugin

npx webpack --mode=development  => npx webpack
*/
  mode: isDev ? 'development' : 'production',
  entry: [
    // './src/polyfills.js',
    './src/index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'), //必须是绝对路径
    filename: 'bundle.[hash:6].js',
    publicPath: '/' //通常是CDN地址, 你最终编译出来的代码部署在 CDN 上，资源的地址为: 'https://AAA/BBB/YourProject/XXX'，那么可以将生产的 publicPath 配置为: //AAA/BBB/。
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ["@babel/preset-env"],
            plugins: [
              [
                "@babel/plugin-transform-runtime",
                {
                  "corejs": 3
                }
              ]
            ]
          }
        },
        // exclude: /node_modules/ //排除 node_modules 目录
        include: [path.resolve(__dirname, 'src')]

      },
      {
        test: /\.(le|c)ss$/, //webpack 不能直接处理 css，需要借助 loader。如果是 .css，我们需要的 loader 通常有： style-loader、css-loader，考虑到兼容性问题，还需要 postcss-loader，而如果是 less 或者是 sass 的话，还需要 less-loader 和 sass-loader，这里配置一下 less 和 css 文件(sass 的话，使用 sass-loader即可):
        /**
         * style-loader 动态创建 style 标签，将 css 插入到 head 中.
          css-loader 负责处理 @import 等语句。
          postcss-loader 和 autoprefixer，自动生成浏览器兼容性前缀 —— 2020了，应该没人去自己徒手去写浏览器前缀了吧
          less-loader 负责处理编译 .less 文件,将其转为 css
         *
        */

        //loader 的执行顺序是从右向左执行的，也就是后面的 loader 先执行，上面 loader 的执行顺序为: less-loader ---> postcss-loader ---> css-loader ---> style-loader
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              // ident: "postcss",
              postcssOptions: {
                plugins: () => [
                  require('autoprefixer')()
                ]
              }
            }
          },
          'less-loader'
        ],
        // exclude: /node_modules/
        include: [path.resolve(__dirname, 'src')]

      },
      {
        test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10240, //10K,即资源大小小于 10K 时，将资源转换为 base64，超过 10K，将图片拷贝到 dist 目录。将资源转换为 base64 可以减少网络请求次数，但是 base64 数据较大，如果太多的资源是 base64，会导致加载变慢，因此设置 limit 值时，需要二者兼顾。
              esModule: false, //否则，< img src={ require('XXX.jpg') } /> 会出现 < img src=[Module Object] />
              name: '[name]_[hash:6].[ext]', // a5f7c0sd33sd33.. => thor_a5f7c0.jpeg
              outputPath: 'assets' // 当本地资源较多时，我们有时会希望它们能打包在一个文件夹下
            }
          }
        ],
        // exclude: /node_modules/
        include: [path.resolve(__dirname, 'images')]

      },
      // {
      //   test: /.html$/,
      //   use: 'html-withimg-loader'
      // }
    ]
  },
  plugins: [
    //数组 放着所有的webpack插件
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html', //打包后的文件名
      config: config.template,
      minify: {
        removeAttributeQuotes: false, //是否删除属性的双引号
        collapseWhitespace: false, //是否折叠空白
      },
      chunks: ['index']
      // hash: true //是否加上hash，默认是 false
    }),
    new BundleAnalyzerPlugin({
      analyzerPort: 8888,
      openAnalyzer: false
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash:5].css' //个人习惯将css文件放在单独目录下
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**'] //不删除dll目录下的文件(我们并不希望整个 dist 目录都被清空，比如，我们不希望，每次打包的时候，都删除 dll 目录，以及 dll 目录下的文件或子目录)
    }),//每次打包前清空dist目录
    new OptimizeCssPlugin()

  ],
  //关于 webpack-dev-server 更多的配置: 'https://webpack.js.org/configuration/dev-server/'
  devServer: {
    port: '3000', //默认是8080
    quiet: false, //默认不启用, 启用 quiet 后，除了初始启动信息之外的任何内容都不会被打印到控制台。这也意味着来自 webpack 的错误或警告在控制台不可见 ———— 我是不会开启这个的，看不到错误日志，还搞个锤子
    inline: true, //默认开启 inline 模式，如果设置为false,开启 iframe 模式
    stats: "errors-only", //终端仅打印 error, "errors-only" ， 终端中仅打印出 error，注意当启用了 quiet 或者是 noInfo 时，此属性不起作用。 ————— 这个属性个人觉得很有用，尤其是我们启用了 eslint 或者使用 TS进行开发的时候，太多的编译信息在终端中，会干扰到我们。
    overlay: false, //默认不启用, 启用 overlay 后，当编译出错时，会在浏览器窗口全屏输出错误，默认是关闭的。
    clientLogLevel: "silent", //日志等级, 当使用内联模式时，在浏览器的控制台将显示消息，如：在重新加载之前，在一个错误之前，或者模块热替换启用时。如果你不喜欢看这些信息，可以将其设置为 silent (none 即将被移除)。
    compress: true //是否启用 gzip 压缩
  },
  devtool: 'cheap-module-eval-source-map' //开发环境下使用, 生产环境可以使用 none 或者是 source-map，使用 source-map 最终会单独打包出一个 .map 文件，我们可以根据报错信息和此 map 文件，进行错误解析，定位到源代码。source- map 和 hidden - source - map 都会打包生成单独的.map 文件，区别在于，source - map 会在打包出的js文件中增加一个引用注释，以便开发工具知道在哪里可以找到它。hidden - source - map 则不会在打包的js中增加引用注释。但是我们一般不会直接将.map 文件部署到CDN，因为会直接映射到源码，更希望将.map 文件传到错误解析系统，然后根据上报的错误信息，直接解析到出错的源码位置。不过报错信息中只有行号，而没有列号。如果有行列号，那么可以通过sourcemap 来解析出错位置。只有行号，根本无法解析，
})