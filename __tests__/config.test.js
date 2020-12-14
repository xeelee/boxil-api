const process = require('process')
const rewire = require('rewire');
const config = require('../config.js');

const _loadConfig = rewire('../config.js').__get__('loadConfig');

describe('config', () => {

  it("loads single config file", () => {
    const data = _loadConfig('./__tests__/data', 'default');
    expect(data).toEqual({a: 1});
  });

  it("loads computed config from location", () => {
    const data = config.load('./__tests__/data', 'development');
    expect(data).toEqual({a: 10, b: 2, c: 20, x: "efgh", myEnv: "test"});
  });

  it("loads NODE_ENV config by default", () => {
    const data = config.load('./__tests__/data');
    expect(data).toEqual({a: 10, b: 350, c: 20});
  });

});

describe('config path', () => {

  let currentDir = null;

  beforeEach(() => {
    currentDir = process.cwd();
  });

  afterEach(() => {
    process.chdir(currentDir);
  });

  it('works if working directory changes', () => {
    process.chdir('__tests__/data')
    const data = config.load('.', 'development');
    expect(data).toEqual({a: 10, b: 2, c: 20, x: "efgh", myEnv: "test"});
  });

});