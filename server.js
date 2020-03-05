const express = require('express');
const fs = require('fs');
const util = require('util');
const parse = require('csv-parse');
const cron = require('node-cron');
const helmet = require('helmet');
const compression = require('compression');
const fetchLatestReport = require('./script');
const httpsRedirect = require('./lib/httpsRedirect');
const wwwToNonWwwRedirect = require('./lib/wwwToNonWwwRedirect');
const rootRedirect = require('./lib/rootRedirect');

const parsePromise = util.promisify(parse);
const fileReadPromise = util.promisify(fs.readFile);
const fileWritePromise = util.promisify(fs.writeFile);

const updateWorkerCronTab = '*/5 * * * *'; // every 5 minutes
const covid19ReportOutputPath = 'covid19-report.csv';
const port = process.env.PORT || 3000;
const app = express();
let latestReport = {
    raw: null,
    parsed: null,
};

// avoid logs in production, make it a no-op
if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
}

async function readReport() {
    console.log('Reading report file from file system');

    const fileContents = await fileReadPromise(covid19ReportOutputPath, {
        encoding: 'utf8',
    });
    await updateReport(fileContents);
}

async function updateReport(updatedReportString) {
    latestReport.raw = updatedReportString;
    latestReport.parsed = await parsePromise(updatedReportString);
}

function fetchAndWriteLatestReport() {
    return fetchLatestReport()
        .then(async (latestReportString) => {
            console.log('Fetched latest report');

            if (latestReportString === latestReport.raw) {
                console.log('No report update');
                return;
            }

            console.log('Report updated, saved to disk');

            await fileWritePromise(covid19ReportOutputPath, latestReportString, {
                encoding: 'utf8',
            });
            await updateReport(latestReportString);
        });
}

function initUpdateWorker() {
    console.log('Initializing update worker');

    // Runs once an hour
    cron.schedule(updateWorkerCronTab, () => {
        console.log('Fetching latest report');

        fetchAndWriteLatestReport();
    });
}

app.use(compression());
app.use(helmet());
app.use(httpsRedirect);
app.use(wwwToNonWwwRedirect);
app.use(rootRedirect);
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile('index.html');
});
app.get('/favicon.ico', (req, res) => {
    res.sendStatus(204);
});
app.get('/api/latest-report', async (req, res) => {
    res.json(latestReport.parsed);
});
app.get('/api/update-report', async (req, res) => {
    try {
        await fetchAndWriteLatestReport();
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Read the report file into memory
// before starting the server
async function initServer() {
    try {
        await readReport();
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
            // initUpdateWorker();
        });
    } catch (err) {
        console.error('Server not started, an error occurred.');
        console.error(err);
    }
}

initServer();