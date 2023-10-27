const express = require("express");
var path = require('path');
const exphbs = require('express-handlebars');

const app = express();
const port = process.env.PORT || 3003;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


require('./models');


// authentication and passport set up
const passport = require('passport');
const flash = require('express-flash')  // for showing login error messages
const session = require('express-session')  // for managing user sessions
require('./passport.js')(passport);

app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    name: 'info3005-project',
    resave: false,
    proxy: process.env.NODE_ENV === 'production',
    saveUninitialized: false,
    cookie: {
      sameSite: 'strict',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3000000
    },
}));
app.use(passport.initialize());
app.use(passport.session());



// configure Handlebars 
app.engine('hbs', exphbs.engine({      
  defaultlayout: 'main',
  extname: 'hbs' ,
  helpers: require("./public/js/helpers.js").helpers,
})) ;
// set Handlebars view engine
app.set('view engine', 'hbs')  ; 



app.use(express.static(__dirname + '/'));


// home page 
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/static/start_page.html")
});

//about diabets page
app.get("/about_diabetes", (req, res) => {
  res.sendFile(__dirname + "/static/diabetes_grid.html")
});

//about team page
app.get("/about_team", (req, res) => {
  res.sendFile(__dirname + "/static/team_grid.html")
});

//about login page 
app.get("/login_page", (req, res) => {
  res.sendFile(__dirname + "/static/login_start.html")
});


// middleware
const router = require("./routes/Router.js");
const { env } = require("process");
app.use("/home", router);



// running app
app.listen(port, () =>
  console.log("> Server is up and running on http://localhost:" + port)
);