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
        totalsTableHeaders,
        [totalConfirmed, totalDeaths, totalRecovered]
    ];
}

module.exports = function () {
    return arcgisClient.fetchLatestReport()
        .then(async parsedLatestReport => {
            const latestReportData = getColumns(parsedLatestReport, coreTableHeadersWithLocation);
            const rawReportData = JSON.stringify(latestReportData);
            const totalsData = generateTotalsData(latestReportData);

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