const supertest = require('supertest');
const session = require('supertest-session');
const app = require('../index.js');
const request = supertest(app);

const sdkMock = require('box-node-sdk');

describe('/auth endpoint', () => {

  it('should set token info in session', (done) => {
    let testSession = session(app);
    testSession.get('/auth')
    .query({code: '--token--'})
    .expect(302)
    .end((err) => {
      expect(err).toBe(null);
      return done();
    });
  });

});

describe('endpoints unauthenticated', () => {

  it('should return 401 HTTP status for rom list', async (done) => {
    const response = await request.get('/roms');
    expect(response.status).toBe(401);
    done();
  });

  it('should return 401 HTTP status for single rom', async (done) => {
    const response = await request.get('/roms/12345');
    expect(response.status).toBe(401);
    done();
  });

});

describe('endpoints authenticated', () => {

  var authenticatedSession;

  beforeEach((done) => {
    let testSession = session(app);
    testSession.get('/auth')
    .query({code: '--token--'})
    .expect(302)
    .end((err) => {
      expect(err).toBe(null);
      authenticatedSession = testSession;
      return done();
    });
  });

  afterEach(() => {
    sdkMock.__testdata__.resetFile();
  });

  it('should return list of roms', async (done) => {
    const response = await authenticatedSession.get('/roms');
    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([
      { id: "123", name: 'first.nes'},
      { id: "789", name: 'third.nes'}
    ]);
    done();
  });

  it('should return single rom', async (done) => {
    const response = await authenticatedSession.get('/roms/12345');
    expect(response.status).toBe(200);
    expect(response.text).toBe('some stream data');
    done();
  });

  it('should return 400 HTTP status for invalid file', async (done) => {
    sdkMock.__testdata__.setFile('invalid_file.xyz');
    const response = await authenticatedSession.get('/roms/12345');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Only nes roms are supported");
    done();
  });

});