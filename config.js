const path = require('path');

const load = (location = '.', environment = null) => {
  const envName = environment || process.env.NODE_ENV || 'development';
  console.log(`Loading config from ${location} for ${envName}`);
  const defaultConfig = loadConfig(location, 'default');
  const envConfig = loadConfig(location, envName);
  const customConfig = loadConfig(location, 'override');
  return Object.assign({}, defaultConfig, envConfig, customConfig);
}

const loadConfig = (location, name) => {
  let conf = {};
  ['json', 'js'].forEach(extension => {
    try {
      const modulePath = `${location}/config.${name}.${extension}`;
      const absPath = path.resolve(modulePath);
      const data = require(absPath);
      Object.assign(conf, data);
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') throw err;
    }
  });
  return conf;
}

exports.load = load;