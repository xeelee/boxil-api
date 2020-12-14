const { Readable } = require('stream');
const TOKEN_INFO = {};
const DEFAULT_FILE_NAME = 'some_file.nes';
var fileName = DEFAULT_FILE_NAME;

function BoxSDK(options) {
  console.log('BoxSDK mock options:', options);
  return {
    getTokensAuthorizationCodeGrant: (code, options, callback) => {
      callback(null, TOKEN_INFO);
    },
    getPersistentClient: (tokenInfo, store) => {
      return {
        files: {
          get: (fileId, options) => {
            const file = { id: '12345', name: fileName };
            return new Promise((resolve, reject) => {
              process.nextTick(() => {
                resolve(file);
              });
            });
          },
          getReadStream: (fileId, options) => {
            const data = 'some stream data';
            const stream = Readable.from([data]);
            return new Promise((resolve, reject) => {
              process.nextTick(() => {
                resolve(stream);
              });
            });
          }
        },
        search: {
          query: (q, options) => {
            console.log('search query mock', q, options);
            return new Promise((resolve, reject) => {
              process.nextTick(() => {
                resolve({
                  entries: [
                    { id: '123', name: 'first.nes'},
                    { id: '456', name: 'second.asd'},
                    { id: '789', name: 'third.nes'}
                  ]
                });
              })
            });
          }
        }
      }
    }
  }
}

BoxSDK.__testdata__ = {
  setFile: (name) => {
    fileName = name;
  },
  resetFile: () => {
    fileName = DEFAULT_FILE_NAME;
  }
}

module.exports = BoxSDK;