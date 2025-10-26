const express=require("express")
const app=express()
const dotenv=require("dotenv").config()
// Note: filename is `connectionDB.js` (capital DB). Use exact case for Linux hosts like Render.
const connectDb = require("./config/connectionDB")
const cors=require("cors")

// Support multiple env var names so deployment is robust across providers/local setups.
// Priority: CONNECTION_STRING > MONGODB_URI, SECRET_KEY > JWT_SECRET
const CONNECTION_STRING = process.env.CONNECTION_STRING || process.env.MONGODB_URI
const SECRET_KEY = process.env.SECRET_KEY || process.env.JWT_SECRET

// Validate required environment variables (use aliases above)
if (!CONNECTION_STRING) {
    console.error("❌ CONNECTION_STRING or MONGODB_URI environment variable is required")
    process.exit(1)
}

if (!SECRET_KEY) {
    console.error("❌ SECRET_KEY or JWT_SECRET environment variable is required")
    process.exit(1)
}

// Normalize into process.env for other modules that read these names
process.env.CONNECTION_STRING = CONNECTION_STRING
process.env.SECRET_KEY = SECRET_KEY

const PORT = process.env.PORT || 4000
connectDb()

app.use(express.json())
// Configure CORS with optional ALLOWED_ORIGIN for production
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*'
app.use(cors({
    origin: allowedOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))

// Basic health endpoint for hosting providers and monitoring
app.get('/health', (req, res) => {
    return res.status(200).json({ status: 'ok', timestamp: Date.now() })
})

// API routes
app.use('/', require('./routes/user'))
app.use('/recipe', require('./routes/recipe'))

app.listen(PORT,(err)=>{
    console.log(`app is listening on port ${PORT}`)
})