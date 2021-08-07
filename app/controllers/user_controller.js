const crypt = require('bcrypt');
const express = require('express');
const API = express.Router();
const MySQL = require('../db_controlling/sql_controller');
const JWT = require('jsonwebtoken');
const config = require('../config/db.config.json');
const auth = require('../auth/autherization');
const uploader = require('../uploader/image_controller');
const sender = require('../email_sender/email_sender');
const userModel = require('../models/user_model');
const { json } = require('express');

API.post('/signUp', uploader.single('image'), async (request, response, next) => {
    MySQL.findOne('users', "email='" + request.body.email + "'", async (err, user) => {
        if (user != null) response.status(206).send({
            message: "Email is already used",
            status: 206
        });
        else {
            const password = await crypt.hash(request.body.password, 10);
            var path;
            try {
                path = request.file.path;
            } catch (error) {
                path = null;
            }
            const code = getRandomInt(9999);
            MySQL.insert('users',
                async (err, user) => {
                    MySQL.updateById('users', user.id, async (err, user) => {
                        sender(user.name, user.email, "Verify code is : " + code, async (error, info) => {
                            if (error) {
                                console.log(error);
                                response.status(200).json({
                                    error: error,
                                    message: 'code cannot be sent',
                                    status: 200
                                });
                            } else {
                                response.status(200).json({
                                    user: user,
                                    message: 'Register successfully',
                                    status: 200
                                });

                            }
                        });
                    }, {
                        apiToken: await JWT.sign({ email: user.email, id: user.id }, config.env.JWT_PRIVATE_KEY)
                    });
                },
                {
                    code: code,
                    image: path.replace('\\', '/'),
                    password: password,
                    name: request.body.name,
                    email: request.body.email,
                });
        }
    });

});


API.post('/update-user', auth, uploader.single('image'), async (request, response, next) => {
    const ops = {};
    var path;
    try {
        path = request.file.path;
    } catch (error) {
        path = null;
    }
    if (path != null) ops['image'] = path;
    if (request.body.email != null) ops['email'] = request.body.email;
    if (request.body.name != null) ops['name'] = request.body.name;
    if (request.body.fcmToken != null) ops['fcmToken'] = request.body.fcmToken;
    if (request.body.password != null) ops['password'] = await crypt.hash(request.body.password, 10);
    MySQL.updateById('users',
        request.userData.id,
        (err, user) => {
            if (err) response.status(206).send({
                message: err,
                status: 206
            });
            else
                response.status(200).json({
                    user: userModel(user),
                    status: 200
                });
        }, ops);
});

API.post('/login', (request, response, next) => {
    const email = request.body.email;
    const password = request.body.password;
    MySQL.findOne('users', "email='" + email + "'", (err, user) => {
        console.log(email);
        if (user != null) {
            crypt.compare(password, user.password, (err, res) => {
                if (err || !res) {
                    response.status(206).send({
                        message: "Invalid password",
                        status: 206
                    });
                } else {
                    if (user.verified == 1) {
                        response.status(200).json({
                            user: userModel(user),
                            message: "login successfully",
                            status: 200
                        });
                    } else {
                        response.status(208).send({
                            message: "Your account is not verified",
                            status: 208
                        });
                    }
                }
            });
        } else {
            response.status(206).send({
                message: "Invalid email or password",
                status: 206
            });
        }
    }, config.user_format);
});

API.post('/forget-password', async (request, response, next) => {
    const email = request.body.email;
    console.log(request.body.email);
    if (email == null) {
        response.status(206).send({
            message: 'Please enter email',
            status: 206
        });
    } else {
        MySQL.findOne('users', "email='" + email + "'", async (err, user) => {
            if (user == null) {
                response.status(206).send({
                    message: 'Email not register',
                    status: 206
                });
            } else {
                const code = getRandomInt(9999);
                MySQL.updateById('users', user.id, async (err, user) => {
                    sender(user.name, email, "Verify code is : " + code, async (error, info) => {
                        if (error) {
                            console.log(error);
                            response.status(200).json({
                                error: error,
                                message: 'code cannot be sent',
                                status: 200
                            });
                        } else {
                            response.status(200).json({
                                message: 'code send successfully',
                                tmpToken: await JWT.sign({ email: email }, config.env.JWT_PRIVATE_KEY),
                                status: 200
                            });

                        }
                    });

                },
                    {
                        code: code
                    });

            }
        });
    }
});

