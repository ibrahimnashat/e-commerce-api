const JWT = require('jsonwebtoken');
const config = require('../config/db.config.json');

module.exports = (request, response, next) => {
    try {
        const token = request.headers.authorization.split(' ')[1];
        const decode = JWT.verify(token, config.env.JWT_PRIVATE_KEY);
        request.userData = decode;
        next();
    } catch (error) {
        response.send({
            message: "UnAuthorized",
            status: 400,
        });
    }
}