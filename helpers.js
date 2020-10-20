const checkEmail = (email, password ) => { //checks if the fields"password" & " email" are empty
      if (email === "" || password === "") {
        return true;
      }
    return false;
  };


  const getUserByEmail = function(email, db) { //checks if the entered email corresponds with the data base
    for (const id in db) {
      const currentUser = db[id];
    if(currentUser.email === email){
      return true;
    }
    return false;
  }
  };


 
  
const validateUser = (bcrypt, db, email, password ) => {   //checks if the entered password matches with the data base
  for (const id in db) {
    const currentUser = db[id];
    if (email === currentUser.email){
      if (bcrypt.compareSync(password, currentUser.password)) {
        return true;
      } else {
        return false;
      } 
    }
  }
   return false;
};
  


const isUsersLink = function (object, id) { // filters the url db and constructs the list of urls for the user
  let usersObject = {};
  for (let key in object) {
    if (object[key].userID === id) {
      usersObject[key] = object[key];
    }
  }
  return usersObject;
};

const generateRandomString = function () { // generates a random string
    let newURL = "";
    newURL = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
    return newURL;
}


  module.exports = { checkEmail, validateUser, isUsersLink, getUserByEmail, generateRandomString  }