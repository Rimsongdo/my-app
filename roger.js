// websocketServer.js
const WebSocket = require('ws');
const http = require('http');
const mongoose = require('mongoose');
const config = require('./utils/config');
const User = require('./models/user');

// Créez un serveur HTTP pour le WebSocket
const server = http.createServer();
const wsServerPort = 8000; // Port pour le serveur WebSocket

// Configurez le serveur WebSocket
const wss = new WebSocket.Server({ server });

// Créez un client WebSocket pour se connecter au serveur WebSocket de l'ESP8266
const esp8266Ip = '192.168.1.10'; // Adresse IP de l'ESP8266
const esp8266Port = 81; // Port sur lequel le WebSocket ESP8266 écoute
const ws = new WebSocket(`ws://${esp8266Ip}:${esp8266Port}`);

let leClientNumber;
let leClient;
mongoose.connect(config.MONGODB_URL)
  .then(() => console.log('Connecté à MongoDB pour WebSocket'))
  .catch((error) => console.error('Erreur de connexion à MongoDB pour WebSocket:', error));

// Événement de connexion WebSocket client
ws.on('open', () => {
  console.log('Connecté au serveur WebSocket de l\'ESP8266');
});

// Événement de réception de message WebSocket client
ws.on('message', async (data) => {
  leClientNumber = data.toString();
  console.log('Données reçues de l\'ESP8266:', leClientNumber);

  try {
    leClient = await User.find({ carteID: leClientNumber.toString() }).exec();
    console.log('Données reçues de la base de données:', leClient);

    // Envoyer les données aux clients WebSocket connectés
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'userData', data: leClient }));
      }
    })
  } catch (e) {
    console.log(e);
  }
});

// Événement d'erreur WebSocket client
ws.on('error', (error) => {
  console.error('Erreur WebSocket:', error);
});

// Événement de fermeture de connexion WebSocket client
ws.on('close', () => {
  console.log('Déconnecté du serveur WebSocket de l\'ESP8266');
});

// Configurez le serveur WebSocket pour accepter les connexions entrantes
wss.on('connection', (socket) => {
  console.log('Client WebSocket connecté');

  // Événement de réception de message WebSocket serveur
  socket.on('message', (message) => {
    console.log('Message reçu du client WebSocket:', message);
  });

  // Événement de déconnexion
  socket.on('close', () => {
    console.log('Client WebSocket déconnecté');
  });

  // Événement d'erreur
  socket.on('error', (error) => {
    console.error('Erreur WebSocket serveur:', error);
  });
});

// Démarrer le serveur WebSocket
server.listen(wsServerPort, () => {
  console.log(`Serveur WebSocket en écoute sur le port ${wsServerPort}`);
});
  
// Connectez-vous à MongoDB (si nécessaire pour WebSocket)

