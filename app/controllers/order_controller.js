const express = require('express');
const API = express.Router();
const auth = require('../auth/autherization');
const MySQL = require('../db_controlling/sql_controller');
const cart = require('../models/cart_model');

API.post('/make-order', auth, async (request, response, next) => {
    const userId = request.userData.id;
    const address = request.body.address;
    const lng = request.body.lng;
    const lat = request.body.lat;
    const date = request.body.date;
    if (address != null && lng != null && lat != null && date != null) {
        MySQL.findALl('carts', async (err, carts) => {
            var price = 0;
            var discount = 0;
            var quantity=0;
            if (carts.length != 0) {
                carts.forEach(doc => {
                    price += doc.price;
                    discount += doc.discount;
                    quantity += doc.quantity;
                });
                discount /= quantity;
                MySQL.insert('orders', (err, order) => {
                    if (err) {
                        response.status(206).json({
                            status: 206,
                            message: err
                        });
                    } else {
                        for (const doc of carts) {
                            MySQL.updateById('carts', doc.id, (err, cart) => { }, { orderId: order.id });
                        }
                        MySQL.insert('notifications', (err, notification) => {
                            response.status(200).json({
                                status: 200,
                                message: 'Order added successfully'
                            });
                        },
                            {
                                userId: userId,
                                title: 'You add order number #' + order.id 
                            });

                    }
                },
                    {
                        userId: userId,
                        price: price,
                        discount: discount,
                        lng: lng,
                        lat: lat,
                        date: date,
                        address: address
                    });
            } else {
                response.status(206).send({
                    status: 206,
                    message: 'No Carts to add order'
                });
            }
        },
            null,
            "orderId is null and userId ='" + userId + "'");
    } else {
        response.status(206).send({
            message: 'Invalid data',
            status: 206
        });
    }

});


API.post('/delete-order', auth, (request, response, next) => {
    const userId = request.userData.id;
    const orderId = request.body.orderId;
    if (orderId != null) {
        MySQL.findById('orders', orderId, (err, order) => {
            if (order != null) {
                if (userId == order.userId) {
                    MySQL.deleteOne('orders', "id ='" + orderId + "' and userId ='" + userId + "'", (err, cart) => {
                        if (err) {
                            response.status(206).send({
                                message: err,
                                status: 200
                            });
                        } else {
                            MySQL.deleteOne('carts', "orderId='" + order.id + "'", (err, result) => {
                                MySQL.insert('notifications', (err, notification) => {
                                    response.status(200).send({
                                        message: 'Order removed successfully',
                                        status: 200
                                    });
                                },
                                    {
                                        userId: userId,
                                        title: 'You removed order number #' + order.id 
                                    });
                            });
                        }
                    });
                } else {
                    response.status(206).send({
                        message: 'You do not order owner',
                        status: 200
                    });
                }
            } else {
                response.status(200).send({
                    message: 'Order not found',
                    status: 204
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

API.post('/order-details', auth, (request, response, next) => {
    const userId = request.userData.id;
    const orderId = request.body.orderId;
    if (orderId != null) {
        MySQL.findById('orders', orderId, (err, order) => {
            if (order != null && order.userId == userId) {
                MySQL.mQuery("SELECT products.*,products.id as productId,products.price as productPrice,products.discount as productDiscount,carts.*,categories.title as categoryTitle,categories.id as categoryId,categories.description as categoryDescription FROM carts JOIN products ON carts.productId = products.id and carts.orderId = '" + order.id + "' JOIN categories ON categories.id = products.categoryId;", (err, carts) => {
                    order['carts'] = carts.map((doc) => cart(doc));
                    response.status(200).json({
                        status: 200,
                        order: order
                    });
                });
            } else {
                response.status(200).send({
                    message: 'Order not found',
                    status: 204
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

API.get('/get-orders/:page', auth, (request, response, next) => {
    const page = request.params.page;
    const userId = request.userData.id;
    MySQL.findPaging('orders', page, (err, orders) => {
        response.status(200).json({
            orders: orders,
            status: 200
        });
    },
        null,
        "userId='" + userId + "'");
});


module.exports = API;