const express = require('express');
const API = express.Router();
const MySQL = require('../db_controlling/sql_controller');
const auth = require('../auth/autherization');
const uploader = require('../uploader/image_controller');
const product = require('../models/product_model');

API.post('/add', auth, uploader.single('image'), (request, response, next) => {
    const title = request.body.title;
    const description = request.body.description;
    const price = request.body.price;
    const discount = request.body.discount;
    const rating = request.body.rating;
    const categoryId = request.body.categoryId;
    const image = request.file.path;
    if (title != null && description != null && price != null && categoryId != null && image != null) {
        const ops = {};
        ops['title'] = title;
        ops['description'] = description;
        ops['price'] = price;
        ops['categoryId'] = categoryId;
        ops['image'] = image.replace('\\', '/');
        if (discount != null) ops['discount'] = discount;
        if (rating != null) ops['rating'] = rating;
        console.log(ops);
        MySQL.insert('products', (err, product) => {
            response.json({
                product: product,
                status: 200
            });
        }, ops);
    } else {
        response.status(206).send({
            message: 'Invaild data',
            status: 206
        });
    }

});

API.get('/get-products/:page', auth, (request, response, next) => {
    const page = request.params.page;
    const limit = 10;
    var skip = (parseInt(page) - 1) * limit;
    if (skip < 0) skip = 0;
    MySQL.mQuery('Select products.*,categories.title as categoryTitle,categories.id as categoryId,categories.description as categoryDescription from products join categories on products.categoryId=categories.id LIMIT ' + limit + ' OFFSET ' + skip, (err, products) => {
        response.json({
            products: products.map((value) => product(value)),
            status: 200
        });
    });
});

API.post('/get-products-by-category/:page', auth, (request, response, next) => {
    const page = request.params.page;
    const limit = 10;
    var skip = (parseInt(page) - 1) * limit;
    if (skip < 0) skip = 0;
    const categoryId = request.body.categoryId;
    if (categoryId != null) {
        MySQL.mQuery("Select products.*,categories.title as categoryTitle,categories.id as categoryId,categories.description as categoryDescription from products join categories on products.categoryId=categories.id and categories.id ='" + categoryId + "' LIMIT " + limit + ' OFFSET ' + skip, (err, products) => {
            response.json({
                products: products.map((value) => product(value)),
                status: 200
            });
        });
    } else {
        response.status(206).send({
            message: "CatgoryId is not valid",
            status: 206
        })
    }
});


API.post('/product-details', auth, (request, response, next) => {
    const productId = request.body.productId;
    if (productId != null) {
        MySQL.mQuery("Select products.*,categories.title as categoryTitle,categories.id as categoryId,categories.description as categoryDescription from products join categories on products.categoryId=categories.id and products.id ='" + productId + "'", (err, products) => {
            try {
                if (products[0] != null) {
                    response.json({
                        product: product(products[0]),
                        status: 200
                    });
                } else {
                    response.status(200).send({
                        product: null,
                        status: 200
                    });
                }
            } catch (error) {
                response.status(206).send({
                    message: error,
                    status: 206
                });
            }
        });
    } else {
        response.status(206).send({
            message: "ProductId is not valid",
            status: 206
        });
    }
});

API.post('/add-rating', auth, (request, response, next) => {
    const productId = request.body.productId;
    const rating = request.body.rating;
    if (productId != null && rating != null) {
        MySQL.insert('rating', (err, rate) => {
            MySQL.mQuery("select AVG(rate) AS ratingAvg from rating where productId='" + productId + "'", (err, value) => {
                MySQL.updateById('products', productId, (err, product) => {
                    response.json({
                        product: product,
                        message: 'Rating has been added succesfully',
                        status: 200
                    });
                },
                    {
                        rating: value[0].ratingAvg
                    });
            });
        },
            {
                productId: productId,
                rate: rating
            });
    } else {
        response.status(206).send({
            message: "Data is invalid",
            status: 206
        });
    }
});

API.post('/increase-view-by-one', auth, (request, response, next) => {
    const productId = request.body.productId;
    if (productId != null) {
        MySQL.findById('products', productId, (err, product) => {
            if (product != null) {
                MySQL.updateById('products', productId, (err, product) => {
                    response.json({
                        message: 'Views increased succesfully',
                        views: product.views,
                        status: 200
                    });
                },
                    {
                        views: product.views + 1
                    });

            } else {
                response.status(200).send({
                    product: null,
                    status: 200
                });
            }

        });

    } else {
        response.status(206).send({
            message: "ProductId is not valid",
            status: 206
        });
    }
});

API.get('/get-new-products/:page', auth, (request, response, next) => {
    const page = request.params.page;
    const limit = 10;
    var skip = (parseInt(page) - 1) * limit;
    if (skip < 0) skip = 0;
    MySQL.mQuery('Select products.*,categories.title as categoryTitle,categories.id as categoryId,categories.description as categoryDescription from products join categories on products.categoryId=categories.id ORDER BY createdAt ASC LIMIT ' + limit + ' OFFSET ' + skip, (err, products) => {
        response.json({
            products: products.map((value) => product(value)),
            status: 200
        });
    });
});


API.get('/get-products', auth, (request, response, next) => {
    MySQL.mQuery('Select products.*,categories.title as categoryTitle,categories.id as categoryId,categories.description as categoryDescription from products join categories on products.categoryId=categories.id', (err, products) => {
        response.json({
            products: products.map((value) => product(value)),
            status: 200
        });
    });
});


module.exports = API;