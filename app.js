require('dotenv').config()
const express = require('express')
const userRoutes = require('./routes/users')
const postRoutes = require('./routes/posts')
const app = express()

app.use(express.json())

app.use('/', userRoutes)
app.use('/', postRoutes)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
