const express = require('express');
const parser = require('body-parser');
const morgan = require('morgan');

const usersController = require('./controllers/user_controller');
const categoryController = require('./controllers/category_controller');
const notificationController = require('./controllers/notification_controller');
const productController = require('./controllers/product_controller');
const cartController = require('./controllers/cart_contoller');
const orderController = require('./controllers/order_controller');

const Application = express();

Application.use(morgan('dev'));

Application.use(parser.urlencoded({ extended: true }));
Application.use(parser.json());

Application.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, Accept, Content-Type, X-Requested-With, Authorization, form-data");
    if (response.method == "OPTIONS") {
        response.header("Access-Control-Allow-Methods", "POST, GET, PATCH, DELETE");
        return response.status(200).json({});
    }
    next();
});

Application.use('/users',usersController);
Application.use('/categories',categoryController);
Application.use('/notifications',notificationController);
Application.use('/products',productController);
Application.use('/carts',cartController);
Application.use('/orders',orderController);

Application.use((request, response, next) => {
    const error = Error('Not found');
    error.status = 404;
    next(error);
});


Application.use((error, request, response, next) => {
    response.json({
        message: error.message,
        status: error.status
    });
});



module.exports = Application;