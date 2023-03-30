const keygrip = require("keygrip");
const keys = require("../../config/keys")
const Keygrip = new keygrip([keys.cookieKey]);

module.exports = (user) => {
    const sessionObj = {
        passport: {
            user: user._id.toString(),
        }
    }
    const session = Buffer.from(JSON.stringify(sessionObj)).toString("base64");
    const sig = Keygrip.sign('session=' + session);
    return { session, sig };
}