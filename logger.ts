import {createLogger, format, transports} from "winston";

let logPath = '';

if (process.env.NODE_ENV === 'production') {
    logPath = '/var/log/rates/';
}


const logger = createLogger({
    level: 'info',
    format: format.json(),
    defaultMeta: { dt: (new Date()).toISOString() },
    transports: [
        new transports.File({ filename: `${logPath}error.log`, level: 'error' }),
        new transports.File({ filename: `${logPath}combined.log` })
    ]
});

export {
    logger as defaultLogger
}
