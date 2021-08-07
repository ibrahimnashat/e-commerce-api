module.exports = (res) => {
    console.log(res);
    return {
        id: res.id,
        price: res.price,
        discount: res.discount,
        quantity: res.quantity,
        product: {
            id: res.productId,
            description: res.description,
            price: res.productPrice,
            createdAt: res.createdAt,
            title: res.title,
            image: res.image,
            rating: res.rating,
            discount: res.productDiscount,
            views: res.views,
            category: {
                id: res.categoryId,
                title: res.categoryTitle,
                description: res.categoryDescription
            }
        },
    };
}