const express = require('express');
const fs = require('fs');
const util = require('util');
const parse = require('csv-parse');
const cron = require('node-cron');
const updateReport = require('./script');

const parsePromise = util.promisify(parse);
const fileReadPromise = util.promisify(fs.readFile);

const covid19ReportOutputPath = 'covid19-report.csv';
const port = process.env.PORT || 3000;
const app = express();

let latestReport = null;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

app.get('/api/latest-report', async (req, res) => {
    try {
        if (!latestReport) {
            await readReport();
        }
        res.json(latestReport);
    } catch (err) {
        res.status(500);
        res.send(JSON.stringify(err));
    }
});

app.listen(port,
    () => console.log(`Server started on port ${port}`));

// Worker script section
async function readReport() {
    const fileContents = await fileReadPromise(covid19ReportOutputPath, {
        encoding: 'utf8',
    });
    latestReport = await parsePromise(fileContents);
}

function initUpdateWorker() {
    // Runs once an hour
    cron.schedule('0 * * * *', () => {
        updateReport()
            .then(async () => {
                await readReport();
            });
    });
}

initUpdateWorker();