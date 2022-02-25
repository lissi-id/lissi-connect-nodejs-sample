const passport = require('passport');

var OpenIDConnectStrategy = require('passport-openidconnect');

passport.serializeUser((user, done) => {
  console.log('Serializing User...');
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
    done(err, null);
});

async function verifyFunction(accessToken, done) {
  console.log(accessToken)
  return done(null,accessToken)
}

passport.use('openidconnect',new OpenIDConnectStrategy({
    issuer: process.env.ISSUER,
    authorizationURL: process.env.AUTHORIZATION_URL,
    tokenURL: process.env.TOKEN_URL,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: 'openid profile vc_authn',
    }, verifyFunction)
)

module.exports = { verifyFunction };