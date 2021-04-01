const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Path = require('path');

module.exports = {
  entry: ['./src/docs/index.ts', './src/docs/styles.scss'],
  output: {
    filename: 'index.js',
    path: Path.resolve(__dirname, 'dist/docs'),
  },
  devtool: 'source-map',
  devServer: {
    contentBase: Path.join(__dirname, 'dist'),
    compress: true,
    port: 8083,
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(svg|jpg|gif|woff|woff2|eot|ttf|otf)$/,
        use: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: 'src/docs/index.html',
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
  ],
  stats: 'errors-only',
};
