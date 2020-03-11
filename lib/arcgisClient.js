/*
    This file attempts to integrate with a feature layer provided by CSSE_GISandData:
    https://www.arcgis.com/home/item.html?id=c0b356e20b30490c8b8b4c7bb9554e7c

    The specific layer being used is:
    https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1

    The goal of this addition is to incorporate more real time data updates, instead of waiting
    for the daily reports.
*/

const fetch = require('node-fetch');

const arcgisFeatureLayerUrlBase = `https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query`;
const arcgisFeatureLayerQueryParameters = toQueryParameterString({
    f: 'json',
    where: 'Confirmed%20%3E%200',
    returnGeometry: false,
    spatialRl: 'esriSpatialRelIntersects',
    outFields: '*',
    orderByFields: 'Confirmed%20desc%2CCountry_Region%20asc%2CProvince_State%20asc',
    outSR: 102100,
    resultOffset: 0,
    resultRecordCount: 500,
    cacheHint: true,
});
const arcgisFeatureLayerUrl = `${arcgisFeatureLayerUrlBase}?${arcgisFeatureLayerQueryParameters}`;

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

function toQueryParameterString(queryParameterObject) {
    let queryString = '';
    for (let [key, value] of Object.entries(queryParameterObject)) {
        if (queryString) {
            queryString = `${queryString}&${key}=${value}`;
        } else {
            queryString = `${key}=${value}`;
        }
    }
    return queryString;
}

function transformToCsvRepresentation(featureObject) {
    const {
        Province_State: province,
        Country_Region: region,
        Lat: lat,
        Long_: long,
        Confirmed: confirmedCount,
        Deaths: deathsCount,
        Recovered: recoverdCount,
    } = featureObject;
    
    return [
        province || '',
        region,
        confirmedCount,
        deathsCount,
        recoverdCount,
        lat,
        long,
    ];
}

function fetchLatestReport() {
    return fetch(arcgisFeatureLayerUrl)
        .then(response => response.json())
        .then(featureQueryResults => 
            Array.isArray(featureQueryResults && featureQueryResults.features) ?
                featureQueryResults.features : [])
        .then(features => 
            features.map(feature => feature.attributes))
        .then(featureObjects =>
            featureObjects.map(transformToCsvRepresentation))
        .then(featureArrays => ([
            coreTableHeadersWithLocation,
            ...featureArrays
        ]));
}

module.exports = {
    fetchLatestReport,
};