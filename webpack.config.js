const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    library: {
      type: "commonjs2",
    },
  },
  target: "node",
  plugins: [
    new CleanWebpackPlugin(),
  ],
  optimization: {
    minimizer: [new TerserPlugin({
      extractComments: false,
    })],
  },
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
      "~": path.resolve(__dirname, "src/"),
    },
  },
  externals: [
    "typescript",
    "zod-to-json-schema"
  ],
  externalsType: "commonjs",
};