API.post('/reset-password', async (request, response, next) => {
    const tmpToken = request.body.tmpToken;
    const newPassword = request.body.newPassword;
    if (tmpToken != null && newPassword != null) {
        const email = await JWT.decode(tmpToken)['email'];
        MySQL.updateOne('users', "email='" + email + "'", async (err, user) => {
            if (err) {
                response.status(206).send({
                    message: 'Token is invalid',
                    status: 206
                });
            } else {
                response.status(200).json({
                    user: userModel(user),
                    message: 'Password updated successfully',
                    status: 200
                });
            }
        },
            {
                password: await crypt.hash(newPassword, 10)
            });
    } else {
        response.status(206).send({
            message: 'Invalid data',
            status: 206
        });
    }
});


API.post('/change-password', auth, async (request, response, next) => {
    const oldPassword = request.body.oldPassword;
    const newPassword = request.body.newPassword;
    if (oldPassword != null && newPassword != null) {
        MySQL.updateById('users', request.userData.id, async (err, user) => {
            response.status(200).json({
                user: userModel(user),
                message: 'Password changed successfully',
                status: 200
            });
        },
            {
                password: await crypt.hash(newPassword, 10)
            });

    } else {
        response.status(206).send({
            message: 'Invalid data',
            status: 206
        });
    }

});

API.post('/resend-code', async (request, response, next) => {
    const email = request.body.email;
    if (email != null) {
        MySQL.findOne('users', "email='" + email + "'", (err, user) => {
            if (user != null) {
                const code = getRandomInt(9999);
                MySQL.updateById('users', user.id, (err, user) => {
                    sender(user.name, email, "Verify code is : " + code, function (error, info) {
                        if (error) {
                            console.log(error);
                            response.status(200).json({
                                error: error,
                                message: 'code cannot be sent',
                                status: 200
                            });
                        } else {
                            response.status(200).json({
                                messageId: info.messageId,
                                message: 'code send successfully',
                                status: 200
                            });
                        }
                    });

                },
                    {
                        code: code
                    });
            } else {
                response.status(206)
                    .send({ message: 'Invalid email', status: 206 });
            }
        });
    } else {
        response.status(206)
            .send({ message: 'Invalid email', status: 206 });
    }
});

API.post('/verify-code', (request, response, next) => {
    const email = request.body.email;
    const code = request.body.code;
    if (email != null && code != null) {
        MySQL.findOne('users', "email='" + email + "'and code='" + code + "'", async (err, user) => {
            if (user != null) {
                MySQL.updateById('users', user.id, (err, user) => {
                    response.status(200).json({
                        user: userModel(user),
                        message: 'account has been verified',
                        status: 200
                    });
                    console.log(err);
                },
                    {
                        code: null,
                        verified: 1
                    });
            } else {
                response.status(206).send({
                    message: 'Invalid verification code',
                    status: 206
                });
            }
        });

    } else {
        response.status(206).send({
            message: 'Invalid data',
            status: 206
        });
    }
});

API.post('/forget-pasword-verify-code', (request, response, next) => {
    const email = request.body.email;
    const code = request.body.code;
    if (email != null && code != null) {
        MySQL.findOne('users', "email='" + email + "'and code='" + code + "'", async (err, user) => {
            if (user != null) {
                MySQL.updateById('users', user.id, (err, user) => {
                    response.status(200).json({
                        message: 'Verification code has been done',
                        status: 200
                    });
                    console.log(err);
                },
                    {
                        code: null,
                        verified: 1
                    });
            } else {
                response.status(206).send({
                    message: 'Invalid verification code',
                    status: 206
                });
            }
        });

    } else {
        response.status(206).send({
            message: 'Invalid data',
            status: 206
        });
    }
});

API.post('/update-fcmToken', auth, (request, response, next) => {
    const fcmToken = request.body.fcmToken;
    if (fcmToken != null) {
        MySQL.updateById('users', request.userData.id, async (err, user) => {
            response.status(200).json({
                user: userModel(user),
                message: 'FcmToken changed successfully',
                status: 200
            });
        },
            {
                fcmToken: fcmToken
            });

    } else {
        response.status(206).send({
            message: 'Invalid data',
            status: 206
        });
    }
});


function getRandomInt(max) {
    const num = Math.floor(Math.random() * max);
    if (num.toString().length < 4) {
        return getRandomInt(max);
    } else {
        return num;
    }
}


module.exports = API;
