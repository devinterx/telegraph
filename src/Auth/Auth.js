import Database from "../Database/Database";

export const session = (request, response, next) => {
    if (request.path.startsWith('/api')) {
        const token = request.cookies['token'];
        if (token === undefined) {
            return response.status(403).json({error: 'Not authorized'});
        } else {
            Database.count(`sessions/${token}`, count => {
                if (count === 0) {
                    response.clearCookie('token', {httpOnly: true});
                    response.status(403).json({error: 'Not authorized'});
                } else next();
            });
        }
    } else next();
};
