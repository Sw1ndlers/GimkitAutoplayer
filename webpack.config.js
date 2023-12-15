const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
    entry: "./src/index.ts",
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            "@root": path.resolve(__dirname, "src"),
            "@functions": path.resolve(__dirname, "src/functions"),
        },
    },
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: "extention", to: "./" }],
        }),
        new WebpackObfuscator ({
            rotateStringArray: true
        })
    ],
}
