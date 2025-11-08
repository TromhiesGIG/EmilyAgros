module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // REMOVE the 'react-native-worklets/plugin' line from here.
      // The Reanimated plugin handles it for you.
      
      'react-native-reanimated/plugin', // This should be the only one you need.
    ],
  };
};