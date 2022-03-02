# Lissi Connect through NodeJS

This express application presents a working example of a Single Sign-On method through lissi-Connect using `passportJS` and `openid-client` strategy.

## Quickstart

Clone this repository using `git clone https://github.com/lissi-id/lissi-oidc-nodejs-sample.git`

Create and fill out a `.env` file at the root of the cloned repository following this template

    CLIENT_ID=
    CLIENT_SECRET=
    PRESENTATION_CONFIG_ID=
    PORT=
    ISSUER=
    CREDENTIAL_DEFINITION_ID=

> Please note that `AUTHORIZATION_URL`, `TOKEN_URL` and `CALLLBACK_URL` fields are required using the `passport-openidconnect` strategy, which we do not recommend as custom parameters are not supported by default. Instead, we would prefer the  [`openid-client`](https://www.passportjs.org/packages/openid-client/) strategy as it offers the possibility to discover the issuer endpoint through web finger URL

Run `npm start`

The application is accessible through `http://localhost:{process.env.PORT}` from where you can register and login through LissiConnect.

## Integration Guide

More details concerning the integration of Lissi Connect through NodeJS available [here](integration-guide.md)
