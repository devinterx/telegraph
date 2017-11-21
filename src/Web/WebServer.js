import path from "path";

export default class WebServer {
    static init(server, express) {
        server.use(express.static(path.resolve('./public')));
    }
}
