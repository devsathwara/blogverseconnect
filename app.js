const express = require('express');
const session = require('express-session');
const ejs = require('ejs');
const cors = require('cors');
const body = require('body-parser');
const mongoose = require('mongoose');
const mongoDBsession = require('connect-mongodb-session')(session);
const authRoute = require('./routes/auth'); // Import authRoute
const generalRoute = require('./routes/generalRouter'); // Import generalRoute
const userRoute = require('./routes/userRoutes'); // Import userRoute
const adminRouter = require('./routes/adminRouter'); // Import adminRouter

const app = express();
app.use(cors());
// Database Connection
mongoose.connect('mongodb+srv://devsathwara008:dev123456@cluster0.tfdn46c.mongodb.net/?retryWrites=true&w=majority',{
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB is connected')
});

// Session setup
const store = new mongoDBsession({
  uri: 'mongodb+srv://devsathwara008:dev123456@cluster0.tfdn46c.mongodb.net/?retryWrites=true&w=majority',
  collection: 'sessions'  
});
app.use(session({
  secret: 'myblogwebsite', 
  resave: false,
  saveUninitialized: false,
  store: store
}));


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(body.urlencoded({ extended: true }));
app.use(body.json());

// Use route handlers from separate files
app.use('/', generalRoute);
app.use('/', authRoute);
app.use('/', userRoute);
app.use('/', adminRouter);
app.listen(3000, () => {
    console.log('server is running on 3000 port');
});
