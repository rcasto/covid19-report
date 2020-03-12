function createEvent(data) {
    // use a default 'message' event
    return createCustomEvent('message', data);
}

function createCustomEvent(event, data = '') {
    const dataString = typeof data === 'string' ?
        data : JSON.stringify(data);
    const eventString = `event: ${event}\ndata: ${dataString}\n\n`;
    console.log(eventString);
    return eventString;
}

module.exports = {
    createEvent,
    createCustomEvent,
};