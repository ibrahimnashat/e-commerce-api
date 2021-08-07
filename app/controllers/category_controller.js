const express = require('express');
const API = express.Router();
const MySQL = require('../db_controlling/sql_controller');
const auth = require('../auth/autherization');


API.post('/add', auth, (request, response, next) => {
    const title = request.body.title;
    const description = request.body.description;
    if (title != null && description != null) {
        MySQL.insert('categories', (err, category) => {
            response.json({
                err: err,
                category: category,
                status: 200
            });
        },
            {
                title: title,
                description: description
            });
    } else {
        response.status(206).send({
            message: 'Invaild data',
            status: 206
        });
    }

});

API.get('/get-categories/:page', auth, (request, response, next) => {
    const page = request.params.page;
    MySQL.findPaging('categories', page, (err, categories) => {
        response.json({
            categories: categories,
            status: 200
        });
    });
});

API.get('/get-categories/', auth, (request, response, next) => {
    MySQL.findALl('categories', (err, categories) => {
        response.json({
            categories: categories,
            status: 200
        });
    });
});


module.exports = API;