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
const totalsTableHeaders = [
    'Total Confirmed',
    'Total Deaths',
    'Total Recovered'
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

    return new Date(year, month, day);
}

function constructRowKey(province, region) {
    return `${province}-${region}`;
}

function constructDataWithDeltaData(data, deltaData) {
    if (deltaData > 0) {
        return `${data} (+${deltaData})`;
    }
    return `${data}`;
}

function extractAndParseFloat(data) {
    return parseFloat((data || '').split(' ')[0], 10);
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

function generateTotalsData(lastTotalsData, reportData) {
    let totalConfirmed = 0;
    let totalDeaths = 0;
    let totalRecovered = 0;

    reportData.forEach(reportDataRow => {
        totalConfirmed += parseInt(reportDataRow[2], 10);
        totalDeaths += parseInt(reportDataRow[3], 10);
        totalRecovered += parseInt(reportDataRow[4], 10);
    });

    if (lastTotalsData.length > 0) {
        const [lastTotalConfirmed, lastTotalDeaths, lastTotalRecovered] = lastTotalsData;
        totalConfirmed = constructDataWithDeltaData(totalConfirmed, totalConfirmed - lastTotalConfirmed);
        totalDeaths = constructDataWithDeltaData(totalDeaths, totalDeaths - lastTotalDeaths);
        totalRecovered = constructDataWithDeltaData(totalRecovered, totalRecovered - lastTotalRecovered);
    }

    return [
        totalsTableHeaders,
        [totalConfirmed, totalDeaths, totalRecovered]
    ];
}

// Computes deltas between the last report and latest report for
// confirmed counts, death counts, and recovered counts
function generateDeltasData(lastReportData, latestReportData) {
    const provinceRegionToLastCountsMap = new Map();

    lastReportData
        .forEach(lastReportRow => {
            let [province, region, confirmedCount, deathCount, recoveredCount] = lastReportRow;
            confirmedCount = extractAndParseFloat(confirmedCount);
            deathCount = extractAndParseFloat(deathCount);
            recoveredCount = extractAndParseFloat(recoveredCount);
            provinceRegionToLastCountsMap.set(constructRowKey(province, region), [confirmedCount, deathCount, recoveredCount]);
        });

    return latestReportData
        .map(latestReportRow => {
            const [province, region, confirmedCount, deathCount, recoveredCount] = latestReportRow;
            const latestReportRowKey = constructRowKey(province, region);
            if (provinceRegionToLastCountsMap.has(latestReportRowKey)) {
                const [lastConfirmedCount, lastDeathCount, lastRecoveredCount] = provinceRegionToLastCountsMap.get(latestReportRowKey);
                return [
                    confirmedCount - lastConfirmedCount,
                    deathCount - lastDeathCount,
                    recoveredCount - lastRecoveredCount
                ];
            }
            // No corresponding entry in last report
            // deltas are treated as 0 in this case
            return [0, 0, 0];
        });
}

module.exports = function (lastReport) {
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
            const lastReportTotalsData = (lastReport && lastReport.totals) ?
                getColumns(lastReport.totals, totalsTableHeaders)[0] : [];
            const lastReportData = (lastReport && lastReport.parsed) ?
                getColumns(lastReport.parsed, coreTableHeaders) : [];
            const latestReportData = getColumns(parsedLatestReport, coreTableHeaders);
            const timeSeriesData = getColumns(timeSeriesReport, timeSeriesTableHeaders);

            // Build lookup map for location of province/country from time series data
            // Will add this data to latest report entries
            const provinceRegionToLocationMap = new Map();
            timeSeriesData.forEach(timeSeriesEntry => {
                const [province, region, lat, long] = timeSeriesEntry;
                provinceRegionToLocationMap.set(constructRowKey(province, region), [lat, long]);
            });

            // Add location info (lat, long) to all latest report entries
            latestReportData.forEach(latestReportEntry => {
                const [province, region] = latestReportEntry;
                const location = provinceRegionToLocationMap.get(constructRowKey(province, region));
                latestReportEntry.push.apply(latestReportEntry, location);
            });

            const rawReportData = await stringifyPromise(latestReportData);
            const totalsData = generateTotalsData(lastReportTotalsData, latestReportData);
            const deltasData = generateDeltasData(lastReportData, latestReportData);

            // Add deltas info to latest report
            latestReportData
                .forEach((latestReportRow, latestReportRowIndex) => {
                    const [deltaConfirmed, deltaDeaths, deltaRecovered] = deltasData[latestReportRowIndex];
                    latestReportRow[2] = constructDataWithDeltaData(latestReportRow[2], deltaConfirmed);
                    latestReportRow[3] = constructDataWithDeltaData(latestReportRow[3], deltaDeaths);
                    latestReportRow[4] = constructDataWithDeltaData(latestReportRow[4], deltaRecovered);
                });

            // Add new header row - Updated with Lat and Long
            latestReportData.unshift(coreTableHeadersWithLocation);

            return {
                parsed: latestReportData,
                raw: rawReportData,
                parsedNoLocation: [
                    coreTableHeaders,
                    ...getColumns(latestReportData, coreTableHeaders)
                ],
                totals: totalsData,
                lastUpdateTimestamp: Date.now(),
            };
        });
}