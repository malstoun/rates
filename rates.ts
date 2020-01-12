import * as http from "http";
import { parseString } from 'xml2js';
import { defaultLogger } from "./logger";

interface rate {
    code: string;
    val: number;
    date: string;
    nominal: number;
}

interface rates {
    result: rate[];
}

function convertToResponse(obj): rates {
    const rates = {
        result: []
    };
    const valute = obj?.ValCurs?.Valute ?? [];

    for (const val of valute) {
        rates.result.push({
            code: val.CharCode[0],
            val: parseFloat(val.Value[0].replace(',', '.')),
            date: obj?.ValCurs?.$?.Date,
            nominal: parseInt(val.Nominal[0], 10)
        })
    }

    return rates;
}

export default function(req: http.IncomingMessage, resp: http.ServerResponse) {
    defaultLogger.log({
        level: 'info',
        message: `incoming request`,
        url: '/rates',
        ip: req.connection.remoteAddress // no proxy, no x-forward
    });

    http.get('http://www.cbr.ru/scripts/XML_daily.asp', (cbrResp) => {
        if (cbrResp.statusCode !== 200) {
            defaultLogger.log({
                level: 'error',
                message: `err while getting rates, code: ${cbrResp.statusCode}`,
            });
            resp.writeHead(500).end();
            return
        }

        let xmlRate = '';
        cbrResp.setEncoding('utf8');
        cbrResp.on('data', (chunk) => xmlRate += chunk);
        cbrResp.on('end', () => {
            parseString(xmlRate, (err, res) => {
                if (err) {
                    defaultLogger.log({
                        level: 'error',
                        message: `err while parsing xml response: ${err}`,
                    });
                    resp.writeHead(500).end();
                    return
                }

                resp.setHeader('Content-Type', 'application/json');
                resp.write(JSON.stringify(convertToResponse(res)), 'utf8');
                resp.end();
            });
        })
    })
}
