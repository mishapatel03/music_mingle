import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, 'bf80b6c614347fca6b4d7b16b547d0b5fb08e43a8496d45bf45ec545d77c81c4', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}
