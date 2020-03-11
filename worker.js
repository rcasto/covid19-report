const arcgisClient = require('./lib/arcgisClient');

const coreTableHeaders = [
    'Province/State',
    'Country/Region',
    'Confirmed',
    'Deaths',
    'Recovered'
];
const coreTableHeadersWithLocation = [
    ...coreTableHeaders,
    'Latitude',
    'Longitude'
];
const totalsTableHeaders = [
    'Total Confirmed',
    'Total Deaths',
    'Total Recovered'
];

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
        let [lastTotalConfirmed, lastTotalDeaths, lastTotalRecovered] = lastTotalsData;
        lastTotalConfirmed = parseInt(lastTotalConfirmed, 10);
        lastTotalDeaths = parseInt(lastTotalDeaths, 10);
        lastTotalRecovered = parseInt(lastTotalRecovered, 10);

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
    return arcgisClient.fetchLatestReport()
        .then(async parsedLatestReport => {
            const lastReportTotalsData = (lastReport && lastReport.totals) ?
                getColumns(lastReport.totals, totalsTableHeaders)[0] : [];
            const lastReportData = (lastReport && lastReport.parsed) ?
                getColumns(lastReport.parsed, coreTableHeaders) : [];
            const latestReportData = getColumns(parsedLatestReport, coreTableHeadersWithLocation);
            const rawReportData = JSON.stringify(latestReportData);
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

            return {
                parsed: [
                    coreTableHeadersWithLocation,
                    ...latestReportData
                ],
                raw: rawReportData,
                parsedNoLocation: [
                    coreTableHeaders,
                    ...getColumns([
                        coreTableHeaders,
                        ...latestReportData
                    ], coreTableHeaders)
                ],
                totals: totalsData,
                lastUpdateTimestamp: Date.now(),
            };
        });
}