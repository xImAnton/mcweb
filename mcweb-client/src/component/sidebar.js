import React from "react";
import Navbar from "./navbar";
import ServerInfo from "./serverinfo";


class Sidebar extends React.Component {
    render() {
        return <div id="sidebar-wrapper">
                    <aside>
                        <div id="sidebar-content">
                            <ServerInfo />
                            <Navbar />
                        </div>
                    </aside>
                </div>;
    }
}

export default Sidebar;