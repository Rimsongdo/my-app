const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin=require('../models/admin')
const express = require('express');
const User=require('../models/user')
const Caissier = require('../models/caissier');
const adminLogin=express.Router()
const tools = require('../utils/config');



const getTokenFrom = (request) => {
    const authorization = request.get('authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '');
    }
    return null;
};

adminLogin.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
       
        
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(401).json({ error: 'Username or password incorrect' });
        }

        const passwordCorrect = await bcrypt.compare(password, admin.passwordHashed);
        if (!passwordCorrect) {
            return res.status(401).json({ error: 'Username or password incorrect' });
        }

        const userForToken = {
            username: admin.username,
            id: admin._id,
        };

        const token = jwt.sign(userForToken, tools.SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, username: admin.username, id: admin._id });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

adminLogin.get('/clients',async (req,res)=>{
    try{
        const clients=await User.find({})
        const a = clients.map(objet => (objet.name));
        res.json(a)
    }
    catch(e){
        res.json(e)
    }
})

module.exports=adminLogin