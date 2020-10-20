const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const { validateUser, checkEmail, isUsersLink, getUserByEmail, generateRandomString } = require('./helpers');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
  }));


const urlDatabase2 = {      
    b6UTxQ: {longURL: "https://www.tsn.ca", userID: "userRandomID" },     //URL data base
    i3BoGr: {longURL: "https://www.google.ca", userID: "user2RandomID" }
};

const hashedChickenPW = bcrypt.hashSync("purple-monkey-dinosaur", salt)  //hashed passwords
const hashedDimitriPW = bcrypt.hashSync("dishwasher-funk", salt)
 
const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com",   //user data base
      password: hashedChickenPW
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: hashedDimitriPW
    }
  };

  

app.get("/", (req, res) => {
  const id = req.session.id;
  const user = id ? users[id] : null;                     // check if the cookie already exists with a legit id 
  if (user) {
    res.render("urls");
  } else {
      res.render("login");
  }

});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

// MAIN PAGE***************************************************************

//render the URLs list based on the login----------------------------------

app.get("/urls", (req, res) => {
    const id = req.session.id;
    const user = id ? users[id] : null;                     // check if the cookie already exists with a legit id 
    if (user) {
      let templateVars = { "urls": isUsersLink(urlDatabase2, id), username: req.session.email }; //constructs the list of urls and user email for the header
      res.render("urls_index", templateVars);
    } else {
        res.render("login");
    }

});



//log out---------------------------------------------------------

app.post('/logout', (req, res) => {
    req.session = null;                                        //delete cookies
    res.redirect('/urls');                                     //sends to login page
  });



// CREATE/EDIT URL IF LOGGED IN****************************************************************

//creating new URL and putting them to the DB----------------------

app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
     urlDatabase2[shortURL] = {};
     urlDatabase2[shortURL].longURL = req.body.longURL;      //generating a new url object
     urlDatabase2[shortURL].userID = req.session.id;
     res.redirect(`/urls/${shortURL}`);
   });

//render form for creation------------------------------------------

app.get("/urls/new", (req, res) => {
    if(req.session.id){
        const templateVars = {                                //if the user logged generating a new form
        username: req.session.email };
        res.render("urls_new", templateVars);
    } else{
       res.render("login");                                  //if the user is not logged send him/her to the login page
    }
});
//render the page with a single URL with editing URLs button--------------------------------


app.get("/urls/:shortURL", (req, res) => {
    if(urlDatabase2[req.params.shortURL].userID === req.session.id){   //if the user is logged in
        const templateVars = { shortURL: req.params.shortURL, 
            longURL: urlDatabase2[req.params.shortURL].longURL,    //generte the url object to display
            username: req.session.email };
        res.render("urls_show", templateVars);
    } else {
        res.render("login");                                        //send the user to log in page if not logged in
      
    }
  
});

//editing exsisting URLs----------------------------------------------

app.post('/urls/:shortURL', (req, res) => {
    if(urlDatabase2[req.params.shortURL].userID === req.session.id){         //checking if the url belongs to the user
        urlDatabase2[req.params.shortURL].longURL = req.body.longURL;        //assigning a new longURL to the short
        res.redirect('/urls');
    } else {
        res.render("login");                                                 //send the user to log in page if not logged in
    }
      
    });
    


// DELETE URL*********************************************************************************

app.post('/urls/:shortURL/delete', (req, res) => {
    if(urlDatabase2[req.params.shortURL].userID === req.session.id){        //checking if the url belongs to the user
        delete urlDatabase2[req.params.shortURL];                      //delete the url from the db
        res.redirect('/urls');
    } else {
        res.render("login");                                            //send to login page if not logged in
    }
  
});


// REGISTER FUNCTIONS************************************************************************


//rendering registration page--------------------------------------

app.get('/register', (req, res) => {
    const templateVars = { error: null }
    res.render("register", templateVars);
  });

//regestration process---------------------------------------------------



app.post('/register', (req, res) => {
    const id = generateRandomString(6);                                   //function is in the helpers.js file 
    const email = req.body.email;
    const prePassword = req.body.password;
    const password = bcrypt.hashSync(prePassword, salt);
    if(getUserByEmail(email, users)){                                      //checks if the user is already registered (function is in the helpers.js file)
        res.render('login');  
    } else {
        if (checkEmail(users, email, password)) {                            //check that fields are not empty
            res.send('404');
          } else {
            const newUser = {                                                //add the user to the user db
                id,
                email,
                password
            };
            users[id] = newUser;
            req.session.email = email;                                       //set cookie session
            req.session.id = id;
            res.redirect('/urls');
          }
    }
   
});

// LOGIN FUNCTIONS*****************************************************************

//rendering login page-----------------------------------------------

app.get("/login", (req, res) => {
    const templateVars = { error: null }
    res.render("login", templateVars);
  });
 


const matchKey = function(obj, key){                         //function filteres the users db to find the corresponding id to the entered email
    for (let item in obj){
        if(users[item].email === key)
        return users[item].id;
    }
};
//------------------------------------------------

//login process--------------------------------------------------

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (validateUser(bcrypt, users, email, password)){         //function is in the helpers.js file - matches the hashed password with the db
        const id = matchKey(users, email);
        req.session.email = email;                               //set cookie session
        req.session.id = id;
        res.redirect('/urls');
    } else {
        res.redirect('/register');                              //redirect to registration page if the user new
    }
});


// *************************************************************************************

//show the page for the long url----------------------


app.get('/u/:shortURL', (req, res) => {
    let sUrl = req.params.shortURL;   
    if (urlDatabase2[sUrl]) {
      res.redirect(urlDatabase2[sUrl].longURL);                       //redirects to the corresponding page if the url is in the db
    } else {
      res.send('Short URL Not Found. Unable to redirect');           //sends an error message if the url is not in the db
    }
  });

app.listen(PORT, () => {
    console.log( `Example app listening on port ${PORT}!`);
});

