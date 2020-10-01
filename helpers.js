const validateUser = (bcrypt, db, email, password) => {
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
  
  const checkEmail = (db, email) => {
    for (const nicename in db) {
      const currentUser = db[nicename]
      if (currentUser.email === email) {
        console.log('email matching')
        return true
      }
    }
    return null
  }
  module.exports = { validateUser, checkEmail }