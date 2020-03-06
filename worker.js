const fetch = require('node-fetch');
const parse = require('csv-parse');
const stringify = require('csv-stringify');
const util = require('util');

const parsePromise = util.promisify(parse);
const stringifyPromise = util.promisify(stringify);

const csvFileRegex = /.*\.csv$/;
const covid19BaseUrl = 'https://api.github.com/repos/CSSEGISandData/COVID-19/contents';
const covid19DailyReportsDirectoryUrl = `${covid19BaseUrl}/csse_covid_19_data/csse_covid_19_daily_reports`;
const covid19ConfirmedReportsTimeSeriesUrl = `${covid19BaseUrl}/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv`;

const coreTableHeaders = [
    'Province/State',
    'Country/Region',
    'Confirmed',
    'Deaths',
    'Recovered'
];
const coreTableHeadersWithLocation = [
    ...coreTableHeaders,
    'Lat',
    'Long'
];
const timeSeriesTableHeaders = [
    'Province/State',
    'Country/Region',
    'Lat',
    'Long'
];

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

function getColumns(data, columns) {
    const columnToIndexMap = new Map(
        data[0].map((columnName, i) => [columnName, i]));
    const columnIndices = columns
        .filter(column => columnToIndexMap.has(column))
        .map(column => columnToIndexMap.get(column));

    return data
        .slice(1)
        .map(dataRow => columnIndices
            .reduce((dataCols, col) => dataCols.concat(dataRow[col]), []));
}

function generateTotalsData(reportData) {
    let totalConfirmed = 0;
    let totalDeaths = 0;
    let totalRecovered = 0;

    reportData.forEach(reportDataRow => {
        totalConfirmed += parseInt(reportDataRow[2], 10);
        totalDeaths += parseInt(reportDataRow[3], 10);
        totalRecovered += parseInt(reportDataRow[4], 10);
    });

    return [
        ['Total Confirmed', 'Total Deaths', 'Total Recovered'],
        [totalConfirmed, totalDeaths, totalRecovered]
    ];
}

module.exports = function () {
    return fetch(covid19DailyReportsDirectoryUrl)
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
        .then(async parsedLatestReport => {
            const timeSeriesReport = await fetchAndParseReport(covid19ConfirmedReportsTimeSeriesUrl);
            const latestReportData = getColumns(parsedLatestReport, coreTableHeaders);
            const timeSeriesData = getColumns(timeSeriesReport, timeSeriesTableHeaders);

            // Build lookup map for location of province/country from time series data
            // Will add this data to latest report entries
            const provinceCountryToLocationMap = new Map();
            timeSeriesData.forEach(timeSeriesEntry => {
                const [province, country, lat, long] = timeSeriesEntry;
                provinceCountryToLocationMap.set(`${province}-${country}`, [lat, long]);
            });

            // Add location info (lat, long) to all latest report entries
            latestReportData.forEach(latestReportEntry => {
                const [province, country] = latestReportEntry;
                const location = provinceCountryToLocationMap.get(`${province}-${country}`);
                latestReportEntry.push.apply(latestReportEntry, location);
            });

            const totalsData = generateTotalsData(latestReportData);

            // Add new header row - Updated with Lat and Long
            latestReportData.unshift(coreTableHeadersWithLocation);

            return {
                parsed: latestReportData,
                raw: await stringifyPromise(latestReportData),
                parsedNoLocation: [
                    coreTableHeaders,
                    ...getColumns(latestReportData, coreTableHeaders)
                ],
                totals: totalsData,
                lastUpdateTimestamp: Date.now(),
            };
        });
}