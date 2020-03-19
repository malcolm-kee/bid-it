const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const tsConfigPath = path.resolve(__dirname, 'tsconfig.scripts.json');

/**
 * @type {import ('webpack').Configuration}
 */
module.exports = {
  mode: 'production',
  target: 'node',
  externals: [nodeExternals()],
  entry: {
    engine: path.resolve(__dirname, 'src', 'engine.ts'),
    socket: path.resolve(__dirname, 'src', 'socket.ts'),
    reporting: path.resolve(__dirname, 'src', 'reporting.ts'),
    'generate-report': path.resolve(__dirname, 'src', 'generate-report.ts'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '..', 'dist', 'scripts'),
  },
  module: {
    rules: [
      {
        test: /.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: tsConfigPath,
          transpileOnly: true,
        },
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.ts'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigPath,
      }),
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      tsconfig: tsConfigPath,
    }),
  ],
  optimization: {
    minimize: false,
  },
};
