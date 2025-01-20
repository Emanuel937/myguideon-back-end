const express = require('express');
const app     = express();
const routers = require('./routes/index');
const cors    = require('cors'); 
const path    = require('path');

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/test-image', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/uploads/1/cover/1736949932307.jpeg'));
});


// Configuration CORS pour autoriser seulement le front-end spécifique
app.use(cors({
  origin: 'http://localhost:3000', // Remplacez par l'URL de votre front-end
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Si vous avez des en-têtes personnalisés
}));

// Utilisation du middleware pour parser le JSON
app.use(express.json());

// Routes
app.use('/', routers);

const PORT = 3030;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
