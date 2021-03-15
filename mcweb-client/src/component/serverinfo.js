import React from "react";
import CopyField from "./copyfield";
import { startServer, stopServer } from "../services";
import { useHistory } from "react-router-dom";


function AddServerButton(props) {
    const history = useHistory();

    function clicked(e) {
        props.setCreationCancellable(true);
        history.push("/createserver");
    }

    return <button id="btn-add-server" onClick={clicked}>+</button>
}

class ServerInfo extends React.Component {

    serverChanged(e) {
        this.props.changeServer(e.target.value);
    }

    toggleCurrentServer() {
        const currentServer = this.props.currentServer;
        if (currentServer.onlineStatus === 0) {
            this.props.setConsoleLines([]);
            startServer(this.props.currentServer.id);
        } else if (currentServer.onlineStatus === 1 | currentServer.onlineStatus === 2) {
            stopServer(this.props.currentServer.id);
        }
    }

    render() {
        let serverStatus = "";
        const currentServer = this.props.currentServer;
        let ip = "127.0.0.1";
        let buttonText = "Start";
        let buttonEnabled = true;
        
        if (currentServer) {
            switch (currentServer.onlineStatus) {
                case 0:
                    serverStatus = "offline";
                    break;
                case 1:
                    serverStatus = "starting";
                    buttonText = "Stop";
                    break;
                case 2:
                    serverStatus = "online";
                    buttonText = "Stop";
                    break;
                case 3:
                    serverStatus = "stopping";
                    buttonText = "Stop";
                    buttonEnabled = false;
                    break;
                default:
                    serverStatus = "unknown";
                    buttonText = "Start"
                    buttonEnabled = false;
                    break;
            };
            ip = currentServer.ip;
        }

        return <div id="server-information">Server: 
                <select value={this.props.currentServer ? this.props.currentServer.id : 0} onChange={(e) => this.serverChanged(e)}>
                    {this.props.servers.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
                    <CopyField text={ip} />
                    Status: <div id="online-status" className={serverStatus}></div>
                    <button id="control-server" onClick={() => this.toggleCurrentServer()} disabled={!buttonEnabled} >{buttonText}</button>
                    <AddServerButton setCreationCancellable={this.props.setCreationCancellable} />
                </div>;
    }
}

export default ServerInfo;