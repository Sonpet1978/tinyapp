

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const { validateUser, checkEmail } = require('./helpers');
const helpers = require("./helpers");

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

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login", (req, res) => {
  const templateVars = { error: null }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  console.log(req.body)
  const userObject = validateCurrentUser(bcrypt, users, req.body.email, req.body.password)
  if (userObject) {
    req.session.id = userObject.id
    res.redirect('/')
  } else {
    console.log('Failed login attempt')
    res.render('login', { error: "Failed login attempt" })
  }
})

app.post('/logout', (req, res) => {
  delete req.session.id
  res.redirect('/')
})
app.get("/register", (req, res) => {
  const templateVars = { error: null }
  res.render("register", templateVars);
});


app.post('/register', (req, res) => {
 const { id , email , password} = req.body

 if (checkValidEmail(users, email)) {
  res.send('EMAIL ALREADY IN USE')
} else {
  const newUser = {
    id,
    email,
    password: bcrypt.hashSync(password, salt)
  }
  users[id] = newUser
  req.session.id = id
  res.redirect('/login')
}

});


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

/*app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });
  
  app.post("/urls", (req, res) => {
    console.log(req.body);  // Log the POST request body to the console
    // res.send("Ok");
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    console.log(urlDatabase);
    res.redirect(`/urls/${shortURL}`);

  });

  

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});*/


app.get("/urls", (req, res) => {
  // for (let key in urlDatabase) {
  //     let userID = urlDatabase[key].userID
  //     if (req.session.user_id === userID) {
  //       myUrls[key] = urlDatabase[key];

  // const templateVars = { urls: urlDatabase };
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.userId
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log('posted')
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  // res.redirect('/urls');

  // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.userId,
    username: req.cookies.userId
  };
  res.render("urls_new", templateVars);
});




/*app.post('/login', (req, res) => {
  const userId = req.body.username;
  res.cookie('userId', userId); // set the cookie's key and value
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('userId');
  res.redirect('/urls');
});*/

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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