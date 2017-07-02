const express = require('express');
const bodyParser = require('body-parser');

const app = express();



// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

app.use(require('./routes/web')); 

app.listen(process.env.PORT || 5000, function(){
    console.log('listening on', process.env.PORT || 5000 );
});