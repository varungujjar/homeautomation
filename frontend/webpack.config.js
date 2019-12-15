module.exports = {
    entry: './src/index.js',
    module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: ['babel-loader'],
          },
          {
            test: /\.css$/,
            use: ['style-loader','css-loader'],
          },
          { 
            test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
            loader: "url-loader?limit=10000&mimetype=application/font-woff" 
          },
          { 
            test: /\.(ttf|eot|svg|mp3|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
            loader: "file-loader" 
          }
        ]
      },
      resolve: {
        extensions: ['*', '.js', '.jsx']
      },
    output: {
      path: __dirname + '/src',
      publicPath: '/',
      filename: 'bundle.js'
    },
    devServer: {
      contentBase: './src',
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://raspberrypi.local:8000',
          secure: false,
          bypass: function(req, res, proxyOptions) {
            if (req.headers.accept.indexOf('html') !== -1) {
              console.log('Skipping proxy for browser request.');
              return '/index.html';
            }
          }
        }
      }
    }
  };