require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Import Models
const Etage = require('../models/Etage');
const Categorie = require('../models/Categorie');
const Boutique = require('../models/Boutique');
const Emplacement = require('../models/Emplacement');
// We need User model to create owners for boutiques
const User = require('../models/User');

const seedData = async () => {
    try {
        await connectDB();
        console.log('🔌 Connected to MongoDB');

        // Clear existing data
        await Etage.deleteMany({});
        await Categorie.deleteMany({});
        await Boutique.deleteMany({});
        await Emplacement.deleteMany({});
        // Optional: Clear users if you want to recreate them, but better to fetch or create generic ones
        // await User.deleteMany({}); 

        console.log('🧹 Cleared existing data');

        // 1. Create Default Users for Shops (if they don't exist, or just use one admin user for all)
        // For simplicity, we'll try to find an existing user or create a temporary one
        let owner = await User.findOne();
        if (!owner) {
            console.log('⚠️ No users found. Creating a default admin user for boutiques...');
            owner = await User.create({
                nom: 'Mbolatsiory',
                prenom: 'Rihantiana',
                email: 'admin@centrecommercial.mg',
                password: 'password123',
                role: 'admin',
                isApproved: true
            });
        }

        // 2. Create Categories
        const categoriesData = [
            { nom: 'Artisanat Malgache', description: 'Artisanat traditionnel et contemporain', icon: 'pi-star', couleur: '#E91E63' },
            { nom: 'Mode & Textiles', description: 'Vêtements et tissus traditionnels', icon: 'pi-shopping-bag', couleur: '#9C27B0' },
            { nom: 'Vanille & Épices', description: 'Vanille, poivre et épices de Madagascar', icon: 'pi-sun', couleur: '#FF9800' },
            { nom: 'Bijouterie', description: 'Bijoux en pierres précieuses et semi-précieuses', icon: 'pi-heart', couleur: '#2196F3' },
            { nom: 'Restauration', description: 'Cuisine malgache et internationale', icon: 'pi-shopping-cart', couleur: '#4CAF50' },
            { nom: 'Produits Locaux', description: 'Café, miel, huiles essentielles', icon: 'pi-home', couleur: '#00BCD4' }
        ];

        const categories = await Categorie.insertMany(categoriesData);
        console.log(`✅ Created ${categories.length} categories`);

        // Helper to get category ID by name
        const getCatId = (name) => categories.find(c => c.nom === name)._id;

        // 3. Create Etages
        const etagesData = [
            {
                nom: 'Rez-de-chaussée',
                niveau: 0,
                planImage: 'https://placehold.co/1200x800/E8EBF0/616161?text=Rez-de-chaussée'
            },
            {
                nom: 'Premier étage',
                niveau: 1,
                planImage: 'https://placehold.co/1200x800/E8EBF0/616161?text=Premier+étage'
            }
        ];

        const etages = await Etage.insertMany(etagesData);
        console.log(`✅ Created ${etages.length} etages`);

        const floor0 = etages.find(e => e.niveau === 0);
        const floor1 = etages.find(e => e.niveau === 1);

        // 4. Create Boutiques
        const boutiquesData = [
            {
                userId: owner._id,
                nom: 'Lamba Menakely',
                description: 'Tissus traditionnels malgaches et vêtements sur mesure',
                categorieId: getCatId('Mode & Textiles'),
                logo: 'https://placehold.co/200x200/9C27B0/FFFFFF?text=LM',
                heureOuverture: '08:00',
                heureFermeture: '18:00',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
                statut: 'validee'
            },
            {
                userId: owner._id,
                nom: 'Vanille d\'Antalaha',
                description: 'Vanille bourbon premium et produits dérivés',
                categorieId: getCatId('Vanille & Épices'),
                logo: 'https://placehold.co/200x200/FF9800/FFFFFF?text=VA',
                heureOuverture: '09:00',
                heureFermeture: '17:00',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
                statut: 'validee'
            },
            {
                userId: owner._id,
                nom: 'Restaurant Ravitoto',
                description: 'Cuisine traditionnelle malgache authentique',
                categorieId: getCatId('Restauration'),
                logo: 'https://placehold.co/200x200/4CAF50/FFFFFF?text=RR',
                heureOuverture: '11:00',
                heureFermeture: '22:00',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
                statut: 'validee'
            },
            {
                userId: owner._id,
                nom: 'Pierres de Madagascar',
                description: 'Bijoux artisanaux en pierres précieuses locales',
                categorieId: getCatId('Bijouterie'),
                logo: 'https://placehold.co/200x200/2196F3/FFFFFF?text=PM',
                heureOuverture: '09:00',
                heureFermeture: '18:30',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
                statut: 'validee'
            },
            {
                userId: owner._id,
                nom: 'Artisanat de Tana',
                description: 'Sculptures, vannerie et objets décoratifs malgaches',
                categorieId: getCatId('Artisanat Malgache'),
                logo: 'https://placehold.co/200x200/E91E63/FFFFFF?text=AT',
                heureOuverture: '08:30',
                heureFermeture: '18:00',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
                statut: 'validee'
            },
            {
                userId: owner._id,
                nom: 'Café de Sambava',
                description: 'Café arabica et robusta de la côte est',
                categorieId: getCatId('Produits Locaux'),
                logo: 'https://placehold.co/200x200/00BCD4/FFFFFF?text=CS',
                heureOuverture: '07:00',
                heureFermeture: '19:00',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
                statut: 'validee'
            },
            {
                userId: owner._id,
                nom: 'Épices d\'Antsirabe',
                description: 'Poivre sauvage, cannelle et gingembre de qualité',
                categorieId: getCatId('Vanille & Épices'),
                logo: 'https://placehold.co/200x200/FF9800/FFFFFF?text=EA',
                heureOuverture: '08:00',
                heureFermeture: '17:30',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
                statut: 'validee'
            },
            {
                userId: owner._id,
                nom: 'Soie Sauvage Landibe',
                description: 'Soie naturelle et textiles de luxe malgaches',
                categorieId: getCatId('Mode & Textiles'),
                logo: 'https://placehold.co/200x200/9C27B0/FFFFFF?text=SSL',
                heureOuverture: '09:00',
                heureFermeture: '18:00',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
                statut: 'validee'
            }
        ];

        const boutiques = await Boutique.insertMany(boutiquesData);
        console.log(`✅ Created ${boutiques.length} boutiques`);

        const getBoutiqueId = (name) => boutiques.find(b => b.nom === name)._id;

        // 5. Create Emplacements
        const emplacementsData = [
            // --- FLOOR 0 ---
            // Left side
            { etageId: floor0._id, numero: 'G-L1', coordonnees: { x: 50, y: 150, width: 120, height: 80 }, statut: 'occupe', boutiqueId: getBoutiqueId('Lamba Menakely') },
            { etageId: floor0._id, numero: 'G-L2', coordonnees: { x: 50, y: 250, width: 120, height: 80 }, statut: 'occupe', boutiqueId: getBoutiqueId('Vanille d\'Antalaha') },
            { etageId: floor0._id, numero: 'G-L3', coordonnees: { x: 50, y: 350, width: 120, height: 80 }, statut: 'libre' },
            { etageId: floor0._id, numero: 'G-L4', coordonnees: { x: 50, y: 450, width: 120, height: 80 }, statut: 'occupe', boutiqueId: getBoutiqueId('Restaurant Ravitoto') },
            { etageId: floor0._id, numero: 'G-L5', coordonnees: { x: 50, y: 550, width: 120, height: 80 }, statut: 'libre' },
            // Top side
            { etageId: floor0._id, numero: 'G-B1', coordonnees: { x: 200, y: 50, width: 100, height: 100 }, statut: 'occupe', boutiqueId: getBoutiqueId('Pierres de Madagascar') },
            { etageId: floor0._id, numero: 'G-B2', coordonnees: { x: 320, y: 50, width: 100, height: 100 }, statut: 'libre' },
            { etageId: floor0._id, numero: 'G-B3', coordonnees: { x: 440, y: 50, width: 100, height: 100 }, statut: 'occupe', boutiqueId: getBoutiqueId('Artisanat de Tana') },
            { etageId: floor0._id, numero: 'G-B4', coordonnees: { x: 560, y: 50, width: 100, height: 100 }, statut: 'libre' },
            { etageId: floor0._id, numero: 'G-B5', coordonnees: { x: 680, y: 50, width: 100, height: 100 }, statut: 'occupe', boutiqueId: getBoutiqueId('Café de Sambava') },
            { etageId: floor0._id, numero: 'G-B6', coordonnees: { x: 800, y: 50, width: 100, height: 100 }, statut: 'libre' },
            { etageId: floor0._id, numero: 'G-B7', coordonnees: { x: 920, y: 50, width: 100, height: 100 }, statut: 'libre' },
            // Right side
            { etageId: floor0._id, numero: 'G-R1', coordonnees: { x: 1030, y: 150, width: 120, height: 80 }, statut: 'libre' },
            { etageId: floor0._id, numero: 'G-R2', coordonnees: { x: 1030, y: 250, width: 120, height: 80 }, statut: 'occupe', boutiqueId: getBoutiqueId('Épices d\'Antsirabe') },
            { etageId: floor0._id, numero: 'G-R3', coordonnees: { x: 1030, y: 350, width: 120, height: 80 }, statut: 'libre' },
            { etageId: floor0._id, numero: 'G-R4', coordonnees: { x: 1030, y: 450, width: 120, height: 80 }, statut: 'occupe', boutiqueId: getBoutiqueId('Soie Sauvage Landibe') },
            { etageId: floor0._id, numero: 'G-R5', coordonnees: { x: 1030, y: 550, width: 120, height: 80 }, statut: 'libre' },

            // --- FLOOR 1 ---
            // Left side
            { etageId: floor1._id, numero: 'F1-L1', coordonnees: { x: 50, y: 150, width: 120, height: 80 }, statut: 'libre' },
            { etageId: floor1._id, numero: 'F1-L2', coordonnees: { x: 50, y: 250, width: 120, height: 80 }, statut: 'libre' },
            { etageId: floor1._id, numero: 'F1-L3', coordonnees: { x: 50, y: 350, width: 120, height: 80 }, statut: 'libre' },
            { etageId: floor1._id, numero: 'F1-L4', coordonnees: { x: 50, y: 450, width: 120, height: 80 }, statut: 'libre' },
            { etageId: floor1._id, numero: 'F1-L5', coordonnees: { x: 50, y: 550, width: 120, height: 80 }, statut: 'libre' },
            // Top side
            { etageId: floor1._id, numero: 'F1-B1', coordonnees: { x: 200, y: 50, width: 100, height: 100 }, statut: 'libre' },
            { etageId: floor1._id, numero: 'F1-B2', coordonnees: { x: 320, y: 50, width: 100, height: 100 }, statut: 'libre' },
            { etageId: floor1._id, numero: 'F1-B3', coordonnees: { x: 440, y: 50, width: 100, height: 100 }, statut: 'libre' },
            { etageId: floor1._id, numero: 'F1-B4', coordonnees: { x: 560, y: 50, width: 100, height: 100 }, statut: 'libre' },
            { etageId: floor1._id, numero: 'F1-B5', coordonnees: { x: 680, y: 50, width: 100, height: 100 }, statut: 'libre' },
            { etageId: floor1._id, numero: 'F1-B6', coordonnees: { x: 800, y: 50, width: 100, height: 100 }, statut: 'libre' },
            { etageId: floor1._id, numero: 'F1-B7', coordonnees: { x: 920, y: 50, width: 100, height: 100 }, statut: 'libre' },
            // Right side
            { etageId: floor1._id, numero: 'F1-R1', coordonnees: { x: 1030, y: 150, width: 120, height: 80 }, statut: 'libre' },
            { etageId: floor1._id, numero: 'F1-R2', coordonnees: { x: 1030, y: 250, width: 120, height: 80 }, statut: 'libre' },
            { etageId: floor1._id, numero: 'F1-R3', coordonnees: { x: 1030, y: 350, width: 120, height: 80 }, statut: 'libre' },
            { etageId: floor1._id, numero: 'F1-R4', coordonnees: { x: 1030, y: 450, width: 120, height: 80 }, statut: 'libre' },
            { etageId: floor1._id, numero: 'F1-R5', coordonnees: { x: 1030, y: 550, width: 120, height: 80 }, statut: 'libre' }
        ];

        const emplacements = await Emplacement.insertMany(emplacementsData);
        console.log(`✅ Created ${emplacements.length} emplacements`);

        console.log('✨ Seeding completed successfully');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
