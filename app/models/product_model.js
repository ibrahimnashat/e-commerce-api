module.exports = (res) => {
    return {
        id: res.id,
        title: res.title,
        description: res.description,
        price: res.price,
        discount: res.discount,
        rating: res.rating,
        image: res.image,
        views: res.views,
        category: {
            id: res.categoryId,
            title: res.categoryTitle,
            description: res.categoryDescription
        },
    };
}