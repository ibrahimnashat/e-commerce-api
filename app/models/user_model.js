module.exports = (res) => {
    return {
        id: res.id,
        name: res.name,
        fcmToken: res.fcmToken,
        apiToken: res.apiToken,
        email: res.email,
        image: res.image,
        verified: res.verified,
    }
}