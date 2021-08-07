// const nodemailer = require('nodemailer');
const { CourierClient } = require("@trycourier/courier");
// var transporter = nodemailer.createTransport({
//     host: 'smtp.mailtrap.io',
//     port: 2525,
//     auth: {
//         user: "27782ed43b1997",
//         pass: "515d61670e0d5d"
//     }
// });

const courier = CourierClient(
    { authorizationToken: "dk_prod_M492EEYS7GMPDTG5ZP7PBFC5Z0RS" });

module.exports = async (username, to, text, res) => {
    await courier.send({
        eventId: "personalized-welcome-email",
        recipientId: "01a14a95-9cf4-4c1d-aada-acdad2ded68e",
        profile: {
            email: to,
        },
        data: {
            firstname: username,
            message: text,
        },
        override: {},
    }).then((resp) => {
        console.log('Email sent', resp)
        res(null, resp);
    })
        .catch((error) => {
            res(error, null);
            console.error(error);
        });
}