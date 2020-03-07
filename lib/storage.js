const Duplex = require('stream').Duplex;
const { Storage } = require('@google-cloud/storage');
const config = require('../config.json');

const storage = new Storage({
    keyFilename: config.storage.keyFile,
    projectId: config.storage.projectId
});
const bucket = storage.bucket(config.storage.bucket);
const reportFile = bucket.file(config.storage.reportFile);

// http://derpturkey.com/buffer-to-stream-in-node/
function bufferToStream(buffer) {
    const stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

function getReport() {
    return new Promise((resolve, reject) => {
        let reportDataBuffer = null;
        reportFile.createReadStream()
            .on('error', reject)
            .on('data', data => {
                const tmpDataBuffer = Buffer.from(data);
                if (reportDataBuffer) {
                    reportDataBuffer = Buffer.concat([reportDataBuffer, tmpDataBuffer]);
                } else {
                    reportDataBuffer = tmpDataBuffer;
                }
            })
            .on('end', () => {
                const reportDataString = reportDataBuffer.toString('utf8');
                resolve(JSON.parse(reportDataString));
            });
    });
}

function setReport(report) {
    return new Promise((resolve, reject) => {
        const reportBuffer = Buffer.from(JSON.stringify(report));
        bufferToStream(reportBuffer)
            .pipe(reportFile.createWriteStream())
            .on('error', reject)
            .on('finish', resolve);
    });
}

module.exports = {
    getReport,
    setReport
};