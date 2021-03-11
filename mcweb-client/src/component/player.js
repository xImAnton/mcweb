import React from "react";
import { getServer } from "../services";


class PlayerView extends React.Component {

    componentDidMount() {
        const server = getServer(this.props.servers, this.props.serverId);
        if (server) 
        document.title = server.name + " - Player Management";
    }

    render() {
        return <div id="page-content">
                    <h1 id="page-headline">Player</h1>
                </div>;
    }
}

export default PlayerView;