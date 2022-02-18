const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @url           POST /user/create
// @description   create new user
// @access-mode   public
router.post('/create', async (req, res) => {
  try {
    const {name, email, password} = req.body;

    let user = await User.findOne({email});
    if (user) {
      throw new Error('User already exists');
    }

    user = {
      username: name,
      email: email,
      password: password
    }

    const newUser = new User(user);
    await newUser.save();
    const token = await newUser.generateAuthToken();
    res.status(200).send({status: 'User Created', user: newUser, token: token});
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
})

// @url           GET /user/getuser
// @description   get user profile
// @access-mode   private
router.get('/getuser', auth, async (req, res) => {
  try {
    res.status(200).send({status: 'User fetched', user: req.user});
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
})

// @url           POST /user/login
// @description   login to user profile
// @access-mode   public
router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.status(200).send({status: 'Login success', token: token, user: user});
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
})

// @url           POST /user/logout
// @description   logout from user profile
// @access-mode   private
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    })
    await req.user.save();
    res.status(200).send('Logout successfully');
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
})

module.exports = router;