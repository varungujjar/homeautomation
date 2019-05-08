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
          target: 'http://192.168.1.114:8000',
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