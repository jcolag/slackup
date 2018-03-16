import { ConfigStore } from './configstore';
import Reflux from 'reflux';
import slack from 'slack';
const fs = require('fs');
const path = require('path');
const timeout = 50;
const indentation = 4;

export const SlackActions = Reflux.createActions({
    'getAll': {},
    'getLists': {},
});
export class SlackStore extends Reflux.Store {
    constructor() {
        super();
        this.state = {
            'channels': [],
            'groups': [],
            'ims': [],
            'userMap': {},
            'users': [],
            'waitingForChannels': false,
            'waitingForGroups': false,
            'waitingForIms': false,
            'waitingForUserMap': false,
            'waitingForUsers': false,
        };
        this.listenables = SlackActions;
    }

    getLists() {
        this.setState({ 'waitingForChannels': true });
        slack.channels.list({ 'token': ConfigStore.state.token }).
            then(this.setChannels.bind(this));
    }

    getAll() {}

    /**
     * Store channel data when ready.
     *
     * @param {any} data Channels received from Slack.
     * @returns {null} no return
     */
    setChannels(data) {
        if (!data.ok) {
            this.setState({ 'waitingForChannels': false });
            return;
        }

        this.setState({
            'channels': data.channels,
            'waitingForChannels': false,
        });
    }

    /**
     * When channels are available, iterate through to get histories.
     *
     * @returns {null} No return
     */
    processChannels() {
        if (this.state.waitingForChannels) {
            setTimeout(this.processChannels, timeout``);
            return;
        }

        this.state.channels.filter((c) => c.is_member).
            forEach((channel) => {
                const channelFile = path.
                    join(this.state.folder, `channel-${channel.name}.json`);
                const res = this.retrieveExistingMessages(channelFile);
                slack.channels.history({
                    'channel': channel.id,
                    'count': 1000,
                    'oldest': res[1],
                    'token': ConfigStore.state.token,
                }).then(this.writeHistory.bind(channel, res[0], channelFile));
            });
    }

    /**
     * Start instant message process.
     *
     * @returns {null} No return
     */
    getIms() {
        if (this.state.waitingForUserMap) {
            setTimeout(this.getIms, timeout);
            return;
        }

        this.setState({ 'waitingForIms': true });
        slack.im.list({ 'token': ConfigStore.state.token }).
            then(this.setIms.bind(this));
        setTimeout(this.processIms, 0);
    }

    /**
     * Store instant message data when ready.
     *
     * @param {any} data Messages returned from Slack.
     * @returns {null} No return
     */
    setIms(data) {
        if (!data.ok) {
            this.setState({ 'waitingForIms': false });
            return;
        }

        this.setState({
            'ims': data.ims,
            'waitingForIms': false,
        });
    }

    /**
     * When instant messages are available, iterate through to get histories.
     *
     * @returns {null} No return
     */
    processIms() {
        if (this.state.waitingForIms) {
            setTimeout(this.processIms, timeout);
            return;
        }

        this.state.ims.forEach((im) => {
            const user = this.state.userMap[im.user];
            const name = user.real_name ? user.real_name : user.name;
            const imFile = path.join(this.state.folder, `im-${name}.json`).
                replace(' ', '-');
            const res = this.retrieveExistingMessages(imFile);
            slack.im.history({
                'channel': im.id,
                'count': 1000,
                'oldest': res[1],
                'token': ConfigStore.state.token,
            }).then(this.writeHistory.bind(im, res[0], imFile));
        });
    }

    /**
     * Store group data when ready.
     *
     * @param {any} data Groups returned from Slack.
     * @returns {null} No return
     */
    setGroups(data) {
        if (!data.ok) {
            this.setState({ 'waitingForGroups': false });
            return;
        }

        this.setState({
            'groups': data.groups,
            'waitingForGroups': false,
        });
    }

    /**
     * When groups are available, iterate through to get histories.
     *
     * @returns {null} No return
     */
    processGroups() {
        if (this.state.waitingForGroups) {
            setTimeout(this.processGroups, timeout);
            return;
        }

        this.state.groups.forEach((group) => {
            const groupFile = path.
                join(this.state.folder, `group-${group.name}.json`);
            const res = this.retrieveExistingMessages(groupFile);
            slack.groups.history({
                'channel': group.id,
                'count': 1000,
                'oldest': res[1],
                'token': ConfigStore.state.token,
            }).then(this.writeHistory.bind(group, res[0], groupFile));
        });
    }

    /**
     * Store user data when ready.
     *
     * @param {any} data User data returned from Slack.
     * @returns {null} No return
     */
    setUsers(data) {
        if (!data.ok) {
            this.setState({ 'waitingForUsers': false });
            return;
        }

        this.setState({
            'users': data.members,
            'waitingForUsers': false,
        });
    }

    /**
     * When users are available, iterate through to get and save details.
     *
     * @returns {null} No return
     */
    processUsers() {
        if (this.state.waitingForUsers) {
            setTimeout(this.processUsers, timeout);
            return;
        }

        this.state.users.forEach((user) => {
            const json = JSON.stringify(user, null, indentation);
            let name = user.real_name ? user.real_name : user.name;
            name = name.replace(' ', '-');
            this.state.userMap[user.id] = user;
            fs.writeFileSync(path.
                join(this.state.folder, `user-${name}.json`), json);
        });
        this.setState({ 'waitingForUserMap': false });
    }

    /**
     * Extract existing messages and find most recent timestamp.
     *
     * @param {any} filePath Path where existing downloads have been stored
     * @returns {array} Messages and most recent timestamp
     */
    retrieveExistingMessages(filePath) {
        let messages = [];
        let lastTime = 0;
        if (fs.existsSync(filePath)) {
            messages = JSON.parse(fs.readFileSync(filePath), 'utf-8');
            if (messages.length > 0) {
                const msg = messages.
                    reduce((max, p) => (p.ts > max ? p.ts : max));
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
     * @param {any} original Existing messages
     * @param {any} filename Target file
     * @param {any} data Data retrieved from Slack
     * @returns {null} No return
     */
    writeHistory(original, filename, data) {
        if (data.ok) {
            const messages = data.messages.
                concat(original).
                sort((a, b) => b.ts - a.ts);
            const json = JSON.stringify(messages, null, indentation);
            fs.writeFileSync(filename, json);
        }
    }
}
Reflux.initStore(SlackStore);
