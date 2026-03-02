const { validationResult } = require('express-validator');
const Visite = require('../models/Visite');
const Emplacement = require('../models/Emplacement');
const LocationEmplacement = require('../models/LocationEmplacement');
const Boutique = require('../models/Boutique');

const DASHBOARD_TIMEZONE = process.env.DASHBOARD_TIMEZONE
    || Intl.DateTimeFormat().resolvedOptions().timeZone
    || 'UTC';

function formatDateKey(date) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: DASHBOARD_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(date);

    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;
    const day = parts.find((part) => part.type === 'day')?.value;

    return `${year}-${month}-${day}`;
}

exports.getAdminStats = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.fail('Validation échouée', 400, errors.array());

        const requestedDays = Number.parseInt(req.query.days || '7', 10);
        const periodDays = Number.isNaN(requestedDays) ? 7 : requestedDays;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const periodStart = new Date(todayStart);
        periodStart.setDate(todayStart.getDate() - (periodDays - 1));

        const now = new Date();

        const [
            totalSiteVisits,
            todaySiteVisits,
            visitsByDayRaw,
            topBoutiquesRaw,
            totalSlots,
            occupiedSlotsAgg
        ] = await Promise.all([
            Visite.countDocuments({ type: 'site' }),
            Visite.countDocuments({ type: 'site', createdAt: { $gte: todayStart } }),
            Visite.aggregate([
                {
                    $match: {
                        type: 'site',
                        createdAt: { $gte: periodStart }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$createdAt',
                                timezone: DASHBOARD_TIMEZONE
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Visite.aggregate([
                {
                    $match: {
                        type: 'boutique',
                        createdAt: { $gte: periodStart },
                        boutiqueId: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: '$boutiqueId',
                        visits: { $sum: 1 }
                    }
                },
                { $sort: { visits: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: Boutique.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'boutique'
                    }
                },
                { $unwind: '$boutique' },
                {
                    $project: {
                        _id: 0,
                        name: '$boutique.nom',
                        visits: 1
                    }
                }
            ]),
            Emplacement.countDocuments(),
            // Count distinct slots that have an active location right now
            LocationEmplacement.aggregate([
                {
                    $match: {
                        dateDebut: { $lte: now },
                        $or: [
                            { dateFin: null },
                            { dateFin: { $gte: now } }
                        ]
                    }
                },
                { $group: { _id: '$emplacementId' } },
                { $count: 'total' }
            ])
        ]);

        const occupiedSlots = occupiedSlotsAgg.length > 0 ? occupiedSlotsAgg[0].total : 0;

        const visitsMap = new Map(visitsByDayRaw.map((item) => [item._id, item.count]));
        const visitorsSeries = [];

        for (let cursor = new Date(periodStart); cursor <= todayStart; cursor.setDate(cursor.getDate() + 1)) {
            const dateKey = formatDateKey(cursor);
            visitorsSeries.push({
                date: dateKey,
                count: visitsMap.get(dateKey) || 0
            });
        }

        const freeSlots = Math.max(0, totalSlots - occupiedSlots);
        const occupancyRate = totalSlots > 0
            ? Math.round((occupiedSlots / totalSlots) * 100)
            : 0;

        const topBoutiques = topBoutiquesRaw.map((item) => ({
            name: item.name,
            visits: item.visits
        }));

        return res.success(
            {
                visitors: {
                    total: totalSiteVisits,
                    today: todaySiteVisits,
                    periodDays,
                    series: visitorsSeries
                },
                slots: {
                    total: totalSlots,
                    occupied: occupiedSlots,
                    free: freeSlots,
                    occupancyRate
                },
                topBoutiques
            },
            'Statistiques du dashboard admin'
        );
    } catch (error) {
        next(error);
    }
};
