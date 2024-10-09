const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User=require('../models/user')
const express = require('express');
const userLogin=express.Router()
const tools = require('../utils/config');
const user = require('../models/user');


const getTokenFrom = (request) => {
    const authorization = request.get('authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '');
    }
    return null;
};

userLogin.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
       
        
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Username or password incorrect' });
        }

        const passwordCorrect = await bcrypt.compare(password, user.passwordHashed);
        if (!passwordCorrect) {
            return res.status(401).json({ error: 'Username or password incorrect' });
        }

        const userForToken = {
            username: user.username,
            id: user._id,
            
        };

        const token = jwt.sign(userForToken, tools.SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, username: user.username, id: user._id,name:user.name});
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

userLogin.post('/solde',async (req,res)=>{
    const username=req.body.username
    try{  
        const token = getTokenFrom(req);
        if (!token) {
            return res.status(401).json({ error: 'token missing or invalid' });
        }

        const decodedToken = jwt.verify(token, tools.SECRET);
        if (!decodedToken.id) {
            return res.status(401).json({ error: 'token invalid' });
        }

        const user = await User.findById(decodedToken.id); 
        if (!user) {
            return res.status(401).json({ error: 'admin not found' });
        }
        
        res.status(200).json(user)        
    } 
    catch(e){
        res.json(e)
        console.log(e)
    }
    

})
userLogin.post('/sendCredit',async (req,res)=>{
    const {usernameS,usernameR,credit,password}=req.body
  
   
    try{ 
        const token = getTokenFrom(req);
        if (!token) {
            return res.status(401).json({ error: 'token missing or invalid' });
        }

        const decodedToken = jwt.verify(token, tools.SECRET);
        if (!decodedToken.id) {
            return res.status(401).json({ error: 'token invalid' });
        }

        
        const receiver=await User.findOne({username:usernameR})
        const sender=await User.findOne({username:usernameS}) 
        const passwordCorrect = await bcrypt.compare(password, sender.passwordHashed);
        if (!passwordCorrect) {
            return res.status(401).json({ error: 'password incorrect' });
        }
        
        if (!sender || !receiver) {
            throw new Error('User not found');
          }
      
          if (sender.solde < credit) {
            throw new Error('Insufficient funds');
          }
      
        
            sender.solde=sender.solde-Number(credit)
            receiver.solde=receiver.solde+Number(credit)
            const transactionS = {
                amount: Number(credit) ,
                type: 'debit',
                timestamp: new Date(),
              };
              sender.transactionHistory.push(transactionS);
              const transactionR = {
                amount: Number(credit) ,
                type: 'credit',
                timestamp: new Date(),
              };
              receiver.transactionHistory.push(transactionR);
             
            await sender.save();
            await receiver.save();
            res.json("You have sent "+credit+" dirhams to "+receiver.name)
        
    } 
    catch(e){
        res.json(e)
    }
})

userLogin.post('/transaction',async (req,res)=>{
    try{
        const {username}=req.body
        const b=await User.findOne({username})
        res.json(b.transactionHistory)
    }
    catch(e){
        res.json(e)
    }

})

module.exports=userLogin