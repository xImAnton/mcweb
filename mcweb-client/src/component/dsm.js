import React from "react";
import { getServer } from "../services";


class DSMView extends React.Component {

    componentDidMount() {
        const server = getServer(this.props.servers, this.props.serverId);
        if (server) 
        document.title = server.name + " - Dynamic Server Management";
    }

    render() {
        return <div id="page-content">
                    <h1 id="page-headline">Dynamic Server Management</h1>
                </div>;
    }
}

export default DSMView;