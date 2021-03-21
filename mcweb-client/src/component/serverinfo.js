import React from "react";
import { CopyField, Select } from "./ui";
import { startServer, stopServer } from "../services";
import history from "../history"


/**
 * plus button for opening CreateServerView
 */
function AddServerButton(props) {
    function clicked(e) {
        // make server creation cancellable
        props.setCreationCancellable(true);
        // redirect to server creation
        history.push("/createserver");
    }

    return <button id="btn-add-server" className="mcweb-ui" onClick={clicked}>+</button>
}

function ServerStatus(props) {
    let serverStatus;
    switch (props.status) {
        case 0:
            serverStatus = "offline";
            break;
        case 1:
            serverStatus = "starting";
            break;
        case 2:
            serverStatus = "online";
            break;
        case 3:
            serverStatus = "stopping";
            break;
        default:
            serverStatus = "unknown";
            break;
    }

    return <div id="online-status" className={serverStatus}></div>;
}

class ServerInfo extends React.Component {

    serverChanged(e) {
        // called when server select field changes, switch and fetch new server
        this.props.changeServer(e.target.value);
    }

    toggleCurrentServer() {
        // start/ stop current server
        const currentServer = this.props.currentServer;
        // when server offline, clear console and start it
        if (currentServer.onlineStatus === 0) {
            this.props.setConsoleLines([]);
            startServer(this.props.currentServer.id).catch((e) => {
                if (e.response.data.error === "Port Unavailable") {
                    this.props.openInfoBox("Port Unavailable", "There is already a server running on that port!")
                }
            });
        // when server online or starting, stop it
        } else if (currentServer.onlineStatus === 1 | currentServer.onlineStatus === 2) {
            stopServer(this.props.currentServer.id);
        }
    }

    render() {
        const currentServer = this.props.currentServer;
        let ip = "127.0.0.1";
        let buttonText = "Start";
        let buttonEnabled = true;
        let port = 25565;
        
        // determine button text
        if (currentServer) {
            switch (currentServer.onlineStatus) {
                case 0:
                    break;
                case 1:
                    buttonText = "Stop";
                    break;
                case 2:
                    buttonText = "Stop";
                    break;
                case 3:
                    buttonText = "Stop";
                    buttonEnabled = false;
                    break;
                default:
                    buttonText = "Start"
                    buttonEnabled = false;
                    break;
            };
            ip = currentServer.ip;
            port = currentServer.port;
        }

        return  <div id="server-information">
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    Server:
                                </td>
                                <td>
                                    <Select value={this.props.currentServer ? this.props.currentServer.id : 0} onChange={(e) => this.serverChanged(e)}>
                                        {this.props.servers.map(x => <option key={x.id} value={x.id}>{x.displayName}</option>)}
                                    </Select>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    IP:
                                </td>
                                <td>
                                    <CopyField text={ip + ":" + port} />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Status:
                                </td>
                                <td>
                                    <ServerStatus status={currentServer ? currentServer.onlineStatus : undefined} />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2}>
                                    <div className="start-add-wrapper mcweb-ui" style={{"padding": "0"}}>
                                        <button className="mcweb-ui" id="control-server" onClick={() => this.toggleCurrentServer()} disabled={!buttonEnabled} >{buttonText}</button>
                                        <AddServerButton setCreationCancellable={this.props.setCreationCancellable} />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>;
    }
}

export default ServerInfo;
