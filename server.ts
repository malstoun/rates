import * as http from 'http';

import handleRates from './rates';
import { defaultLogger } from "./logger";

const appPort = process.env.APP_PORT ?? '80';

const server = http.createServer((req, resp) => {
    switch (req.url) {
        case '/rates':
            handleRates(req, resp);
            break;
        default:
            resp.writeHead(200).end();
    }
});

server.listen(appPort, () => {
    defaultLogger.log({
        level: 'info',
        message: `app listens port ${appPort}`
    })
});
