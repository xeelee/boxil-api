const config = require('./config.js');
const configPath = process.env.BOXIL_PATH || '.';
const conf = config.load(configPath);

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

const MAX_FILE_SIZE = 500000;

app.use(helmet());

app.set('trust proxy', 1);
app.use(session({
  secret: 'some secret key',
  resave: false,
  saveUninitialized: true,
  secure: conf.secure
}));

app.use(cors({
  origin: conf.frontend,
  credentials: true,
  optionsSuccessStatus: 200
}));

console.log(conf);
const BoxSDK = require('box-node-sdk');
const sdk = new BoxSDK({
  clientID: conf.clientId,
  clientSecret: conf.clientSecret
});

const authRequired = (req, res, next) => {
  console.log('authRequired', req.session.tokenInfo);
  if (!req.session.tokenInfo) {
    res.set('Location', '/login');
    res.sendStatus(401);
  } else {
    import('./token-store.mjs').then((module) => {
      const TokenStore = module.default;
      const store = new TokenStore(() => req.session);
      store.read((err, tokenInfo) => {
        req.client = sdk.getPersistentClient(tokenInfo, store);
        next();
      });
    });
  }
};

app.get('/login', (req, res) => {
  const authUrl = sdk.getAuthorizeURL({response_type: 'code'});
  res.redirect(authUrl);
})

app.get('/auth', (req, res) => {
  const code = req.query.code;
  sdk.getTokensAuthorizationCodeGrant(code, null, function(err, tokenInfo) {
    import('./token-store.mjs').then((module) => {
      const TokenStore = module.default;
      const store = new TokenStore(() => req.session);
      store.write(tokenInfo, () => {
        console.log('auth', tokenInfo);
        res.redirect(conf.frontend);
      });
    });
  });
})

app.get('/roms', authRequired, (req, res) => {
  // limit rom size to 500KB
  req.client.search.query('nes', { size_range: `1,${MAX_FILE_SIZE}`, fields: 'name', file_extensions: 'nes' })
  .then(data => {
    console.log(data);
    res.send({ items: data.entries.filter(entry => entry.name.endsWith('.nes'))
    .map(
      entry => {
        return {
          "id": `${entry.id}`,
          "name": entry.name
        };
      })
    })
  });
});

app.get('/roms/:fileId', authRequired, (req, res) => {
  req.client.files.get(req.params.fileId)
  .then(file => {
    if (!file.name.endsWith('.nes') || file.size > MAX_FILE_SIZE) {
      return Promise.reject({ response: { statusCode: 400 }});
    }
    return req.client.files.getReadStream(req.params.fileId);
  })
  .then(stream => {
    stream.pipe(res);
  })
  .catch(err => {
    console.log('Error getting single file:', err);
    if (err.response.statusCode === 404) {
      res.status(404).send({error: "File with requested ID does not exist"});
    } else if (err.response.statusCode === 400) {
      res.status(400).send({error: "Only nes roms are supported"});
    } else {
      res.status(503).send({error: "Unable to retrieve file"});
    }
  });
});

module.exports = app;