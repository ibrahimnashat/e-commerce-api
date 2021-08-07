module.exports = (res) => {
    return {
        id: res.id,
        title: res.title,
        createdAt: res.createdAt,
        user: {
            id: res.userId,
            name: res.name,
            fcmToken: res.fcmToken,
            apiToken: res.apiToken,
            email: res.email,
            image: res.image,
            verified: res.verified,
        },
    }
}