const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const getIssuanceSessionId = async (req,res,next) => {
    const userId = uuidv4()
    const issuanceSession = {
        subjectIdentifier : userId,
        claims:{
          'First Name': req.query.firstName,
          "Last Name": req.query.lastName,
          "E-Mail": req.query.email,
          "User ID": userId
        },
        credentialDefinitionId: process.env.CREDENTIAL_DEFINITION_ID
    }

    const result = await axios.post('https://auth.lissi.io/api/issuance-sessions', issuanceSession)
    .catch(e =>{
        console.error(e)
    })

    res.locals.issuance_session_id = result.data.id
    next()
}

module.exports = getIssuanceSessionId;
