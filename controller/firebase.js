const admin = require("firebase-admin");

const sendApproveNotificationTo = (fireBaseToken) => {
    const message = {
        data : {
            "access" : "true"
        }
    }
    admin.messaging().sendToDevice(fireBaseToken, message).then(data => {
        console.log(data);
    })
}

module.exports = {
    sendApproveNotificationTo : sendApproveNotificationTo
}