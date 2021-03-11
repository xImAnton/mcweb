import React from "react";
import { getServer } from "../services";


class GeneralView extends React.Component {

    componentDidMount() {
        const server = getServer(this.props.servers, this.props.serverId);
        if (server) 
        document.title = server.name + " - General";
    }

    render() {
        return <div id="page-content">
                    <h1 id="page-headline">General</h1>
                </div>;
    }
}

export default GeneralView;