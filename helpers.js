const validateUser = function (bcrypt, db, email, password) {
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
  
  const isUsersLink = function (object, id) {
    let usersObject = {};
    for (let key in object) {
      if (object[key].userID === id) {
        usersObject[key] = object[key];
      }
    }
    return usersObject;
  };

  const checkEmail = function (db, email)  {
    for (const nicename in db) {
      const currentUser = db[nicename]
      if (currentUser.email === email) {
        console.log('email matching')
        return true
      }
    }
    return null
  }
  module.exports = { validateUser, checkEmail , isUsersLink }