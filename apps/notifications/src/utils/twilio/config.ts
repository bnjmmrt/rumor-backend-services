import config from '../../config';


module.exports = {
    accountSid : config.get("TWILIO_ACCOUNT_SID"),
    authToken : config.get("TWILIO_AUTH_TOKEN")
}
