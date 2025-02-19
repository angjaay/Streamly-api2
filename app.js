const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const colors = require('colors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const fileupload = require('express-fileupload')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')

const errorHandler = require('./middleware/error')

const DBConnection = require('./config/db')

dotenv.config({ path: './config/.env' })

DBConnection()

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const categoryRoutes = require('./routes/categories')
const videoRoutes = require('./routes/videos')
const commentRoutes = require('./routes/comments')
const replyRoutes = require('./routes/replies')
const feelingRoutes = require('./routes/feelings')
const subscriptionRoutes = require('./routes/subscriptions')
const historiesRoutes = require('./routes/histories')
const searchRoutes = require('./routes/search')

const app = express()

app.use(express.json())

app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'))
}

// app.use(
// 	helmet({
// 	  crossOriginEmbedderPolicy: false,
// 	  // ...
// 	})
//   );

// File uploading
app.use(
	fileupload({
		createParentPath: true,
	})
)

// Sanitize data
app.use(mongoSanitize())

// Set security headers
app.use(helmet())

// Prevent XSS attacks
app.use(xss())

// Enable CORS
app.use(cors())

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 mins
//   max: 100 // 100 request per 10 mins
// })

// app.use(limiter)

// Prevent http param pollution
app.use(hpp())

app.use(express.static(path.join(__dirname, 'public')))

// app.use((req, res, next) => {
//   setTimeout(() => {
//     next()
//   }, 1000)
// })

const corsOptions = {
    origin: ["http://localhost:8080", "http://192.168.100.9:8080","http://localhost:8080/", "http://192.168.100.9:8080/", "https://streamly-web.netlify.app"],
    optionsSuccessStatus: 200,
    credentials: true
    
}

app.use(cors(corsOptions));


app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})


const versionOne = (routeName) => `/api/v1/${routeName}`

app.use(versionOne('auth'), authRoutes)
app.use(versionOne('users'), userRoutes)
app.use(versionOne('categories'), categoryRoutes)
app.use(versionOne('videos'), videoRoutes)
app.use(versionOne('comments'), commentRoutes)
app.use(versionOne('replies'), replyRoutes)
app.use(versionOne('feelings'), feelingRoutes)
app.use(versionOne('subscriptions'), subscriptionRoutes)
app.use(versionOne('histories'), historiesRoutes)
app.use(versionOne('search'), searchRoutes)

app.use(errorHandler)

const PORT = process.env.PORT

const server = app.listen(PORT, () => {
	console.log(
		`We are live on ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	)
})


// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`.red)
	// Close server & exit process
	server.close(() => process.exit(1))
})
