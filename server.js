const express = require('express');
const fs = require('fs');
const util = require('util');
const parse = require('csv-parse');
const cron = require('node-cron');
const helmet = require('helmet');
const compression = require('compression');
const fetchLatestReport = require('./script');

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

function initUpdateWorker() {
    console.log('Initializing update worker');

    // Runs once an hour
    cron.schedule(updateWorkerCronTab, async () => {
        if (latestReport.raw) {
            console.log('Fetching latest report');
            fetchLatestReport()
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
                })
                .catch(err => console.error(err));
        } else {
            await readReport();
        }
    });
}

app.use(compression());
app.use(helmet());
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile('index.html');
});
app.get('/api/latest-report', async (req, res) => {
    try {
        if (!latestReport.raw) {
            await readReport();
        }
        res.json(latestReport.parsed);
    } catch (err) {
        res.status(500);
        res.send(JSON.stringify(err));
    }
});
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    initUpdateWorker();
});