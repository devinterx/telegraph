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

export default class Auth {
    static listWebSession(user) {
        Database.find('sessions', {userId: user.id}, sessions => {
            console.log('sessions: ', sessions);
            if (sessions === null) {

            } else {

            }
        });
    }
}
