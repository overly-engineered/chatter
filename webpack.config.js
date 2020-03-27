var path = require("path");
var webpack = require("webpack");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const nodeExternals = require("webpack-node-externals");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = [
  {
    entry: path.resolve(__dirname, "./client/src") + "/index.ts",
    output: {
      path: path.resolve(__dirname, "./dist"),
      publicPath: "/dist",
      filename: "build.js"
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: "vue-loader",
          options: {
            loaders: {
              // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
              // the "scss" and "sass" values for the lang attribute to the right configs here.
              // other preprocessors should work out of the box, no loader config like this necessary.
              scss: "vue-style-loader!css-loader!sass-loader",
              sass: "vue-style-loader!css-loader!sass-loader?indentedSyntax"
            }
            // other vue-loader options go here
          }
        },
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          exclude: /node_modules/,
          options: {
            appendTsSuffixTo: [/\.vue$/]
          }
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          loader: "file-loader",
          options: {
            name: "[name].[ext]?[hash]"
          }
        },
        {
          test: /\.css$/,
          use: ["vue-style-loader", "css-loader"]
        }
      ]
    },
    resolve: {
      extensions: [".ts", ".js", ".vue", ".json"],
      alias: {
        vue$: "vue/dist/vue.esm.js"
      }
    },
    performance: {
      hints: false
    },
    devtool: "#eval-source-map",
    plugins: [
      // make sure to include the plugin for the magic
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        title: "Chatter",
        template: path.resolve(__dirname, "./static/index.html")
      })
    ]
  },
  {
    entry: "./server/server.ts",
    target: "node",
    node: {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false // Enable normal node dirname
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
      publicPath: "/dist",
      filename: "./server.js"
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".json"]
    },
    module: {
      rules: [
        // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
        { test: /\.tsx?$/, use: ["ts-loader"], exclude: /node_modules/ }
      ]
    }
  }
];

if (process.env.NODE_ENV === "production") {
  module.exports.map(e => {
    e.devtool = "#source-map";
    // http://vue-loader.vuejs.org/en/workflow/production.html
    e.plugins = (module.exports[0].plugins || []).concat([
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: '"production"'
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: {
          warnings: false
        }
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true
      })
    ]);
  });
}
