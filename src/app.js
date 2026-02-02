require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connexion à la base de données
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dossier statique pour les uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Route de test
app.get('/', (req, res) => {
    res.json({
        message: 'API Centre Commercial - m1p13mean-tiarintsoa-jason',
        version: '1.0.0',
        status: 'running'
    });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/users', require('./routes/user.routes'));
// app.use('/api/boutiques', require('./routes/boutique.routes'));
// app.use('/api/categories', require('./routes/categorie.routes'));
// app.use('/api/etages', require('./routes/etage.routes'));
// app.use('/api/emplacements', require('./routes/emplacement.routes'));
// app.use('/api/produits', require('./routes/produit.routes'));
// app.use('/api/promotions', require('./routes/promotion.routes'));
// app.use('/api/notifications', require('./routes/notification.routes'));
// app.use('/api/centre', require('./routes/centre.routes'));

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Erreur serveur', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
});

module.exports = app;
