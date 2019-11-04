const { Router } = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config');
const verifyToken = require('./verifyToken');

const router = Router();

router.post('/register', async (req, res, next) => {
    const { username, email, password } = req.body;
    const user = new User ({
        username: username,
        email: email,
        password: password
    });

    user.password = await user.encryptPassword(user.password);
    await user.save();

    const token = jwt.sign({id: user._id}, config.secret, { expiresIn: 60 * 60 * 24 });


    res.json({
        auth: true,
        token
    });
});

router.post('/login', async (req, res, next) => {

    const { email, password } = req.body;

    const user = await User.findOne({email: email});

    if(!user) {
        return res.status(404).send("No email found")        
    }

    const validPassword = await user.validatePassword(password);
    
    if(!validPassword) {
        return res.status(401).json({
            auth: false,
            token: null
        }); 
    };

    const token = jwt.sign({id: user._id}, config.secret, { expiresIn: 60 * 60 *24});

    res.json({
        auth: true,
        token
    });    
});

router.get('/profile', verifyToken, async (req, res, next) => {

    const user = await User.findById(req.userId, {password: 0, username: 0});

    if(!user) {
        return res.status(404).send("No user found")
    }
    res.json(user);
});


module.exports = router;