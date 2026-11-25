// Adds a base path for web builds that live in a sub folder (GitHub Pages: /Sportsapp).
module.exports = ({ config }) =>
  process.env.EXPO_BASE_URL
    ? { ...config, experiments: { ...config.experiments, baseUrl: process.env.EXPO_BASE_URL } }
    : config;
