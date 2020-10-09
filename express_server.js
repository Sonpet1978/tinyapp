

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');

const  { validateUser, checkEmail, isUsersLink, getUserByEmail }  = require("./helpers");

app.use(bodyParser.urlencoded({ extended: true }));
const salt = bcrypt.genSaltSync(10);


app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['Ithinkthatchickensintheprairiesareverygreat', 'Ithinkthatamandascatisgettingalotofattentioninthebackground']
}))

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");

//HASHING OF PASSWORDS
const hashedUser1PW = bcrypt.hashSync("purple-monkey-dinosaur", salt)
const hashedUser2PW = bcrypt.hashSync("dishwasher-funk", salt)


// CREATE OBJECT "USERS"
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: hashedUser1PW
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: hashedUser2PW
  }
};



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const urlDatabase2 = {
  b6UTxQ: {longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: {longURL: "https://www.google.ca", userID: "user2RandomID" }
};

//**********************ALL URLS FUNCTIONS */


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//*******************GET POST URLS */
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

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
   urlDatabase2[shortURL] = {};
   urlDatabase2[shortURL].longURL = req.body.longURL;      //generating a new url object
   urlDatabase2[shortURL].userID = req.session.id;
   res.redirect(`/urls/${shortURL}`);
 });



//*****************************S */
app.get("/urls/new", (req, res) => {
  if(req.session.id){
    const templateVars = {                                //if the user logged generating a new form
    username: req.session.email };
    res.render("urls_new", templateVars);
} else{
   res.render("login");                                  //if the user is not logged send him/her to the login page
}
});





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

app.post("/urls/:shortURL", (req, res) => {
  if(urlDatabase2[req.params.shortURL].userID === req.session.id){         //checking if the url belongs to the user
    urlDatabase2[req.params.shortURL].longURL = req.body.longURL;        //assigning a new longURL to the short
    res.redirect('/urls');
} else {
    res.render("login");                                                 //send the user to log in page if not logged in
}
  
  
});

///*******************DELETE URL */

app.post('/urls/:shortURL/delete', (req, res) => {
  if(urlDatabase2[req.params.shortURL].userID === req.session.id){        //checking if the url belongs to the user
    delete urlDatabase2[req.params.shortURL];                      //delete the url from the db
    res.redirect('/urls');
} else {
    res.render("login");                                            //send to login page if not logged in
}
});


//************************LOGIN GET POST FUNCTION  ************************* */
app.get("/login", (req, res) => {
  const templateVars = { error: null }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  console.log(req.body)
  const userObject = validateUser(bcrypt, users, req.body.email, req.body.password)
  if (userObject) {
    const id = matchKey(users, email);
        req.session.email = email;                               //set cookie session
        req.session.id = id;
        res.redirect('/urls');
  } else {
    console.log('Failed login attempt')
    res.redirect('/register');    
  }
})
 
//***********************LOGOUT POST */
app.post('/logout', (req, res) => {
  delete req.session.id
  res.redirect('/')
})

//********************************REGISTER GET POST FUNCTION */
app.get("/register", (req, res) => {
  const templateVars = { error: null }
  res.render("register", templateVars);
});


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


//************************************ */




//***************************LISTEN PORT  8080  **************************/
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//******************FUNCTIONS */
const checkValidEmail = (db, email) => {
  for (const nicename in db) {
    const currentUser = db[nicename]
    if (currentUser.email === email) {
      console.log('email matching')
      return true
    }
  }
  return null
}


const matchKey = function(obj, key){                         //function filteres the users db to find the corresponding id to the entered email
  for (let item in obj){
      if(users[item].email === key)
      return users[item].id;
  }
};

const validateCurrentUser = (bcrypt, db, email, password) => {
  for (const nicename in db) {
    const currentUser = db[nicename]
    if (currentUser.email === email) {
      console.log('email matching')
      if (bcrypt.compareSync(password, currentUser.password)) {
        console.log('password matching')

        return currentUser
      } else {
        return null
      }
    } else {
      console.log('email not matching')
    }
  }
  return null
}
function generateRandomString() {
  let newURL = "";
  newURL = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
  return newURL;
}