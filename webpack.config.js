const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Path = require('path');

module.exports = {
  mode: 'production',
  entry: ['./src/docs/index.ts', './src/docs/index.scss'],
  output: {
    filename: 'index.js',
    path: Path.resolve(__dirname, 'dist/docs')
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(css|sass|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                require('autoprefixer')
              ]
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: 'file-loader'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: 'file-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: 'src/docs/favicon.png'
    }]),
    new HtmlWebPackPlugin({
      template: 'src/docs/index.html',
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'index.css',
    }),
  ],
  devtool: 'source-map',
  stats: 'errors-only'
};