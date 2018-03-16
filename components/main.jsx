import { App, Tab, Window } from 'proton-native';
import Auth from './auth';
import Channels from './channels';
import React from 'react';
import Reflux from 'reflux';

/**
 * Main container screen.
 *
 * @export
 * @class Main
 * @extends {Component}
 */
export default class Main extends Reflux.Component {
    /**
     * Creates an instance of Main.
     * @param {any} props Component properties
     * @returns {null} No return
     * @memberof Main
     */
    constructor(props) {
        super(props);
        this.state = {};
    }

    /**
     * Renders the component.
     *
     * @returns {string} The component
     * @memberof Main
     */
    render() {
        return (
            <App>
                <Window
                    menuBar
                    size={{
                        'h': 500,
                        'w': 500,
                    }}
                    title="Slackup"
                >
                    <Tab>
                        <Auth label="Configuration" />
                        <Channels label="Channels" />
                    </Tab>
                </Window>
            </App>);
    }
}
