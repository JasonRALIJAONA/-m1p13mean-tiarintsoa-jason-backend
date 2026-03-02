require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Import Models
const Etage = require('../models/Etage');
const Categorie = require('../models/Categorie');
const Boutique = require('../models/Boutique');
const Emplacement = require('../models/Emplacement');
const LocationEmplacement = require('../models/LocationEmplacement');
const DemandeBoutique = require('../models/DemandeBoutique');
const User = require('../models/User');
const Produit = require('../models/Produit');
const Promotion = require('../models/Promotion');

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------
const daysAgo  = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const daysFrom = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };

const seedData = async () => {
    try {
        await connectDB();
        console.log('🔌 Connected to MongoDB');

        // ------------------------------------------------------------------
        // 0. Clear all collections
        // ------------------------------------------------------------------
        await Promise.all([
            User.deleteMany({}),
            Etage.deleteMany({}),
            Categorie.deleteMany({}),
            Boutique.deleteMany({}),
            Emplacement.deleteMany({}),
            LocationEmplacement.deleteMany({}),
            DemandeBoutique.deleteMany({}),
            Produit.deleteMany({}),
            Promotion.deleteMany({}),
        ]);
        console.log('🧹 Cleared all collections');

        // ------------------------------------------------------------------
        // 1. Users
        //    Passwords are hashed by the pre-save hook — use .create() not insertMany()
        //    Admin  : admin@mall.mg        / Admin1234
        //    Shops  : prenom.nom@mail.mg   / Boutique1234
        //    Buyers : acheteur1@mail.mg    / Acheteur1234
        // ------------------------------------------------------------------
        const admin = await User.create({
            nom: 'Rakoto', prenom: 'Andry',
            email: 'admin@lacity.mg',
            password: 'LaCity2026*!',
            role: 'admin', isApproved: true
        });

        const shopOwners = await Promise.all([
            User.create({ nom: 'Rasoa',     prenom: 'Lalaina',  email: 'lalaina.rasoa@mail.mg',    password: 'Boutique1234', role: 'boutique', isApproved: true }),
            User.create({ nom: 'Rakoton',   prenom: 'Hery',     email: 'hery.rakoton@mail.mg',     password: 'Boutique1234', role: 'boutique', isApproved: true }),
            User.create({ nom: 'Randria',   prenom: 'Noro',     email: 'noro.randria@mail.mg',     password: 'Boutique1234', role: 'boutique', isApproved: true }),
            User.create({ nom: 'Rafarae',   prenom: 'Mamy',     email: 'mamy.rafarae@mail.mg',     password: 'Boutique1234', role: 'boutique', isApproved: true }),
            User.create({ nom: 'Rajao',     prenom: 'Tina',     email: 'tina.rajao@mail.mg',       password: 'Boutique1234', role: 'boutique', isApproved: true }),
            User.create({ nom: 'Rabenja',   prenom: 'Fano',     email: 'fano.rabenja@mail.mg',     password: 'Boutique1234', role: 'boutique', isApproved: true }),
            User.create({ nom: 'Ratsimba',  prenom: 'Zo',       email: 'zo.ratsimba@mail.mg',      password: 'Boutique1234', role: 'boutique', isApproved: true }),
            User.create({ nom: 'Maharavo',  prenom: 'Soa',      email: 'soa.maharavo@mail.mg',     password: 'Boutique1234', role: 'boutique', isApproved: true }),
            // Pending approval (has submitted a demande but not yet approved)
            User.create({ nom: 'Ravoson',   prenom: 'Lova',     email: 'lova.ravoson@mail.mg',     password: 'Boutique1234', role: 'boutique', isApproved: false }),
        ]);

        const buyers = await Promise.all([
            User.create({ nom: 'Andriantsi', prenom: 'Mirana', email: 'mirana@mail.mg', password: 'Acheteur1234', role: 'acheteur', isApproved: true }),
            User.create({ nom: 'Raherison',  prenom: 'Lanto',  email: 'lanto@mail.mg',  password: 'Acheteur1234', role: 'acheteur', isApproved: true }),
        ]);

        console.log(`✅ Created ${1 + shopOwners.length + buyers.length} users`);

        // ------------------------------------------------------------------
        // 2. Categories
        // ------------------------------------------------------------------
        const categoriesData = [
            { nom: 'Artisanat Malgache', description: 'Artisanat traditionnel et contemporain',      icon: 'pi-star',          couleur: '#E91E63' },
            { nom: 'Mode & Textiles',    description: 'Vêtements et tissus traditionnels',            icon: 'pi-shopping-bag',  couleur: '#9C27B0' },
            { nom: 'Vanille & Épices',   description: 'Vanille, poivre et épices de Madagascar',      icon: 'pi-sun',           couleur: '#FF9800' },
            { nom: 'Bijouterie',         description: 'Bijoux en pierres précieuses et semi-précieuses', icon: 'pi-heart',      couleur: '#2196F3' },
            { nom: 'Restauration',       description: 'Cuisine malgache et internationale',           icon: 'pi-shopping-cart', couleur: '#4CAF50' },
            { nom: 'Produits Locaux',    description: 'Café, miel, huiles essentielles',              icon: 'pi-home',          couleur: '#00BCD4' }
        ];
        const categories = await Categorie.insertMany(categoriesData);
        const cat = (name) => categories.find(c => c.nom === name)._id;
        console.log(`✅ Created ${categories.length} categories`);

        // ------------------------------------------------------------------
        // 3. Floors
        // ------------------------------------------------------------------
        const etages = await Etage.insertMany([
            { nom: 'Rez-de-chaussée', niveau: 0, planImage: 'https://placehold.co/1200x800/E8EBF0/616161?text=Rez-de-chauss%C3%A9e' },
            { nom: 'Premier étage',   niveau: 1, planImage: 'https://placehold.co/1200x800/E8EBF0/616161?text=Premier+%C3%A9tage'   }
        ]);
        const floor0 = etages.find(e => e.niveau === 0);
        const floor1 = etages.find(e => e.niveau === 1);
        console.log(`✅ Created ${etages.length} étages`);

        // ------------------------------------------------------------------
        // 4. Slots — pure geometry, no statut / boutiqueId
        // ------------------------------------------------------------------
        const emplacementsData = [
            // Rez-de-chaussée — left wall
            { etageId: floor0._id, numero: 'G-L1', coordonnees: { x: 50,  y: 150, width: 120, height: 80 } },
            { etageId: floor0._id, numero: 'G-L2', coordonnees: { x: 50,  y: 250, width: 120, height: 80 } },
            { etageId: floor0._id, numero: 'G-L3', coordonnees: { x: 50,  y: 350, width: 120, height: 80 } },
            { etageId: floor0._id, numero: 'G-L4', coordonnees: { x: 50,  y: 450, width: 120, height: 80 } },
            { etageId: floor0._id, numero: 'G-L5', coordonnees: { x: 50,  y: 550, width: 120, height: 80 } },
            // Rez-de-chaussée — top wall
            { etageId: floor0._id, numero: 'G-B1', coordonnees: { x: 200, y: 50,  width: 100, height: 100 } },
            { etageId: floor0._id, numero: 'G-B2', coordonnees: { x: 320, y: 50,  width: 100, height: 100 } },
            { etageId: floor0._id, numero: 'G-B3', coordonnees: { x: 440, y: 50,  width: 100, height: 100 } },
            { etageId: floor0._id, numero: 'G-B4', coordonnees: { x: 560, y: 50,  width: 100, height: 100 } },
            { etageId: floor0._id, numero: 'G-B5', coordonnees: { x: 680, y: 50,  width: 100, height: 100 } },
            { etageId: floor0._id, numero: 'G-B6', coordonnees: { x: 800, y: 50,  width: 100, height: 100 } },
            { etageId: floor0._id, numero: 'G-B7', coordonnees: { x: 920, y: 50,  width: 100, height: 100 } },
            // Rez-de-chaussée — right wall
            { etageId: floor0._id, numero: 'G-R1', coordonnees: { x: 1030, y: 150, width: 120, height: 80 } },
            { etageId: floor0._id, numero: 'G-R2', coordonnees: { x: 1030, y: 250, width: 120, height: 80 } },
            { etageId: floor0._id, numero: 'G-R3', coordonnees: { x: 1030, y: 350, width: 120, height: 80 } },
            { etageId: floor0._id, numero: 'G-R4', coordonnees: { x: 1030, y: 450, width: 120, height: 80 } },
            { etageId: floor0._id, numero: 'G-R5', coordonnees: { x: 1030, y: 550, width: 120, height: 80 } },
            // Premier étage — left wall
            { etageId: floor1._id, numero: 'F1-L1', coordonnees: { x: 50,  y: 150, width: 120, height: 80 } },
            { etageId: floor1._id, numero: 'F1-L2', coordonnees: { x: 50,  y: 250, width: 120, height: 80 } },
            { etageId: floor1._id, numero: 'F1-L3', coordonnees: { x: 50,  y: 350, width: 120, height: 80 } },
            { etageId: floor1._id, numero: 'F1-L4', coordonnees: { x: 50,  y: 450, width: 120, height: 80 } },
            { etageId: floor1._id, numero: 'F1-L5', coordonnees: { x: 50,  y: 550, width: 120, height: 80 } },
            // Premier étage — top wall
            { etageId: floor1._id, numero: 'F1-B1', coordonnees: { x: 200, y: 50,  width: 100, height: 100 } },
            { etageId: floor1._id, numero: 'F1-B2', coordonnees: { x: 320, y: 50,  width: 100, height: 100 } },
            { etageId: floor1._id, numero: 'F1-B3', coordonnees: { x: 440, y: 50,  width: 100, height: 100 } },
            { etageId: floor1._id, numero: 'F1-B4', coordonnees: { x: 560, y: 50,  width: 100, height: 100 } },
            { etageId: floor1._id, numero: 'F1-B5', coordonnees: { x: 680, y: 50,  width: 100, height: 100 } },
            { etageId: floor1._id, numero: 'F1-B6', coordonnees: { x: 800, y: 50,  width: 100, height: 100 } },
            { etageId: floor1._id, numero: 'F1-B7', coordonnees: { x: 920, y: 50,  width: 100, height: 100 } },
            // Premier étage — right wall
            { etageId: floor1._id, numero: 'F1-R1', coordonnees: { x: 1030, y: 150, width: 120, height: 80 } },
            { etageId: floor1._id, numero: 'F1-R2', coordonnees: { x: 1030, y: 250, width: 120, height: 80 } },
            { etageId: floor1._id, numero: 'F1-R3', coordonnees: { x: 1030, y: 350, width: 120, height: 80 } },
            { etageId: floor1._id, numero: 'F1-R4', coordonnees: { x: 1030, y: 450, width: 120, height: 80 } },
            { etageId: floor1._id, numero: 'F1-R5', coordonnees: { x: 1030, y: 550, width: 120, height: 80 } },
        ];
        const emplacements = await Emplacement.insertMany(emplacementsData);
        const emp = (numero) => emplacements.find(e => e.numero === numero);
        console.log(`✅ Created ${emplacements.length} emplacements`);

        // ------------------------------------------------------------------
        // 5. Boutiques (one per shop owner)
        // ------------------------------------------------------------------
        const boutiquesData = [
            // index 0 — permanent tenant since 1 year ago
            {
                userId: shopOwners[0]._id,
                nom: 'Lamba Menakely',
                description: 'Tissus traditionnels malgaches et vêtements sur mesure. Création locale depuis 2018.',
                categorieId: cat('Mode & Textiles'),
                logo: 'https://placehold.co/200x200/9C27B0/FFFFFF?text=LM',
                heureOuverture: '08:00', heureFermeture: '18:00',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
                statut: 'validee'
            },
            // index 1 — permanent tenant, no end date
            {
                userId: shopOwners[1]._id,
                nom: "Vanille d'Antalaha",
                description: 'Vanille bourbon premium et produits dérivés directement des plantations du nord-est.',
                categorieId: cat('Vanille & Épices'),
                logo: 'https://placehold.co/200x200/FF9800/FFFFFF?text=VA',
                heureOuverture: '09:00', heureFermeture: '17:00',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
                statut: 'validee'
            },
            // index 2 — permanent tenant
            {
                userId: shopOwners[2]._id,
                nom: 'Restaurant Ravitoto',
                description: 'Cuisine traditionnelle malgache authentique — ravitoto, romazava, vary amin\'anana.',
                categorieId: cat('Restauration'),
                logo: 'https://placehold.co/200x200/4CAF50/FFFFFF?text=RR',
                heureOuverture: '11:00', heureFermeture: '22:00',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
                statut: 'validee'
            },
            // index 3 — permanent tenant
            {
                userId: shopOwners[3]._id,
                nom: 'Pierres de Madagascar',
                description: 'Bijoux artisanaux en pierres précieuses locales — saphirs, améthystes, laplazurite.',
                categorieId: cat('Bijouterie'),
                logo: 'https://placehold.co/200x200/2196F3/FFFFFF?text=PM',
                heureOuverture: '09:00', heureFermeture: '18:30',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
                statut: 'validee'
            },
            // index 4 — temporary location, ends in 60 days
            {
                userId: shopOwners[4]._id,
                nom: 'Artisanat de Tana',
                description: 'Sculptures sur bois, vannerie et objets décoratifs malgaches faits à la main.',
                categorieId: cat('Artisanat Malgache'),
                logo: 'https://placehold.co/200x200/E91E63/FFFFFF?text=AT',
                heureOuverture: '08:30', heureFermeture: '18:00',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
                statut: 'validee'
            },
            // index 5 — permanent tenant
            {
                userId: shopOwners[5]._id,
                nom: 'Café de Sambava',
                description: 'Café arabica et robusta de la côte est, torréfaction artisanale sur place.',
                categorieId: cat('Produits Locaux'),
                logo: 'https://placehold.co/200x200/00BCD4/FFFFFF?text=CS',
                heureOuverture: '07:00', heureFermeture: '19:00',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
                statut: 'validee'
            },
            // index 6 — temporary location on floor 1, ends in 30 days
            {
                userId: shopOwners[6]._id,
                nom: "Épices d'Antsirabe",
                description: 'Poivre sauvage, cannelle de Ceylan, gingembre frais et mélanges pour la cuisine malgache.',
                categorieId: cat('Vanille & Épices'),
                logo: 'https://placehold.co/200x200/FF9800/FFFFFF?text=EA',
                heureOuverture: '08:00', heureFermeture: '17:30',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
                statut: 'validee'
            },
            // index 7 — location EXPIRED 10 days ago (to test expired-location logic)
            {
                userId: shopOwners[7]._id,
                nom: 'Soie Sauvage Landibe',
                description: 'Soie naturelle et textiles de luxe malgaches — ancienne locataire, bail expiré.',
                categorieId: cat('Mode & Textiles'),
                logo: 'https://placehold.co/200x200/9C27B0/FFFFFF?text=SSL',
                heureOuverture: '09:00', heureFermeture: '18:00',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
                statut: 'rejetee'  // expired — no longer active
            }
        ];
        const boutiques = await Boutique.insertMany(boutiquesData);
        const bId = (name) => boutiques.find(b => b.nom === name)._id;
        console.log(`✅ Created ${boutiques.length} boutiques`);

        // ------------------------------------------------------------------
        // 6. LocationEmplacement records
        //    Mix of: permanent (dateFin: null), temporary, and one expired
        // ------------------------------------------------------------------
        const locationsData = [
            // --- Rez-de-chaussée permanent tenants ---
            {
                // dummy demandeId reuses admin _id as placeholder (no real demande for seeded data)
                demandeId: admin._id,
                boutiqueId: bId('Lamba Menakely'),
                emplacementId: emp('G-L1')._id,
                userId: shopOwners[0]._id,
                dateDebut: daysAgo(365),
                dateFin: null                     // indeterminate — permanent
            },
            {
                demandeId: admin._id,
                boutiqueId: bId("Vanille d'Antalaha"),
                emplacementId: emp('G-L2')._id,
                userId: shopOwners[1]._id,
                dateDebut: daysAgo(300),
                dateFin: null
            },
            {
                demandeId: admin._id,
                boutiqueId: bId('Restaurant Ravitoto'),
                emplacementId: emp('G-L4')._id,
                userId: shopOwners[2]._id,
                dateDebut: daysAgo(180),
                dateFin: null
            },
            {
                demandeId: admin._id,
                boutiqueId: bId('Pierres de Madagascar'),
                emplacementId: emp('G-B1')._id,
                userId: shopOwners[3]._id,
                dateDebut: daysAgo(240),
                dateFin: null
            },
            {
                demandeId: admin._id,
                boutiqueId: bId('Café de Sambava'),
                emplacementId: emp('G-B5')._id,
                userId: shopOwners[5]._id,
                dateDebut: daysAgo(120),
                dateFin: null
            },
            // --- Temporary tenants (active, will expire) ---
            {
                demandeId: admin._id,
                boutiqueId: bId('Artisanat de Tana'),
                emplacementId: emp('G-B3')._id,
                userId: shopOwners[4]._id,
                dateDebut: daysAgo(30),
                dateFin: new Date('2027-06-30')   // temporary — expires mid-2027
            },
            {
                demandeId: admin._id,
                boutiqueId: bId("Épices d'Antsirabe"),
                emplacementId: emp('F1-L1')._id,
                userId: shopOwners[6]._id,
                dateDebut: daysAgo(10),
                dateFin: new Date('2027-03-31')   // temporary — expires end of Q1 2027
            },
            // --- Expired location (ended 10 days ago — slot is free again) ---
            {
                demandeId: admin._id,
                boutiqueId: bId('Soie Sauvage Landibe'),
                emplacementId: emp('G-R2')._id,
                userId: shopOwners[7]._id,
                dateDebut: daysAgo(90),
                dateFin: daysAgo(10)              // expired — slot G-R2 is now free
            }
        ];
        const locations = await LocationEmplacement.insertMany(locationsData);
        console.log(`✅ Created ${locations.length} locations (${locations.filter(l => !l.dateFin).length} permanentes, ${locations.filter(l => l.dateFin && l.dateFin > new Date()).length} temporaires, 1 expirée)`);

        // ------------------------------------------------------------------
        // 7. Pending DemandeBoutique (to populate the admin panel)
        // ------------------------------------------------------------------
        const demandesData = [
            {
                userId: shopOwners[8]._id,      // Lova Ravoson — pending user
                nomBoutique: 'Miel de la Forêt',
                description: 'Miel naturel et produits de la ruche collectés dans les forêts malgaches.',
                categorieId: cat('Produits Locaux'),
                heureOuverture: '08:00', heureFermeture: '17:00',
                joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
                emplacementSouhaiteId: emp('G-L3')._id,   // free slot
                dateDebutSouhaitee: daysFrom(15),
                dateFinSouhaitee: daysFrom(105),          // 3-month trial
                statut: 'en_attente'
            },
            {
                userId: shopOwners[1]._id,      // existing owner requesting a second slot
                nomBoutique: "Vanille d'Antalaha — Kiosque",
                description: 'Kiosque dégustation pour les nouvelles gammes de produits à base de vanille.',
                categorieId: cat('Vanille & Épices'),
                heureOuverture: '10:00', heureFermeture: '16:00',
                joursOuverture: ['samedi', 'dimanche'],
                emplacementSouhaiteId: emp('F1-B2')._id,  // free floor 1 slot
                dateDebutSouhaitee: daysFrom(7),
                dateFinSouhaitee: daysFrom(37),           // 1-month pop-up
                statut: 'en_attente'
            }
        ];
        const demandes = await DemandeBoutique.insertMany(demandesData);
        console.log(`✅ Created ${demandes.length} demandes en attente`);

        // ------------------------------------------------------------------
        // 8. Produits — 4-5 per active boutique
        // ------------------------------------------------------------------
        const produitsData = [
            // Lamba Menakely — vêtements
            { boutiqueId: bId('Lamba Menakely'), nom: 'Lamba soie naturelle', description: 'Tissu traditionnel en soie naturelle de Madagascar, teint à la main.', prix: 85000, image: 'https://placehold.co/400x300/8B5CF6/FFFFFF?text=Lamba+Soie', enAvant: true },
            { boutiqueId: bId('Lamba Menakely'), nom: 'Salovana homme', description: 'Tenue officielle en coton brodé, tailles S–XL.', prix: 120000, image: 'https://placehold.co/400x300/8B5CF6/FFFFFF?text=Salovana', enAvant: false },
            { boutiqueId: bId('Lamba Menakely'), nom: 'Rabane tissée', description: 'Tissu raphia tressé à la main, idéal pour sacs et décoration.', prix: 45000, image: 'https://placehold.co/400x300/8B5CF6/FFFFFF?text=Rabane', enAvant: false },
            { boutiqueId: bId('Lamba Menakely'), nom: 'Lamba mena cérémonie', description: 'Lamba rouge traditionnel utilisé lors des cérémonies Famadihana.', prix: 160000, image: 'https://placehold.co/400x300/8B5CF6/FFFFFF?text=Lamba+Mena', enAvant: true },

            // Vanille d'Antalaha — épices & extraits
            { boutiqueId: bId("Vanille d'Antalaha"), nom: 'Gousses de vanille Bourbon', description: 'Gousses de vanille Bourbon entières, 50 g, origine Antalaha.', prix: 35000, image: 'https://placehold.co/400x300/D97706/FFFFFF?text=Vanille+Bourbon', enAvant: true },
            { boutiqueId: bId("Vanille d'Antalaha"), nom: 'Extrait de vanille pur', description: 'Extrait liquide 100 ml, sans sucre ajouté, double concentration.', prix: 28000, image: 'https://placehold.co/400x300/D97706/FFFFFF?text=Extrait+Vanille', enAvant: false },
            { boutiqueId: bId("Vanille d'Antalaha"), nom: 'Poudre de vanille', description: 'Gousses séchées et broyées, sachet 20 g.', prix: 18000, image: 'https://placehold.co/400x300/D97706/FFFFFF?text=Poudre+Vanille', enAvant: false },
            { boutiqueId: bId("Vanille d'Antalaha"), nom: 'Coffret dégustation épices', description: 'Assortiment vanille, girofle et poivre Sauvage, idéal cadeau.', prix: 75000, image: 'https://placehold.co/400x300/D97706/FFFFFF?text=Coffret+Epices', enAvant: true },

            // Restaurant Ravitoto — plats à emporter
            { boutiqueId: bId('Restaurant Ravitoto'), nom: 'Ravitoto sy hen\'omby', description: 'Plat traditionnel : feuilles de manioc pilées avec viande de zébu.', prix: 22000, image: 'https://placehold.co/400x300/059669/FFFFFF?text=Ravitoto', enAvant: true },
            { boutiqueId: bId('Restaurant Ravitoto'), nom: 'Romazava', description: 'Bouillon de viande et brèdes, plat national malgache.', prix: 20000, image: 'https://placehold.co/400x300/059669/FFFFFF?text=Romazava', enAvant: false },
            { boutiqueId: bId('Restaurant Ravitoto'), nom: 'Vary amin\'anana', description: 'Riz aux brèdes de légumes verts, accompagnement traditionnel.', prix: 12000, image: 'https://placehold.co/400x300/059669/FFFFFF?text=Vary+Anana', enAvant: false },
            { boutiqueId: bId('Restaurant Ravitoto'), nom: 'Koba vary', description: 'Dessert malgache à base de cacahuètes et riz sucré enveloppé en feuille de bananier.', prix: 8000, image: 'https://placehold.co/400x300/059669/FFFFFF?text=Koba+Vary', enAvant: true },

            // Pierres de Madagascar — gemmes & bijoux
            { boutiqueId: bId('Pierres de Madagascar'), nom: 'Améthyste brute', description: 'Cristal d\'améthyste naturel, 200-300 g, couleur violette intense.', prix: 55000, image: 'https://placehold.co/400x300/7C3AED/FFFFFF?text=Amethyste', enAvant: true },
            { boutiqueId: bId('Pierres de Madagascar'), nom: 'Labradorite polie', description: 'Pierre polie à reflets bleutés, 5-8 cm, pièce unique.', prix: 42000, image: 'https://placehold.co/400x300/7C3AED/FFFFFF?text=Labradorite', enAvant: false },
            { boutiqueId: bId('Pierres de Madagascar'), nom: 'Bague tourmaline rose', description: 'Bague artisanale en argent 925 sertie d\'une tourmaline rose de Madagascar.', prix: 185000, image: 'https://placehold.co/400x300/7C3AED/FFFFFF?text=Tourmaline+Rose', enAvant: true },
            { boutiqueId: bId('Pierres de Madagascar'), nom: 'Saphir bleu brut', description: 'Saphir naturel non traité, 2-3 carats, certificat d\'origine inclus.', prix: 320000, image: 'https://placehold.co/400x300/7C3AED/FFFFFF?text=Saphir+Bleu', enAvant: true },
            { boutiqueId: bId('Pierres de Madagascar'), nom: 'Quartz rose poli', description: 'Quartz rose en forme de cœur, 100-150 g, idéal décoration.', prix: 18000, image: 'https://placehold.co/400x300/7C3AED/FFFFFF?text=Quartz+Rose', enAvant: false },

            // Artisanat de Tana — objets artisanaux
            { boutiqueId: bId('Artisanat de Tana'), nom: 'Panier tressé raphia', description: 'Panier artisanal en raphia naturel, motifs géométriques, Ø 35 cm.', prix: 32000, image: 'https://placehold.co/400x300/B45309/FFFFFF?text=Panier+Raphia', enAvant: true },
            { boutiqueId: bId('Artisanat de Tana'), nom: 'Sculpture zébu en bois', description: 'Figurine zébu sculptée à la main en bois de palissandre, 20 cm.', prix: 48000, image: 'https://placehold.co/400x300/B45309/FFFFFF?text=Zebu+Bois', enAvant: false },
            { boutiqueId: bId('Artisanat de Tana'), nom: 'Masque traditionnel', description: 'Masque cérémoniel Sakalava peint à la main, bois sacré.', prix: 95000, image: 'https://placehold.co/400x300/B45309/FFFFFF?text=Masque+Trad', enAvant: true },
            { boutiqueId: bId('Artisanat de Tana'), nom: 'Nappe brodée soie', description: 'Nappe en tissu de soie avec broderies florales, 120×180 cm.', prix: 145000, image: 'https://placehold.co/400x300/B45309/FFFFFF?text=Nappe+Brodee', enAvant: false },

            // Café de Sambava — café & thé
            { boutiqueId: bId('Café de Sambava'), nom: 'Café Arabica Sambava 250 g', description: 'Café 100 % Arabica de Sambava, torréfaction artisanale, sachet 250 g.', prix: 24000, image: 'https://placehold.co/400x300/92400E/FFFFFF?text=Cafe+Arabica', enAvant: true },
            { boutiqueId: bId('Café de Sambava'), nom: 'Café Robusta intenso', description: 'Mélange Robusta puissant, idéal espresso, sachet 250 g moulu.', prix: 19000, image: 'https://placehold.co/400x300/92400E/FFFFFF?text=Cafe+Robusta', enAvant: false },
            { boutiqueId: bId('Café de Sambava'), nom: 'Thé de Tsaratanana vert', description: 'Thé vert des hauts plateaux, récolte manuelle, 50 g.', prix: 15000, image: 'https://placehold.co/400x300/92400E/FFFFFF?text=The+Vert', enAvant: false },
            { boutiqueId: bId('Café de Sambava'), nom: 'Coffret café & thé', description: 'Assortiment 3 cafés + 2 thés malgaches, emballage cadeau inclus.', prix: 65000, image: 'https://placehold.co/400x300/92400E/FFFFFF?text=Coffret+Cafe', enAvant: true },

            // Épices d'Antsirabe — épices locales
            { boutiqueId: bId("Épices d'Antsirabe"), nom: 'Poivre noir Tsaratanana', description: 'Poivre noir en grains, récolte manuelle, sachets de 100 g.', prix: 14000, image: 'https://placehold.co/400x300/1F2937/FFFFFF?text=Poivre+Noir', enAvant: true },
            { boutiqueId: bId("Épices d'Antsirabe"), nom: 'Gingembre séché', description: 'Gingembre des hautes terres séché et tranché, sachet 80 g.', prix: 9000, image: 'https://placehold.co/400x300/1F2937/FFFFFF?text=Gingembre', enAvant: false },
            { boutiqueId: bId("Épices d'Antsirabe"), nom: 'Curcuma en poudre', description: 'Curcuma bio certifié d\'Antsirabe, pot 100 g, couleur dorée intense.', prix: 11000, image: 'https://placehold.co/400x300/1F2937/FFFFFF?text=Curcuma', enAvant: false },
            { boutiqueId: bId("Épices d'Antsirabe"), nom: 'Mélange curry malgache', description: 'Blend exclusif de 7 épices locales, sachet 50 g, recette secrète de famille.', prix: 16000, image: 'https://placehold.co/400x300/1F2937/FFFFFF?text=Curry+Malgache', enAvant: true },
        ];
        const produits = await Produit.insertMany(produitsData);
        console.log(`✅ Created ${produits.length} produits`);

        // ------------------------------------------------------------------
        // 9. Promotions — 5 actives, 3 à venir, 1 expirée
        // ------------------------------------------------------------------
        const now = new Date();
        const pastDate  = (days) => new Date(now.getTime() - days * 86400000);
        const futureDate = (days) => new Date(now.getTime() + days * 86400000);

        const promotionsData = [
            // Active promotions (dateDebut ≤ now ≤ dateFin)
            {
                boutiqueId: bId('Lamba Menakely'),
                titre: 'Soldes textiles printemps',
                description: 'Remise sur toute la gamme Lamba et Lamba Mena jusqu\'à fin juin.',
                dateDebut: pastDate(10),
                dateFin: new Date('2027-06-30'),
                image: 'https://placehold.co/600x200/8B5CF6/FFFFFF?text=Soldes+Lamba',
                reduction: 20
            },
            {
                boutiqueId: bId("Vanille d'Antalaha"),
                titre: 'Fête des saveurs — Vanille',
                description: 'Achetez 2 produits vanille, obtenez 15 % de remise immédiate.',
                dateDebut: pastDate(5),
                dateFin: new Date('2027-04-30'),
                image: 'https://placehold.co/600x200/D97706/FFFFFF?text=Fete+Vanille',
                reduction: 15
            },
            {
                boutiqueId: bId('Pierres de Madagascar'),
                titre: 'Collection gemmes rares',
                description: 'Réduction exceptionnelle sur les saphirs et tourmalines jusqu\'à épuisement du stock.',
                dateDebut: pastDate(20),
                dateFin: new Date('2027-12-31'),
                image: 'https://placehold.co/600x200/7C3AED/FFFFFF?text=Gemmes+Rares',
                reduction: 10
            },
            {
                boutiqueId: bId('Café de Sambava'),
                titre: 'Happy hour café',
                description: 'De 10h à 12h chaque jour : 25 % sur tous les cafés en grains.',
                dateDebut: pastDate(3),
                dateFin: new Date('2027-08-31'),
                image: 'https://placehold.co/600x200/92400E/FFFFFF?text=Happy+Hour+Cafe',
                reduction: 25
            },
            {
                boutiqueId: bId('Artisanat de Tana'),
                titre: 'Ventes artisanales été',
                description: 'Profitez de 30 % de remise sur les paniers et sculptues en bois.',
                dateDebut: pastDate(1),
                dateFin: new Date('2027-07-15'),
                image: 'https://placehold.co/600x200/B45309/FFFFFF?text=Artisanat+Ete',
                reduction: 30
            },

            // Upcoming promotions (dateDebut > now)
            {
                boutiqueId: bId('Restaurant Ravitoto'),
                titre: 'Menu spécial fêtes 2027',
                description: 'Menu traditionnel 5 plats à prix fixe pour les fêtes de fin d\'année.',
                dateDebut: futureDate(30),
                dateFin: new Date('2027-01-10'),
                image: 'https://placehold.co/600x200/059669/FFFFFF?text=Menu+Fetes+2027',
                reduction: null
            },
            {
                boutiqueId: bId("Épices d'Antsirabe"),
                titre: 'Journée des épices',
                description: 'Une journée dédiée aux épices malgaches avec dégustation gratuite et -20 % sur tout.',
                dateDebut: futureDate(15),
                dateFin: futureDate(15),
                image: 'https://placehold.co/600x200/1F2937/FFFFFF?text=Journee+Epices',
                reduction: 20
            },
            {
                boutiqueId: bId("Vanille d'Antalaha"),
                titre: 'Nouvelle récolte 2026',
                description: 'Arrivage de la récolte 2026 : gousses premium en édition limitée.',
                dateDebut: futureDate(45),
                dateFin: new Date('2027-03-31'),
                image: 'https://placehold.co/600x200/D97706/FFFFFF?text=Recolte+2026',
                reduction: 5
            },

            // Expired promotion (dateFin < now)
            {
                boutiqueId: bId('Lamba Menakely'),
                titre: 'Ouverture — remise inauguration',
                description: 'Promotion de lancement : -35 % sur la collection complète pendant 7 jours.',
                dateDebut: pastDate(60),
                dateFin: pastDate(53),
                image: 'https://placehold.co/600x200/8B5CF6/FFFFFF?text=Inauguration',
                reduction: 35
            },
        ];
        const promotions = await Promotion.insertMany(promotionsData);
        console.log(`✅ Created ${promotions.length} promotions`);

        // ------------------------------------------------------------------
        // Summary
        // ------------------------------------------------------------------
        console.log('\n✨ Seeding completed successfully');
        console.log('───────────────────────────────────────────');
        console.log('  Comptes de connexion:');
        console.log('  Admin    → admin@mall.mg          / LaCity2026*!');
        console.log('  Boutique → lalaina.rasoa@mail.mg  / Boutique1234');
        console.log('  Acheteur → mirana@mail.mg         / Acheteur1234');
        console.log('───────────────────────────────────────────');
        console.log(`  Emplacements actifs (carte): 7 sur ${emplacements.length}`);
        console.log(`  Emplacement expiré visible : G-R2 (libre à nouveau)`);
        console.log(`  Produits créés              : ${produits.length}`);
        console.log(`  Promotions créées           : ${promotions.length} (5 actives, 3 à venir, 1 expirée)`);
        console.log('───────────────────────────────────────────');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
