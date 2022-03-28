const express = require('express');
const app = express();
const { validator, check } = require('express-validator');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const path = require('path');
const flash = require('flash');
const passport = require('passport');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { database } = require('./keys');
require('./lib/passport');

//set engine
app.use(express.static(__dirname));
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', engine({
    default: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    extName: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

//middlewars
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'claianjs',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database),
    cookie: { secure: true }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//global 
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.success = req.flash('message');
    app.locals.user = req.user;
    next();
});

//routes
app.use(require('./routes/index'));
app.use(require('./routes/auth'));

//public
app.use(express.static(path.join(__dirname, 'public')));

//setup port
app.listen(app.get('port'), () => {
    console.log('Server on port: ', app.get('port'));
})