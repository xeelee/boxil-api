# Description
Simple NodeJS middleware app, that connects to [Box API](https://developer.box.com/reference/), authenticates users using their Box credentials (OAuth) and exposes resources serving NES/Famicom rom files for the frontend application purpose.

# Commands
Run the application
```
$ npm start
```
Run tests
```
$ npm test
```

# Config
Create `config.override.json` (or `config.override.js`) file for local config changes. Look at `config.default.json` as a reference. `development` and `production` config files are also loaded while building configuration when applications starts.
