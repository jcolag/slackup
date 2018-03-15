const configFile = '.slackuprc.json';
const slack = require('slack');
const fs = require('fs');
const path = require('path');
let token = null;
let folder = 'data';
let waitingForChannels = false;
let waitingForGroups = false;
let waitingForIms = false;
let waitingForUsers = false;
let waitingForUserMap = false;
let channels = [];
let groups = [];
let ims = [];
let users = [];
const userMap = {};

if (fs.existsSync(configFile)) {
    const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    if (config) {
        if (config.hasOwnProperty('token')) {
            ({ token } = config);
        }
        if (config.hasOwnProperty('folder')) {
            ({ folder } = config);
        }
    }
}

if (!token) {
    throw new Error('No token available');
}

if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
}

const slacker = new slack({ token });

waitingForChannels = true;
slacker.channels.list().then(setChannels);
setTimeout(processChannels, 0);

waitingForGroups = true;
slacker.groups.list().then(setGroups);
setTimeout(processGroups, 0);

waitingForUsers = true;
waitingForUserMap = true;
slacker.users.list().then(setUsers);
setTimeout(processUsers, 0);

setTimeout(getIms, 0);

/**
 * Store channel data when ready.
 *
 * @param {any} data
 * @returns
 */
function setChannels(data) {
    if (!data.ok) {
        waitingForChannels = false;
        return;
    }

    channels = data.channels;
    waitingForChannels = false;
}

/**
 * When channels are available, iterate through to get histories.
 *
 * @returns
 */
function processChannels() {
    if (waitingForChannels) {
        setTimeout(processChannels, 50);
        return;
    }

    channels.filter((c) => c.is_member).forEach((channel) => {
        const channelFile = path.join(folder, `channel-${channel.name}.json`);
        const res = retrieveExistingMessages(channelFile);
        slacker.channels.history({
            'channel': channel.id,
            'count': 1000,
            'oldest': res[1],
        }).then(writeHistory.bind(channel, res[0], channelFile));
    });
}

/**
 * Start instant message process.
 *
 * @returns
 */
function getIms() {
    if (waitingForUserMap) {
        setTimeout(getIms, 50);
        return;
    }

    waitingForIms = true;
    slacker.im.list().then(setIms);
    setTimeout(processIms, 0);
}

/**
 * Store instant message data when ready.
 *
 * @param {any} data
 * @returns
 */
function setIms(data) {
    if (!data.ok) {
        waitingForIms = false;
        return;
    }

    ims = data.ims;
    waitingForIms = false;
}

/**
 * When instant messages are available, iterate through to get histories.
 *
 * @returns
 */
function processIms() {
    if (waitingForIms) {
        setTimeout(processIms, 50);
        return;
    }

    ims.forEach((im) => {
        const user = userMap[im.user];
        const name = user.real_name ? user.real_name : user.name;
        const imFile = path.join(folder, `im-${name}.json`).replace(' ', '-');
        const res = retrieveExistingMessages(imFile);
        slacker.im.history({
            'channel': im.id,
            'count': 1000,
            'oldest': res[1],
        }).then(writeHistory.bind(im, res[0], imFile));
    });
}

/**
 * Store group data when ready.
 *
 * @param {any} data
 * @returns
 */
function setGroups(data) {
    if (!data.ok) {
        waitingForGroups = false;
        return;
    }

    groups = data.groups;
    waitingForGroups = false;
}

/**
 * When groups are available, iterate through to get histories.
 *
 * @returns
 */
function processGroups() {
    if (waitingForGroups) {
        setTimeout(processGroups, 50);
        return;
    }

    groups.forEach((group) => {
        const groupFile = path.join(folder, `group-${group.name}.json`);
        const res = retrieveExistingMessages(groupFile);
        slacker.groups.history({
            'channel': group.id,
            'count': 1000,
            'oldest': res[1],
        }).then(writeHistory.bind(group, res[0], groupFile));
    });
}

/**
 * Store user data when ready.
 *
 * @param {any} data
 * @returns
 */
function setUsers(data) {
    if (!data.ok) {
        waitingForUsers = false;
        return;
    }

    users = data.members;
    waitingForUsers = false;
}

/**
 * When users are available, iterate through to get and save details.
 *
 * @returns
 */
function processUsers() {
    if (waitingForUsers) {
        setTimeout(processUsers, 50);
        return;
    }

    users.forEach((user) => {
        const json = JSON.stringify(user, null, 2);
        let name = user.real_name ? user.real_name : user.name;
        name = name.replace(' ', '-');
        userMap[user.id] = user;
        fs.writeFileSync(path.join(folder, `user-${name}.json`), json);
    });
    waitingForUserMap = false;
}

/**
 * Extract existing messages and find most recent timestamp.
 *
 * @param {any} path
 * @returns
 */
function retrieveExistingMessages(path) {
    let messages = [];
    let lastTime = 0;
    if (fs.existsSync(path)) {
        messages = JSON.parse(fs.readFileSync(path), 'utf-8');
        if (messages.length > 0) {
            const msg = messages.reduce((max, p) => p.ts > max ? p.ts : max);
            lastTime = msg.ts;
        }
    }

    return [
        messages,
        lastTime,
    ];
}

/**
 * Add recent messages to those already saved.
 *
 * @param {any} original
 * @param {any} filename
 * @param {any} data
 */
function writeHistory(original, filename, data) {
    if (data.ok) {
        const messages = data.messages.concat(original).sort((a, b) => b.ts - a.ts);
        const json = JSON.stringify(messages, null, 2);
        fs.writeFileSync(filename, json);
    }
}