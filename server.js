const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require("express-rate-limit");
const fetchLatestReportWorker = require('./worker');
const httpsRedirect = require('./lib/httpsRedirect');
const wwwToNonWwwRedirect = require('./lib/wwwToNonWwwRedirect');
const rootRedirect = require('./lib/rootRedirect');
const storage = require('./lib/storage');
const config = require('./config.json');

const isProduction = process.env.NODE_ENV === 'production';
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
if (isProduction) {
    console.log = () => {};
}

function fetchLatestReport() {
    console.log('Fetching latest report');
    return fetchLatestReportWorker()
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
    res.json({
        report: latestReport.parsed,
        totals: latestReport.totals,
        lastUpdateTimestamp: latestReport.lastUpdateTimestamp
    });
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
        console.error(err);
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