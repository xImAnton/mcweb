import React from "react";
import { getServer } from "../services";


class BackupsView extends React.Component {

    componentDidMount() {
        const server = getServer(this.props.servers, this.props.serverId);
        if (server) 
        document.title = server.name + " - Backups";
    }

    render() {
        return <div id="page-content">
                    <h1 id="page-headline">Backups</h1>
                </div>;
    }
}

export default BackupsView;