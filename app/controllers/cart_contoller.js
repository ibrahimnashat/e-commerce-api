const express = require('express');
const API = express.Router();
const auth = require('../auth/autherization');
const MySQL = require('../db_controlling/sql_controller');
const cart = require('../models/cart_model');

API.post('/add-carts', auth, async (request, response, next) => {
    const userId = request.userData.id;
    const productId = request.body.productId;
    const quantity = request.body.quantity;
    if (quantity != null && productId != null) {
        MySQL.findById('products', productId, async (err, product) => {
            if (product != null) {
                const price = product.price * quantity - product.price * (product.discount / 100);
                MySQL.insert('carts', async (err, cart) => {
                    response.status(200).send({
                        message: 'Product added successfully',
                        status: 200
                    });
                },
                    {
                        userId: userId,
                        productId: productId,
                        price: price,
                        quantity: quantity,
                        discount: product.discount
                    });
            } else {
                response.status(200).send({
                    message: 'Product not found',
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


API.post('/remove-cart', auth, (request, response, next) => {
    const userId = request.userData.id;
    const cartId = request.body.cartId;
    MySQL.findById('carts', cartId, (err, cart) => {
        if (cart != null) {
            if (userId == cart.userId) {
                MySQL.deleteOne('carts', "id ='" + cartId + "' and userId ='" + userId + "'", (err, cart) => {
                    if (err) {
                        response.status(206).send({
                            message: err,
                            status: 200
                        });
                    } else {
                        response.status(200).send({
                            message: 'Cart removed successfully',
                            status: 200
                        });
                    }
                });
            } else {
                response.status(206).send({
                    message: 'You do not cart owner',
                    status: 200
                });
            }
        } else {
            response.status(200).send({
                message: 'Cart not found',
                status: 204
            });
        }
    });

});



API.post('/update-cart-quantity', auth, (request, response, next) => {
    const userId = request.userData.id;
    const cartId = request.body.cartId;
    const newQuantity = request.body.newQuantity;
    if (cartId != null && newQuantity != null) {
        MySQL.findById('carts', cartId, (err, cart) => {
            if (cart != null) {
                MySQL.findById('products', cart.productId, (err, product) => {
                    const price = product.price * newQuantity - product.price * (product.discount / 100);
                    if (userId == cart.userId) {
                        MySQL.updateById('carts', cartId, (err, cart) => {
                            if (err) {
                                response.status(206).send({
                                    message: err,
                                    status: 200
                                });
                            } else {
                                response.status(200).json({
                                    message: 'Cart updated successfully',
                                    status: 200
                                });
                            }
                        },
                            {
                                quantity: newQuantity,
                                price: price,
                            });
                    } else {
                        response.status(206).send({
                            message: 'You do not cart owner',
                            status: 200
                        });
                    }
                });
            } else {
                response.status(200).send({
                    message: 'Cart not found',
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

API.get('/get-carts/:page', auth, (request, response, next) => {
    const page = request.params.page;
    const userId = request.userData.id;
    const limit = 10;
    var skip = (parseInt(page) - 1) * limit;
    if (skip < 0) skip = 0;
    MySQL.mQuery("SELECT products.*,products.id as productId,products.price as productPrice,products.discount as productDiscount,carts.*,categories.title as categoryTitle,categories.id as categoryId,categories.description as categoryDescription FROM carts JOIN products ON carts.productId = products.id and carts.orderId is null and carts.userId='" + userId + "' JOIN categories ON categories.id = products.categoryId LIMIT " + limit + ' OFFSET ' + skip + ";", (err, carts) => {
        response.status(200).json({
            status: 200,
            carts: carts.map((doc) => cart(doc)),
        });
    });
});


module.exports = API;