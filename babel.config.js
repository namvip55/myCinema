module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'babel-plugin-transform-import-meta',
      'react-native-reanimated/plugin', // Thêm plugin reanimated vì app có dùng
    ],
  };
};
