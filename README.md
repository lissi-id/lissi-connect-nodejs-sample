# Integrating Lissi Connect into a NodeJS Application

This express application presents a working example of a passwordless authentication method through Lissi Connect using `passportJS` and `openid-client` strategy.

## Quickstart

Clone this repository using `git clone https://github.com/lissi-id/lissi-oidc-nodejs-sample.git`

Create and fill out a `.env` file at the root of the cloned repository following this template

    CLIENT_ID=
    CLIENT_SECRET=
    PRESENTATION_CONFIG_ID=
    PORT=
    ISSUER=
    CREDENTIAL_DEFINITION_ID=

Run `npm start`

The application is accessible through `http://localhost:{process.env.PORT}` from where you can register and login through Lissi Connect.

## Integration Guide

To integrate Lissi Connect into you NodeJS application, please follow the [Integration Guide](integration-guide.md)
