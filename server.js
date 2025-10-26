const express=require("express")
const app=express()
const dotenv=require("dotenv").config()
const connectDb=require("./config/connectionDb")
const cors=require("cors")

// Validate required environment variables
if (!process.env.CONNECTION_STRING) {
    console.error("❌ CONNECTION_STRING environment variable is required")
    process.exit(1)
}

if (!process.env.SECRET_KEY) {
    console.error("❌ SECRET_KEY environment variable is required")
    process.exit(1)
}

const PORT=process.env.PORT || 4000
connectDb()

app.use(express.json())
app.use(cors())

app.use("/",require("./routes/user"))
app.use("/recipe",require("./routes/recipe"))

app.listen(PORT,(err)=>{
    console.log(`app is listening on port ${PORT}`)
})