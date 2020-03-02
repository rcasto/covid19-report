const express = require('express');
const fs = require('fs');
const util = require('util');
const parse = require('csv-parse');

const parsePromise = util.promisify(parse);
const fileReadPromise = util.promisify(fs.readFile);

const covid19ReportOutputPath = 'covid19-report.csv';
const port = process.env.PORT || 3000;
const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

app.get('/api/latest-report', async (req, res) => {
    try {
        const fileContents = await fileReadPromise(covid19ReportOutputPath, {
            encoding: 'utf8',
        });
        const fileContentsParsed = await parsePromise(fileContents);
        res.json(fileContentsParsed);
    } catch (err) {
        res.status(500);
        res.send(JSON.stringify(err));
    }
});

app.listen(port,
    () => console.log(`Server started on port ${port}`));