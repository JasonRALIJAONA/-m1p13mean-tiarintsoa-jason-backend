const { validationResult } = require('express-validator');
const Visite = require('../models/Visite');
const Emplacement = require('../models/Emplacement');

exports.getAdminStats = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.fail('Validation échouée', 400, errors.array());

        const requestedDays = Number.parseInt(req.query.days || '7', 10);
        const periodDays = Number.isNaN(requestedDays) ? 7 : requestedDays;

        const periodStart = new Date();
        periodStart.setHours(0, 0, 0, 0);
        periodStart.setDate(periodStart.getDate() - (periodDays - 1));

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [
            totalSiteVisits,
            todaySiteVisits,
            visitsByDayRaw,
            totalSlots,
            occupiedSlots
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
                                date: '$createdAt'
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Emplacement.countDocuments(),
            Emplacement.countDocuments({ statut: 'occupe' })
        ]);

        const visitsMap = new Map(visitsByDayRaw.map((item) => [item._id, item.count]));
        const visitorsSeries = [];

        for (let index = periodDays - 1; index >= 0; index -= 1) {
            const day = new Date();
            day.setHours(0, 0, 0, 0);
            day.setDate(day.getDate() - index);

            const dateKey = day.toISOString().slice(0, 10);
            visitorsSeries.push({
                date: dateKey,
                count: visitsMap.get(dateKey) || 0
            });
        }

        const freeSlots = Math.max(0, totalSlots - occupiedSlots);
        const occupancyRate = totalSlots > 0
            ? Math.round((occupiedSlots / totalSlots) * 100)
            : 0;

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
                }
            },
            'Statistiques du dashboard admin'
        );
    } catch (error) {
        next(error);
    }
};
