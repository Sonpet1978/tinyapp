

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/urlDatabase/:id', (req,res) => {
  console.log("URLS  SHOW route")
  //console.log(req.body);
  //console.log(req.query);
  // console.log(req.params);
  // console.log(req.params.id)
  // console.log(memes);
  const template_vars = {
      url: urlDatabase[req.params.id]
  }
  res.render('urls_show', template_vars)
});



app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });
  
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: generateRandomString(16) };
    res.render("urls_show", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });
  
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
  app.get("/hello", (req, res) => {
    //res.send("<html><body>Hello <b>World</b></body></html>\n");
    const templateVars = { greeting: 'Hello World!' };
    res.render("hello_world", templateVars);


  });

  app.get("/set", (req, res) => {
    const a = 1;
    res.send(`a = ${a}`);
   });
   
   app.get("/fetch", (req, res) => {
    res.send(`a = ${a}`);
   });

   app.post("/urls", (req, res) => {
    console.log(req.body);  // Log the POST request body to the console
    res.send("Ok");         // Respond with 'Ok' (we will replace this)
  });
  
  function generateRandomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 