var LocalStorage = require("node-localstorage").LocalStorage;
localStorage = new LocalStorage("./scratch");

module.exports = (req, res, next) => {
  let tokenStorage = localStorage.getItem("tokens");
  let token = {
    ACCESS_TOKEN: '',
    REFRESH_TOKEN: ''
  };

  if (tokenStorage) {
    // update if there is a value 
    token = JSON.parse(tokenStorage);
  }

  req.token = {
    accessToken: token.ACCESS_TOKEN,
    refreshToken: token.REFRESH_TOKEN
  };
  next();
};
