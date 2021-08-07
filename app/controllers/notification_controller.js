const express = require('express');
const API = express.Router();
const MySQL = require('../db_controlling/sql_controller');
const auth = require('../auth/autherization');
const notification = require('../models/notification_model');


API.post('/add', auth, (request, response, next) => {
    const title = request.body.title;
    if (title != null) {
        MySQL.insert('notifications', (err, notification) => {
            response.json({
                notification: notification,
                status: 200
            });
        },
            {
                userId: request.userData.id,
                title: title
            });
    } else {
        response.status(206).send({
            message: 'Invaild data',
            status: 206
        });
    }

});

API.get('/get-notifications/:page', auth, (request, response, next) => {
    const page = request.params.page;
    console.log(request.userData.id);
    MySQL.findPaging('notifications', page, (err, notifications) => {
        response.json({
            notifications: notifications,
            status: 200
        });
    },
        null,
        "userId = '" + request.userData.id + "'"
    );
});

API.get('/get-notifications/', auth, (request, response, next) => {
    MySQL.mQuery('SELECT user.*,notification.* from notifications AS notification JOIN users AS user on notification.userId = user.id', (err, notifications) => {
        response.json({
            notifications: notifications.map((value)=>{
                return notification(value);
            }),
            status: 200
        });
    },
        null,
        "userId = '" + request.userData.id + "'"
    );
});


module.exports = API;