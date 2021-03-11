import React from "react";
import { getServer } from "../services";


class UserView extends React.Component {

    componentDidMount() {
        const server = getServer(this.props.servers, this.props.serverId);
        if (server) 
        document.title = server.name + " - User Management";
    }

    render() {
        return <div id="page-content">
                    <h1 id="page-headline">User Management</h1>
                </div>;
    }
}

export default UserView;