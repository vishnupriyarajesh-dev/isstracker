const webpack = require('webpack');

module.exports = function override(config) {
  config.plugins = config.plugins || [];
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(/^node:/, function(resource) {
      resource.request = resource.request.replace(/^node:/, '');
    })
  );
  config.resolve = config.resolve || {};
  config.resolve.fallback = Object.assign(
    config.resolve.fallback || {},
    { module: false, worker_threads: false, fs: false, path: false }
  );
  return config;
};