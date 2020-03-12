const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require("express-rate-limit");
const fetchLatestReportWorker = require('./worker');
const httpsRedirect = require('./lib/httpsRedirect');
const wwwToNonWwwRedirect = require('./lib/wwwToNonWwwRedirect');
const rootRedirect = require('./lib/rootRedirect');
const serverEventsUtil = require('./lib/serverEventsUtil');
const storage = require('./lib/storage');
const config = require('./config.json');

const port = process.env.PORT || 3000;
const apiRateLimiter = rateLimit({
    windowMs: config.rateLimiter.windowMs,
    max: config.rateLimiter.windowMax
});
const app = express();
let latestReport = {
    raw: null,
    parsedNoLocation: null,
    parsed: null,
    totals: null,
    lastUpdateTimestamp: null,
};

// avoid logs in production, make it a no-op
if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
}

function fetchLatestReport() {
    console.log('Fetching latest report');
    return fetchLatestReportWorker(latestReport)
        .then(async (latestReportData) => {
            console.log('Fetched latest report');
            
            if (latestReportData.raw === latestReport.raw) {
                console.log('Report the same, no update');
                return;
            }

            console.log('Report updated');
            
            latestReport = latestReportData;
            await storage.setReport(latestReport);
        });
}

const pollingIntervalInMs = 5000;
function pollLatestReport(req, res) {
    let pollReportTimeoutId = null;

    // listen for the client closing the connection
    // and cleanup the report poll in that case
    req.on('close', () => {
        console.log('client aborted the request');
        clearTimeout(pollReportTimeoutId);
    });

    pollReportTimeoutId = setTimeout(function _pollLatestReport() {
        res.write(serverEventsUtil.createEvent(latestReport));

        pollReportTimeoutId = setTimeout(_pollLatestReport, pollingIntervalInMs);
    }, pollingIntervalInMs);
}

app.set('view engine', 'ejs');
app.enable('trust proxy');

app.use(compression());
app.use(helmet());
app.use(httpsRedirect);
app.use(wwwToNonWwwRedirect);
app.use(rootRedirect);
app.use(express.static('public'));
// only apply to rate limiter to requests that begin with /api/
app.use('/api/', apiRateLimiter);
app.get('/', (req, res) => {
    res.render('index', { 
        latestReport: latestReport.parsedNoLocation,
        latestReportWithLocation: latestReport.parsed,
        totalsReport: latestReport.totals,
        lastUpdateTimestamp: latestReport.lastUpdateTimestamp,
    });
});
app.get('/favicon.ico', (req, res) => {
    res.sendStatus(204);
});
app.get('/api/latest-report', async (req, res) => {
    res.json(latestReport.parsed);
});
app.get('/api/latest-report-events', (req, res) => {
    pollLatestReport(req, res);

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-transform',
        'Connection': 'keep-alive',
    });
    res.write('\n');
});
app.get('/api/update-report', async (req, res) => {
    const cronId = req.query.cronId || '';
    if (cronId !== config.cronId) {
        res.sendStatus(400);
        return;
    }

    try {
        await fetchLatestReport();
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});
app.get('*', (req, res) => {
    res.redirect('/');
});

// Read the report file into memory
// before starting the server
async function initServer() {
    try {
        latestReport = await storage.getReport();
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    } catch (err) {
        console.error('Server not started, an error occurred.');
        console.error(err);
    }
}

initServer();