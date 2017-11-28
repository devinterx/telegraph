import Auth from "../Auth/Auth";

export default class Command {
    static onCommand = (message, user) => {
        const commands = message.split(' ');
        switch (commands[0]) {
            case 'auth':
                Auth.listWebSession(user, info => {
                    user.sendMessage('Authorization');
                });
                break;
            default:
                user.sendMessage(`Unknown command: /${commands[0]}`);
        }
    };
}
