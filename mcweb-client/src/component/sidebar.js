import React from "react";
import Navbar from "./navbar";
import ServerInfo from "./serverinfo";


class Sidebar extends React.Component {
    render() {
        return <div id="sidebar-wrapper">
                    <aside>
                        <div id="sidebar-content">
                            <ServerInfo servers={this.props.servers} serverId={this.props.serverId} changeServer={this.props.changeServer} sessionId={this.props.sessionId} setConsoleLines={this.props.setConsoleLines} />
                            <Navbar logout={this.props.logout} getUserName={this.props.getUserName}/>
                        </div>
                    </aside>
                </div>;
    }
}

export default Sidebar;