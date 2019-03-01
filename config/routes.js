const axios = require('axios');
const db = require('../database/dbConfig')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { authenticate, genToken } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  const {username, password} = req.body;
  if(!username || !password){
    res.status(422).json({message: "Username and password required!"})
  } else {
    const hash = bcrypt.hashSync(password, 10)
    db('users').insert({username, password: hash}).then(result => {
      if(result[0]){
        res.status(201).json({message: "Registration success", success: true})
      } else {
        res.status(401).json({message: "Failed to register user"})
      }
    }).catch(error => {
      res.status(500).json({message: error})
    })
  }
}

function login(req, res) {
  const {username, password} = req.body;
  if(!username || !password){
    res.status(422).json({message: "Username and password required"})
  } else {
    db('users').where({username}).first().then(user => {
      if(user){
        const checkPass = bcrypt.compareSync(password, user.password)
        if(checkPass){
          genToken(user).then(token => {
            res.json({message: "Login successful", token})
          })
          
        } else {
          res.status(401).json({message: "Invalid credentials"})
        }
      } else {
        res.status(404).json({message: "Invalid credentials"})
      }
    }).catch(error => {
      res.status(500).json({message: error})
    })
  }
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
