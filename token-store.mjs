class TokenStore {

  constructor(getSession) {
    this.getSession = getSession;
  }

  read(callback) {
    console.log("Reading tokenInfo");
    callback(null, this.getSession()['tokenInfo']);
  }

  write(tokenInfo, callback) {
    console.log("Writing tokenInfo:", tokenInfo);
    this.getSession()['tokenInfo'] = tokenInfo;
    callback();
  }

  clear(callback) {
    this.getSession().delete('tokenInfo')
    callback();
  }
}

export default TokenStore;
