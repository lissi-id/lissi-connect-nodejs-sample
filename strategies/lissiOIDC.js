const passport = require('passport');
const { Issuer, Strategy, generators } = require ('openid-client');


(async(err) => {

    if(err){
        console.err(err);
    }

    passport.serializeUser(function(user, done) {
        done(null, user);   
    });
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    
    const issuer = await Issuer.discover(process.env.ISSUER);

    const client = new issuer.Client({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uris: [ 'http://localhost:3000/auth/callback' ],
        post_logout_redirect_uris: [ 'http://localhost:3000/logout/callback' ],
    })

    const nonce = generators.nonce();

    const strategy = new Strategy({ 
      client,
      usePKCE : false,
      sessionKey: 'passport',
      params:{
        scope : 'openid profile vc_authn',
        nonce,
      } }, (tokenSet, done) => {
        return done(null, tokenSet.claims());
    });    

    passport.use('oidc',strategy);

})();