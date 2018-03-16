import { Box, Checkbox } from 'proton-native';
import React from 'react';
import Reflux from 'reflux';
import { SlackStore } from '../stores/slackstore';

export default class Channels extends Reflux.Component {
    constructor(props) {
        super(props);
        this.stores = [SlackStore];
    }

    toggleState() {
    }

    render() {
        const checkboxes = [];
        this.state.channels.forEach((item) => {
            checkboxes.push(
                <Checkbox
                    checked={item.is_member}
                    label={item.name}
                    onToggle={this.toggleState}
                />);
        });
        return (
            <Box
                label={this.props.label}
                padded
            >
                {checkboxes}
            </Box>);
    }
}
