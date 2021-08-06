function getUserByEmail(email, database) {
  const users = Object.values(database);

  for (const user of users) {
    if (email === user.email) {
      return user;
    }
  }
}

module.exports = { getUserByEmail }