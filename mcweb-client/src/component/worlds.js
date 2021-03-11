import React from "react";
import { getServer } from "../services";


class WorldsView extends React.Component {

    componentDidMount() {
        const server = getServer(this.props.servers, this.props.serverId);
        if (server) 
        document.title = server.name + " - World Management";
    }

    render() {
        return <div id="page-content">
                    <h1 id="page-headline">World Management</h1>
                </div>;
    }
}

export default WorldsView;