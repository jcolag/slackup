import { Box, Button, Checkbox, Form, TextInput } from 'proton-native';
import { ConfigActions, ConfigStore } from '../stores/configstore';
import React from 'react';
import Reflux from 'reflux';
import { SlackActions } from '../stores/slackstore';

/**
 * Authentication and configuration screen.
 *
 * @export
 * @class Auth
 * @extends {Reflux.Component}
 */
export default class Auth extends Reflux.Component {
    /**
     * Creates an instance of Auth.
     * @param {any} props Component properties
     * @returns {null} No return
     * @memberof Auth
     */
    constructor(props) {
        super(props);
        this.stores = [ConfigStore];
        this.updateTokenBound = this.updateToken.bind(this);
        this.updatePathBound = this.updatePath.bind(this);
        this.updateEmptySaveBound = this.updateEmptySave.bind(this);
        this.updateNonmemberSaveBound = this.updateNonmemberSave.bind(this);
        this.saveConfigBound = this.saveConfig.bind(this);
        this.startBound = this.start.bind(this);
    }

    /**
     * Updates the user token.
     *
     * @param {any} newText Updated token text
     * @returns {null} No return
     * @memberof Auth
     */
    updateToken(newText) {
        ConfigActions.setToken(newText);
    }

    /**
     * Updates the output folder path.
     *
     * @param {any} newText Updated path
     * @returns {null} No return
     * @memberof Auth
     */
    updatePath(newText) {
        ConfigActions.setFolder(newText);
    }

    /**
     * Updates whether to save empty conversations.
     *
     * @param {any} checked Updated save state
     * @returns {null} No return
     * @memberof Auth
     */
    updateEmptySave(checked) {
        ConfigActions.setEmptySave(checked);
    }

    /**
     * Updates whether to save channels not joined.
     *
     * @param {any} checked Updated save state
     * @returns {null} No return
     * @memberof Auth
     */
    updateNonmemberSave(checked) {
        ConfigActions.setNonmemberSave(checked);
    }

    /**
     * Kicks off the Slack list-gathering.
     *
     * @returns {null} No return
     * @memberof Auth
     */
    start() {
        if (!this.state.token || this.state.token === '') {
            return;
        }

        SlackActions.getLists();
    }

    /**
     * Save the current configuration state.
     *
     * @returns {null} No return
     * @memberof Auth
     */
    saveConfig() {
        ConfigActions.saveConfiguration();
    }

    /**
     * Renders the component.
     *
     * @returns {string} THe component
     * @memberof Auth
     */
    render() {
        return (
            <Box
                label={this.props.label}
                padded
            >
                <Form padded>
                    <TextInput
                        label="Token"
                        onChange={this.updateTokenBound}
                        stretchy={false}
                    >
                        {this.state.token}
                    </TextInput>
                    <TextInput
                        label="Output Path"
                        onChange={this.updatePathBound}
                        stretchy={false}
                    >
                        {this.state.folder}
                    </TextInput>
                    <Checkbox
                        checked={this.state.emptySave}
                        label="Save Empty Items"
                        onToggle={this.updateEmptySaveBound}
                        stretchy={false}
                    />
                    <Checkbox
                        checked={this.state.nonmemberSave}
                        label="Save Non-Member Channels"
                        onToggle={this.updateNonmemberSaveBound}
                        stretchy={false}
                    />
                    <Button
                        label="Get Lists"
                        onClick={this.startBound}
                        stretchy={false}
                    >
                    Go
                    </Button>
                    <Button
                        label="Save New Configuration"
                        onClick={this.saveConfigBound}
                        stretchy={false}
                    >
                    Save
                    </Button>
                    <TextInput
                        label="Count"
                        stretchy={false}
                    >
                        {this.state.count.toString()}
                    </TextInput>
                    <Button
                        label="Increment"
                        onClick={ConfigActions.increment}
                        stretchy={false}
                    >
                    Increment
                    </Button>
                </Form>
            </Box>);
    }
}
