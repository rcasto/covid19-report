const fetch = require('node-fetch');
const parse = require('csv-parse');
const util = require('util');

const parsePromise = util.promisify(parse);

const csvFileRegex = /.*\.csv$/;
const covid19BaseUrl = 'https://api.github.com/repos/CSSEGISandData/COVID-19/contents';
const covid19DailyReportsDirectoryUrl = `${covid19BaseUrl}/csse_covid_19_data/csse_covid_19_daily_reports`;
const covid19ConfirmedReportsTimeSeriesUrl = `${covid19BaseUrl}/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv`;

/*
    The format of the daily reports is as follows:
    MM-DD-YYYY.csv, ex) 01-22-2020.csv

    This function will take in this report name
    and convert it to the date it represents.
*/
function getReportDate(reportName) {
    // This removes the '.csv'
    reportName = reportName.slice(0, -4);

    const reportTokens = reportName.split('-')
        .map(reportToken => parseInt(reportToken, 10));
    let [month, day, year] = reportTokens;

    // correct month, 0 = January
    month--;
    
    // correct year, only last 2 digits
    // year %= 100;

    return new Date(year, month, day);
}

function fetchAndParseReport(reportUrl) {
    return fetch(reportUrl)
        .then(response => response.json())
        .then(latestReportRecord => {
            const latestReportContentBuffer = Buffer.from(latestReportRecord.content, latestReportRecord.encoding);
            return latestReportContentBuffer.toString('utf8');
        })
        .then(parsePromise);
}

fetch(covid19DailyReportsDirectoryUrl)
    .then(response => response.json())
    .then(dailyReports =>
        dailyReports.filter(dailyReport =>
            dailyReport.type === 'file' &&
            csvFileRegex.test(dailyReport.name)))
    .then(dailyReports =>
        dailyReports.map(dailyReport => dailyReport.name))
    .then(dailyReports => dailyReports.sort((report1, report2) => {
        const report1Date = getReportDate(report1);
        const report2Date = getReportDate(report2);
        return report2Date - report1Date;
    }))
    .then(dailyReports => {
        if (dailyReports.length > 0) {
            return dailyReports[0];
        }
        throw new Error('No daily reports found...hmmm');
    })
    .then(latestReport => `${covid19DailyReportsDirectoryUrl}/${latestReport}`)
    .then(fetchAndParseReport)
    .then(parsedLatestReport => {
        console.log(parsedLatestReport);
    })
    .catch(console.error);