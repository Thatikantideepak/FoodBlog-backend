const jwt = require('jsonwebtoken')

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization']
    if (!authHeader) {
        return res.status(401).json({ message: 'Missing Authorization header' })
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2) {
        return res.status(401).json({ message: 'Invalid Authorization header format' })
    }

    const token = parts[1]
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid or expired token' })
        }
        req.user = decoded
        next()
    })
}

module.exports = verifyToken