const express = require('express');
const app = express();
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const path = require('path');

app.use(express.static(__dirname));
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('partials', path.join(__dirname + 'views/partials', 'partials'));

app.engine('.hbs', engine({
    default: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extName: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

//middlewars
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//app.use(bodyParser.json());

//global


//routes
app.use(require('./routes/index'));
app.use(require('./routes/auth'));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), () => {
    console.log('Server on port: ', app.get('port'));
})