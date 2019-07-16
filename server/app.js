const express = require('express');
//const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
//const compression = require('compression');
//const createError = require('http-errors');
const bodyParser = require('body-parser');
const routes = require('./routes/index'); //changed
const auth = require('./lib/auth');

module.exports = (config) => {
    const app = express();

    const limiter = new RateLimit({
        windowMs: 15*60*1000,
        max: 150,
        delayMs: 0
    });

    app.locals.title = config.sitename;

    app.use('/', express.static(path.join(__dirname, '../public'))); //the '/' specifies where root (home) is, so in this case it would be at the html directory
    //app.use(express.static(__dirname)); //needs to be public

    //app.get('/favicon.ico', (req, res) => res.sendStatus(204));

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cookieParser());

    app.use(limiter);

    if (app.get('env') === 'production'){
        app.set('trust proxy', 'loopback');
        app.use(session({
            secret: 'another very secret 12345',
            name: 'sessionId',
            proxy: true,
            cookie: {secure: true},
            resave: true,
            saveUninitialized: false,
            store: new MongoStore({mongooseConnection: mongoose.connection})
        }));
    } else { 
        
        app.use(session({
            secret: 'very secret 12345',
            resave: true,
            saveUninitialized: false,
            store: new MongoStore({ mongooseConnection: mongoose.connection })
        }))
        
    }

    app.use(auth.initialize); //need to setup auth
    app.use(auth.session);
    app.use(auth.setUser);

    app.use('/', routes());

    // catch 404 and forward to error handler
    /*
    app.use((req, res, next) => {
        next(createError(404));
    });
    */

    
    if (app.get('env') === 'development') {
        app.locals.pretty = true;
    }
    
   return app;
}
