const express=require("express")
const app=express()
require('dotenv').config()
// Note: filename is `connectionDB.js` (capital DB). Use exact case for Linux hosts like Render.
const connectDb = require('./config/connectionDB')
const cors = require('cors')

// Support multiple env var names so deployment is robust across providers/local setups.
// Priority: CONNECTION_STRING > MONGODB_URI, SECRET_KEY > JWT_SECRET
const NODE_ENV = process.env.NODE_ENV || 'development'
let CONNECTION_STRING = process.env.CONNECTION_STRING || process.env.MONGODB_URI
let SECRET_KEY = process.env.SECRET_KEY || process.env.JWT_SECRET

// In production require these values; in development provide safe defaults so local
// runs don't immediately exit. Always set real secrets in production!
if (NODE_ENV === 'production') {
    if (!CONNECTION_STRING) {
        console.error('❌ CONNECTION_STRING or MONGODB_URI environment variable is required in production')
        process.exit(1)
    }
    if (!SECRET_KEY) {
        console.error('❌ SECRET_KEY or JWT_SECRET environment variable is required in production')
        process.exit(1)
    }
} else {
    // Development defaults (local MongoDB) — change if you run a different local setup
    CONNECTION_STRING = CONNECTION_STRING || 'mongodb://127.0.0.1:27017/foodblog'
    SECRET_KEY = SECRET_KEY || 'dev_secret_key_change_me'
    console.warn('⚠️  Running in development mode. Using fallback CONNECTION_STRING and SECRET_KEY. Set environment variables for production.')
}

// Normalize into process.env for other modules that may read these names
process.env.CONNECTION_STRING = CONNECTION_STRING
process.env.SECRET_KEY = SECRET_KEY

const PORT = process.env.PORT || 4000

app.use(express.json())
// Configure CORS robustly. Use ALLOWED_ORIGIN env (comma-separated) if provided.
// Otherwise default to a safe list that includes the Netlify frontend and common
// local dev origins (Vite dev server on 5173). We use a dynamic origin function
// so Access-Control-Allow-Origin will be a specific origin (required when
// credentials=true) instead of '*'.
const rawAllowed = process.env.ALLOWED_ORIGIN || ''
const defaultAllowed = [
    'https://foodblog-frontend.netlify.app', // production frontend
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
const allowedOrigins = rawAllowed
    ? rawAllowed.split(',').map(s => s.trim()).filter(Boolean)
    : defaultAllowed

console.log('ℹ️  CORS allowed origins:', allowedOrigins)

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., curl, mobile apps, or same-origin)
        if (!origin) return callback(null, true)
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true)
        // Not allowed
        return callback(new Error('CORS policy: This origin is not allowed - ' + origin))
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // allow Authorization header and cookies where applicable
}

// Custom CORS middleware to avoid issues with library path parsing in some
// environments. This sets Access-Control-Allow-Origin to the request origin if
// it's in the allowed list, otherwise leaves it unset (browser will block).
app.use((req, res, next) => {
    const origin = req.headers.origin

    // Always allow non-origin requests (curl, server-to-server)
    if (!origin) {
        res.setHeader('Access-Control-Allow-Origin', '*')
    } else if (allowedOrigins.indexOf(origin) !== -1) {
        res.setHeader('Access-Control-Allow-Origin', origin)
        // Allow credentials (cookies/Authorization header) only for allowed origins
        res.setHeader('Access-Control-Allow-Credentials', 'true')
    } else {
        // Not allowed origin: do not set CORS headers. Browser will block cross-origin requests.
        // We still continue so the request can be logged or return an error body if desired.
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
})

// Basic health endpoint for hosting providers and monitoring
app.get('/health', (req, res) => {
    return res.status(200).json({ status: 'ok', timestamp: Date.now() })
})

// Root helpful message to avoid 404 noise when someone browses the API root
app.get('/', (req, res) => {
    return res.status(200).json({
        status: 'ok',
        message: 'FoodBlog Backend - API root. See /health and /recipe endpoints. For auth endpoints check / (user routes).'
    })
})

// Some Chromium/DevTools clients probe this path; respond with an empty JSON to avoid 404 spam in console
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
    return res.status(200).json({})
})

// API routes (mount with debug logs to isolate any route parsing errors)
console.log('📌 Mounting user routes at /')
app.use('/', require('./routes/user'))
console.log('📌 Mounting recipe routes at /recipe')
app.use('/recipe', require('./routes/recipe'))

// Connect to DB first, then start the HTTP server. If DB connection fails, exit
// to avoid running without required persistence.
connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ App is listening on port ${PORT} (env: ${NODE_ENV})`)
        })
    })
    .catch((err) => {
        console.error('❌ Failed to start server due to DB connection error:', err && err.message ? err.message : err)
        if (NODE_ENV === 'production') {
            // In production we must have the DB; exit so the process manager can restart / fail fast.
            process.exit(1)
        } else {
            // In development allow the server to start so you can work on frontend/local UX.
            console.warn('⚠️ Starting server without DB connection (development). Some features will be unavailable until MongoDB is started.')
            app.listen(PORT, () => {
                console.log(`✅ App is listening on port ${PORT} (dev, no DB)`)
            })
        }
    })

// 404 handler (catch-all) - helps Render / users see a JSON 404 instead of a static page
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Not Found',
        path: req.originalUrl
    })
})

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err && err.stack ? err.stack : err)
    if (res.headersSent) return next(err)
    res.status(err.status || 500).json({ status: 'error', message: err.message || 'Internal Server Error' })
})