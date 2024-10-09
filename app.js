// server.js
const express = require('express');
const mongoose = require('mongoose');
const config = require('./utils/config');
const cors = require('cors');
const CaissierLogin = require('./controllers/caissierLogin');
const UserLogin=require('./controllers/userLogin')
const AdminLogin=require('./controllers/adminLogin')

// Créez une application Express
const app = express();

// Connectez-vous à MongoDB
mongoose.connect(config.MONGODB_URL)
  .then(() => console.log('Connecté à MongoDB'))
  .catch((error) => console.error('Erreur de connexion à MongoDB:', error));

// Utilisez les middlewares Express
app.use(cors());
app.use(express.json());
app.use('/api/caissierLogin', CaissierLogin);
app.use('/api/userLogin',UserLogin);  
app.use('/api/adminLogin',AdminLogin) 



module.exports = app 
