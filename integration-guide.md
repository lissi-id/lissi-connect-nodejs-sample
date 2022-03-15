# Overview

This guide outlines how `Lissi Connect` can be integrated into a `Node.js` application using `Passport.js`.
On this page the highlighted files are as described:

## Component tree

- `app.js`
- routes
  - `index.js`
  - **`auth.js`**
  - `user.js`
- strategies
  - **`lissiConnectOidc.js`**
- middleware
  - **`issuanceSession.js`**
- view
  - `index.ejs`
  - `error.ejs`
  - `user.ejs`

## **`strategies/lissiConnectOidc.js`**

This file defines and configures the passport strategy for a successful connection to Lissi Connect. We are using the pre-configured [`openid-client`](https://www.passportjs.org/packages/openid-client/) strategy to retrieves the information about the issuer through `/.well-known/` URLs specified by the issuer using the `Issuer.discover([issuer])` method

> Note that this information are fetched asynchronously. Therefore, we recommend nesting the strategy configuration in an asynchronous block\
    <pre>(async(err) => {
      &nbsp;&nbsp;if(err){
        &nbsp;&nbsp;&nbsp;&nbsp;console.log(err)
      &nbsp;&nbsp;}
      &nbsp;&nbsp;// Rest of the configuration below
    })();</pre>

    const {Issuer} = require('openid-client');
    
    const issuer = await Issuer.discover(process.env.ISSUER);

`issuer` now holds the required information about the client required to set up the strategy. However, some information about the client cannot be fetched from the `/.well-known/` URLs and must be specified (Client_id/secret and redirection URIs)

    const client = new issuer.Client({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uris: [ 'http://localhost:3000/auth/callback' ]
    });

The generation of a `nonce` is required by Lissi Connect. to do so we call upon the `generators` object from the `openid-client` strategy

     const {generators} = require('openid-client');

     const nonce = generators.nonce();

By default, the response-type is set to `code` as for the code flow used by Lissi Connect however we must deactivate the usage of PKCE not supported.

And finally set the right scope to `'openid profile vc-authn'` as we define the strategy

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

As for all passport strategy definitions, we must define both functions to (de)serialize the user's information is retrieved. The minimum implementation displays the user information defined in the claims of the received token

    passport.serializeUser(function(user, done) {
      done(null, user);   
    });
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

Finally, we indicate passport to use the defined strategy as a middleware. Naming the strategy is optional but good practice as multiple strategies can be defined.
    passport.use('oidc', strategy);

------

## **`middleware/issuanceSession.js`**

An issuance session identifier is required for user registration using Lissi Connect. The `issuanceSession` act as middleware and connects to the Lissi Connect API to get the required field `issuance_session_id`. The Lissi Connect `POST` defines a body value example as follow

    {
      "subjectIdentifier": "string",
      "claims": {
        "additionalProp1": "string",
        "additionalProp2": "string",
        "additionalProp3": "string"
      },
      "credentialDefinitionId": "string"
    }

The subject identifier is a UUID identifier randomly generated using the uuidv4 node package

    const { v4: uuidv4 } = require('uuid');
    const userId = uuidv4()

The claims must follow the credential definition template identified by the `credentialDefinitionId`.

    const issuanceSession = {
      subjectIdentifier : userId,
      claims:{
        "First Name": req.query.firstName,
        "Last Name": req.query.lastName,
        "E-Mail": req.query.email,
        "User ID": userId
      },
      credentialDefinitionId: process.env.CREDENTIAL_DEFINITION_ID
    }

The user's information is retrieved from the request parameter either passed through the URL or the body object depending on the implementation choice.

Afterwards, we construct an Axios `POST` request with the issuanceSession object passed to the body of the request

    const axios = require('axios');
    const result = await axios.post('https://auth.lissi.io/api/issuance-sessions', issuanceSession)
    .catch(e =>{
        console.error(e)
    })

Before calling the next middleware function we modify the request object by adding an `issuance_session_id` field to `res.locals` as conventionally advised

    res.locals.isssuance_session_id = results.data.id;
    next();

------

## **`routes/auth.js`**

The `auth.js` route file relies on both previously detailed files. It makes use of the defined `'oidc'` passport strategy for authenticating the user (Login & Register). Although the register methods rely on the `getIssuanceSession` middleware function to get the required `issuance _session_id` to register a new user through Lissi Connect.

The authentication route file exposes two user authentication routes, a callback route as well as a logout route. The following diagrams show how the routes are accessed through in the NodeJS sample.

![lissiOIDC](https://user-images.githubusercontent.com/26570586/156165257-458b229e-7ee5-4328-9d09-976d8d05b094.png)

### *GET /login*

Calls on the passport authentication middleware redirect the user to the Lissi Connect page from where the QR-code can be scanned. The presentation configuration identifier must be set in the custom parameters, presenting the requested attributes and predicates required by the  RP (Relying Party).  

    passport.authenticate('oidc', {presentation_configuration_id:process.env.PRESENTATION_CONFIG_ID})

### *GET /register*

Accessed after the user correctly filled the form with his information. the getIssuanceSessionId intercepts and treats the information provided by the user to get an issuance session Identifier from Lissi Connect. the second middleware function checks the presence of the `issuance_session_id` field in `res.locals` and appends it as a custom parameter. Same as for the login function the user is redirected to the Lissi Connect page from where the QR-code can be scanned

### *POST /logout*

Correctly cleanse the user information from the session states and redirect the user to the homepage.

### Special Note for `routes/user.js`

The route is protected through a middleware function that ensures that the user is correctly logged in. User information correctly set in the session states

    const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
    router.get('/', ensureLoggedIn('/'), (req, res) => {
      res.render('users', { user: req.user });
    });
