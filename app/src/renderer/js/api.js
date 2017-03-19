
var APP_ID = 'KYkddmR5GLXnD15sR7loC42p-gzGzoHsz';
var APP_KEY = 'FEBSUHwgfS2QHQKfHT1dikH7';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});

export let requestLogin = function(username, password) {
  if (!username || !password) {
    return null
  }
  return AV.User.logIn(username, password);
}

export let isLoggedIn = function() {
	return AV.User.current()?true:false;
}