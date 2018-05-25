cfg = require('./config.json');
const express = require('express');
const app     = express();
const user    = require('./routes/user');

// routes
app.get('/', (req,res) => res.render('index',{
  title:   'invalid endpoint', 
  message: 'Please visit /user/:github_username to view open PR requests by repo'}));
app.use('/user',user);

// startup
app.set('view engine', 'pug');
app.listen(3000, () => console.log('Example app listening on port 3000!'));