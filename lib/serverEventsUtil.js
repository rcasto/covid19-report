function createEvent(data) {
    // use a default 'message' event
    return createCustomEvent('message', data);
}

function createCustomEvent(event, data = '') {
    const dataString = typeof data === 'string' ?
        data : JSON.stringify(data || '');
    return `event: ${event}\ndata: ${dataString}\n\n`;
}

module.exports = {
    createEvent,
    createCustomEvent,
};