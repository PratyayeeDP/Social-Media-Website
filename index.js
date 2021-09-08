//require express:
const express=require('express');

//require cookie-parser:
const cookieParser=require('cookie-parser');
const app=express();

//define the port of our website:
const port=8000;

const expressLayouts=require('express-ejs-layouts');
const db=require('./config/mongoose');

//setup express-session:
const session=require('express-session');

//require passport and strategy that we have already set in config folder:
const passport=require('passport');
const passportLocal=require('./config/passport-local-strategy');
const passportJWT = require('./config/passport-jwt-strategy');
const passportGoogle = require('./config/passport-google-oauth2-strategy');

//require MongoStore. session is an argument passed to it;
const MongoStore=require('connect-mongodb-session')(session);

//require node-sass-middleware:
const sassMiddleware=require('node-sass-middleware');

//require connect-flash:
const flash=require('connect-flash');

//require the middleware for flash messages:
const customMware=require('./config/middleware');

// setup the chat server to be used with socket.io
const chatServer = require('http').Server(app);
const chatSockets = require('./config/chat_sockets').chatSockets(chatServer);
chatServer.listen(5000);
console.log('chat server is listening on port 5000');

app.use(sassMiddleware({
    src: './assets/scss',
    dest: './assets/css',
    debug:true,
    outputStyle:'extended',
    prefix: '/css'
}));
app.use(express.urlencoded());
app.use(cookieParser());

//define the location of our static files:
app.use(express.static('./assets'));
app.use(expressLayouts);

// make the uploads path available to the browser
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(expressLayouts);

//extract style and scripts from sub pages into the layout:
app.set('layout extractStyles',true);
app.set('layout extractScripts',true);

//set up the view engine
app.set('view engine', 'ejs');
app.set('views', './views');


//MongoStore is used to store the session cookie in the db
//we add a midddleware that takes in our session-cookie and encrypts it:
app.use(session({
    name: 'codeial',
    //TODO change the secret before deployment in production mode:
    secret: 'blahsomething',
    saveUninitialized: false,
    resave: false,
    cookie:{
        maxAge:(1000*60*100)
    },
    store: new MongoStore({
        mongooseConnection: db,
        autoRemove: 'disabled'
    },
    function(err){
        console.log(err || 'connect-mongodb setup okay');
    })
}));

//tell app to use passport and sessions:
app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

//set-up connect-flash:just after we set session:
app.use(flash());
app.use(customMware.setFlash);

//use express router
app.use('/',require('./routes'));

//make the app listen:
app.listen(port,function(err){
    //error:
    if(err){
        console.log(`Error in running the server: ${err}`);
    }
    //success:
    console.log(`Server is running on port: ${port}`);
});