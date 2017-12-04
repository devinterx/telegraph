import Auth from "../Auth/Auth";

export default class Command {
    static onCommand = (message, user) => {
        const commands = message.split(' ');
        switch (commands[0]) {
            case 'auth':
                Auth.onCommand(user, commands.slice(1), info => {

                });
                break;
            default:
                user.sendMessage(`Unknown command: /${commands[0]}`);
        }
    };

    static onCommandCallback = (data, user, context) => {
        let query = data.split(' ');
        switch (query[0]) {
            case 'auth':
                Auth.onCommandCallback(user, query.slice(1), info => {

                }, context);
                break;
            default:
                user.sendMessage(`Unknown command query: /${query[0]}`);
        }
    }
}
