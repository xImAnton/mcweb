import React from "react";
import NavbarEntry from "./navbarentry"


class Navbar extends React.Component {
    render() {
        return <ul id="navbar-options">
                    <NavbarEntry name="General" href="general" index={1}/>
                    <NavbarEntry name="Player" href="player" index={2}/>
                    <NavbarEntry name="Console" href="console" index={3}/>
                    <NavbarEntry name="Backups" href="backups" index={4}/>
                    <NavbarEntry name="Settings" href="settings" index={5}/>
                    <NavbarEntry name="World Management" href="worlds" index={6}/>
                    <NavbarEntry name="Dynamic Server Management" href="dsm" index={7}/>
                    <NavbarEntry name="User Management" href="user" index={8}/>
                    <li key={9}>Logged in as {this.props.getUserName()} (<span onClick={this.props.logout} className="logout">Logout</span>)</li>
                </ul>;
    }
}

export default Navbar;