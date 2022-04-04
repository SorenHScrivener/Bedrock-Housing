const express = require('express');
const path = require('path');
var phpExpress = require('php-express')({
    binPath: 'php'
});

const app = express();


app.engine('php', phpExpress.engine);
app.set('view engine', 'php');

app.all(/.+\.php$/, phpExpress.router);

// app.use(function (req, res, next) {
//     res.status(404).send("Sorry can't find that!")
// });

// app.set('views', path.join(__dirname, 'views'));

// app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('front-page')
})

const port = process.env.PORT || 10010;
app.listen(port, () => {
    console.log(`Port ${port} open!`)
})