import Reflux from 'reflux';
const fs = require('fs');
const configFile = '.slackuprc.json';
const indentation = 4;

export const ConfigActions = Reflux.createActions({
    'increment': { 'children': ['completed'] },
    'saveConfiguration': {},
    'setEmptySave': {},
    'setFolder': {},
    'setNonmemberSave': {},
    'setToken': {},
});

/**
 * Exposes configuration information to the program.
 *
 * @export
 * @class ConfigStore
 * @extends {Reflux.Store}
 */
export class ConfigStore extends Reflux.Store {
    /**
     * Creates an instance of ConfigStore.
     * @memberof ConfigStore
     */
    constructor() {
        let config = {};
        super();
        if (fs.existsSync(configFile)) {
            config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
        }
        this.state = {
            'count': -6,
            'emptySave': config.hasOwnProperty('emptySave')
                ? config.emptySave
                : false,
            'folder': config.hasOwnProperty('folder')
                ? config.folder
                : 'data',
            'nonmemberSave': config.hasOwnProperty('nonmemberSave')
                ? config.nonmemberSave
                : false,
            'token': config.hasOwnProperty('token')
                ? config.token
                : '',
        };
        this.listenables = ConfigActions;
    }

    onIncrement() {
        this.setState((prevState) => ({ 'count': prevState.count + 1 }));
        ConfigActions.increment.completed();
    }

    onIncrementCompleted() {
        console.log(this.state.count);
    }

    /**
     * Sets a new value for the token.
     *
     * @param {any} newToken The updated string for the token.
     * @returns {null} no return
     * @memberof ConfigStore
     */
    onSetToken(newToken) {
        if (newToken === this.state.token) {
            return;
        }

        this.setState({ 'token': newToken });
    }

    /**
     * Sets a new path for the output folder.
     *
     * @param {any} newFolder The updated string for the folder.
     * @returns {null} no return
     * @memberof ConfigStore
     */
    onSetFolder(newFolder) {
        if (newFolder === this.state.folder) {
            return;
        }

        this.setState({ 'folder': newFolder });
    }

    /**
     * Sets a new state for whether to save empty conversations.
     *
     * @param {bool} newState The updated boolean.
     * @returns {null} no return
     * @memberof ConfigStore
     */
    onSetEmptySave(newState) {
        if (newState === this.state.emptySave) {
            return;
        }

        this.setState({ 'emptySave': newState });
    }

    /**
     * Sets a new state for whether to save channels the user isn't a member of.
     *
     * @param {any} newState The updated boolean.
     * @returns {null} no return
     * @memberof ConfigStore
     */
    onSetNonmemberSave(newState) {
        if (newState === this.state.nonmemberSave) {
            return;
        }

        this.setState({ 'nonmemberSave': newState });
    }

    /**
     * Saves the current configuration.
     *
     * @returns {null} no return
     * @memberof ConfigStore
     */
    onSaveConfiguration() {
        const config = {
            'emptySave': this.state.emptySave,
            'folder': this.state.folder,
            'nonmemberSave': this.state.nonmemberSave,
            'token': this.state.token,
        };
        fs.writeFileSync(configFile, JSON.stringify(config, null, indentation));
    }
}
Reflux.initStore(ConfigStore);
