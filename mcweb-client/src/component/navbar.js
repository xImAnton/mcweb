import React from "react";


class Navbar extends React.Component {
    render() {
        return <ul id="navbar-options">
                    <li>General</li>
                    <li>Player</li>
                    <li>Console</li>
                    <li>Backups</li>
                    <li>Settings</li>
                    <li>World Management</li>
                    <li>Dynamic Server Management</li>
                    <li>User</li>
                </ul>;
    }
}

export default Navbar;