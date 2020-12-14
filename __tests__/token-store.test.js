const tokenInfo = {'x': 1};
var store = null;
var session = null;
const getSession = jest.fn();

beforeAll(done => {
  import('../token-store.mjs').then(module => {
    const TokenStore = module.default;
    store = new TokenStore(getSession);
    done();
  });
});

afterEach(() => {
  session = null;
  getSession.mockClear();
});

describe('TokenStore', () => {

  it('should read session', () => {
    session = {'tokenInfo': tokenInfo}
    getSession.mockReturnValue(session);
    store.read((err, result) => {
      expect(err).toBe(null);
      expect(result).toBe(tokenInfo);
      expect(getSession.mock.calls.length).toBe(1);
    });
  });

  it('should write session', () => {
    session = {};
    getSession.mockReturnValue(session);
    const callback = jest.fn();
    store.write(tokenInfo, callback);
    expect(callback.mock.calls.length).toBe(1);
    expect(getSession.mock.calls.length).toBe(1);
    expect(session['tokenInfo']).toBe(tokenInfo);
  });

});
