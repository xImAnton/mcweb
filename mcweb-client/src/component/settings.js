import React from "react";
import { getServer } from "../services";


class SettingsView extends React.Component {

    componentDidMount() {
        const server = getServer(this.props.servers, this.props.serverId);
        if (server) 
        document.title = server.name + " - Settings";
    }

    render() {
        return <div id="page-content">
                    <h1 id="page-headline">Settings</h1>
                </div>;
    }
}

export default SettingsView;