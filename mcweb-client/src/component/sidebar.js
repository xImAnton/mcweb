import React from "react";
import Navbar from "./navbar";
import ServerInfo from "./serverinfo";


class Sidebar extends React.Component {
    render() {
        return <div id="sidebar-wrapper">
                    <aside>
                        <div id="sidebar-content">
                            <ServerInfo
                                servers={this.props.servers}
                                currentServer={this.props.currentServer}
                                changeServer={this.props.changeServer}
                                sessionId={this.props.sessionId}
                                setConsoleLines={this.props.setConsoleLines}
                                setCreationCancellable={this.props.setCreationCancellable}
                                openInfoBox={this.props.openInfoBox}
                            />
                            <Navbar logout={this.props.logout} getUserName={this.props.getUserName} currentServer={this.props.currentServer} />
                        </div>
                    </aside>
                </div>;
    }
}

export default Sidebar;
