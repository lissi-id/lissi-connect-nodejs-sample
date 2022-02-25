const { Router } = require('express');
const passport = require('passport');
const getIssuanceSessionId = require('../middleware/issuanceSession')
const router = Router();

router.get('/login', passport.authenticate('oidc', {presentation_configuration_id:process.env.PRESENTATION_CONFIG_ID}));

router.get('/register',
  getIssuanceSessionId,
  (req, res, next) =>{
    if(res.locals.issuance_session_id){
      passport.authenticate('oidc', {issuance_session_id:res.locals.issuance_session_id})(req,res,next)
    }
} );

router.get(
  '/callback',
  passport.authenticate('oidc', {failureRedirect:'/', failureMessage: true, successRedirect:'/user'}),
);

router.post('/logout', (req, res) => {
  req.logOut();
  res.redirect('/')
});

module.exports = router;
