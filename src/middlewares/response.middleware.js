const responseMiddleware = (req, res, next) => {
    res.success = (data, message = 'OK', status = 200) => {
        return res.status(status).json({
            success: true,
            message,
            data
        });
    };

    res.fail = (message = 'Erreur', status = 500, errors = null) => {
        return res.status(status).json({
            success: false,
            message,
            errors
        });
    };

    next();
};

module.exports = responseMiddleware;
