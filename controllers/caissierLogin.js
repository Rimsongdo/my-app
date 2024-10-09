const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Caissier = require('../models/caissier');
const User=require('../models/user')
const express = require('express');
const caissierLogin = express.Router();
const tools = require('../utils/config');
const Paiement=require('../models/paiement')



const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
      return authorization.replace('Bearer ', '');
  }
  return null;
};
// Create a new caissier
caissierLogin.post("/", async (req, res) => {
    try {
        const password = req.body.passwordHashed;
        const username=req.body.username
        const saltRounds = 10;
        const passwordHashed = await bcrypt.hash(password, saltRounds);
        const newCaissier = new Caissier({ username, passwordHashed });
        await newCaissier.save();
        res.status(201).json(newCaissier);
    } catch (error) {
        console.error('Error creating caissier:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login and generate a token
caissierLogin.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
       
        
        const caissier = await Caissier.findOne({ username });

        if (!caissier) {
            return res.status(401).json({ error: 'Username or password incorrect' });
        }

        const passwordCorrect = await bcrypt.compare(password, caissier.passwordHashed);
        if (!passwordCorrect) {
            return res.status(401).json({ error: 'Username or password incorrect' });
        }

        const userForToken = {
            username: caissier.username,
            id: caissier._id,
        };

        const token = jwt.sign(userForToken, tools.SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, username: caissier.username, id: caissier._id });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
caissierLogin.put('/payer', async (req, res) => {
    const { carteID,montant} = req.body; // Suppose que vous recevez carteID et montant du corps de la requête
  
    if (!carteID === undefined) {
      return res.status(400).json({ message: 'carteID et montant sont requis' });
    }
  
    try {
      // Trouver le client par carteID
      const client = await User.findOne({ carteID: carteID });
  
      if (!client) {
        return res.status(404).json({ message: 'Client non trouvé' });
      }
  
      // Mettre à jour le solde
      client.solde = client.solde - montant;
      const transaction = {
        amount: montant ,
        type: 'debit',
        timestamp: new Date(),
      };
      client.transactionHistory.push(transaction);
      // Sauvegarder les modifications
      await client.save();
  
      res.status(200).json({ message: 'Solde mis à jour avec succès', client });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  });

caissierLogin.post('/payment',async (req,res)=>{
    const {date,type}=req.body  
    try{
        const newPaiement=new Paiement({date,type})
        await newPaiement.save()
        res.status(201).json(newPaiement)
    }
    catch(e){
        console.log(e)
    }

})
caissierLogin.put('/lepaie', async (req, res) => {
    const { ID,client} = req.body;
    
    
  
    if (!ID === undefined) {
      return res.status(400).json({ message: 'ID est requis' });
    }  
  
    try {
      // Trouver le client par carteID
      const paiement = await Paiement.findOne({ _id: ID}); 
    
      
  
      if (!paiement) {   
        return res.status(404).json({ message: 'paiement non trouvé' });
      } 
  
      // Mettre à jour le solde
     
      const transaction = {      
        name:client.name,
        carteID:client.carteID,
        field:client.field,
        amount:client.amount,
        solde:client.amount, 
      };
      paiement.clientList.push(transaction);
      // Sauvegarder les modifications
      await paiement.save();
  
      res.status(200).json({ message: 'Solde mis à jour avec succès', client });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  });
  


module.exports = caissierLogin;
