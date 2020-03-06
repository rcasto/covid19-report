const express = require('express');
const util = require('util');
const parse = require('csv-parse');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require("express-rate-limit");
const fetchLatestReportWorker = require('./worker');
const httpsRedirect = require('./lib/httpsRedirect');
const wwwToNonWwwRedirect = require('./lib/wwwToNonWwwRedirect');
const rootRedirect = require('./lib/rootRedirect');
const config = require('./config.json');

const parsePromise = util.promisify(parse);

const port = process.env.PORT || 3000;
const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150 // limit each IP to 150 requests per windowMs
});
const app = express();
let latestReport = {
    raw: null,
    parsed: null,
};

// avoid logs in production, make it a no-op
if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
}

async function updateReport(updatedReportString) {
    latestReport.raw = updatedReportString;
    latestReport.parsed = await parsePromise(updatedReportString);
}

function fetchLatestReport() {
    console.log('Fetching latest report');
    return fetchLatestReportWorker()
        .then(async (latestReportString) => {
            console.log('Fetched latest report');

            if (latestReportString === latestReport.raw) {
                console.log('Report the same, no update');
                return;
            }

            console.log('Report updated');
            await updateReport(latestReportString);
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
        latestReport: latestReport.parsed 
    });
});
app.get('/favicon.ico', (req, res) => {
    res.sendStatus(204);
});
app.get('/api/latest-report', async (req, res) => {
    res.json(latestReport.parsed);
});
app.get('/api/update-report', async (req, res) => {
    const cronId = req.query.cronId || '';
    if (!cronId ||
        cronId !== config.cronId) {
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

// Read the report file into memory
// before starting the server
async function initServer() {
    try {
        await fetchLatestReport();
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    } catch (err) {
        console.error('Server not started, an error occurred.');
        console.error(err);
    }
}

initServer();