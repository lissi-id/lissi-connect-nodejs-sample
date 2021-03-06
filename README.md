# Integrating Lissi Connect into a NodeJS Application

This express application presents a working example of a passwordless authentication method through Lissi Connect using `passportJS` and the `openid-client` strategy.

## Quickstart

Clone this repository using `git clone https://github.com/lissi-id/lissi-connect-nodejs-sample.git`

Create and fill out a `.env` file at the root of the cloned repository following this template

    CLIENT_ID=
    API_KEY=
    PRESENTATION_CONFIG_ID=
    PORT=
    ISSUER=
    CREDENTIAL_DEFINITION_ID=

Run `npm start`

The application is accessible through `http://localhost:{process.env.PORT}` from there, you can register and log in through Lissi Connect.

## Integration Guide

To integrate Lissi Connect into your NodeJS application, please follow the [Integration Guide](integration-guide.md)
