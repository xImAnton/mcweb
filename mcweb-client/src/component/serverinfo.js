import React from "react";
import axios from "axios";
import CopyField from "./copyfield";


class ServerInfo extends React.Component {

    serverChanged(e) {
        this.props.changeServer(parseInt(e.target.value));
    }

    getCurrentServer() {
        for (let i = 0; i < this.props.servers.length; i++) {
            if (this.props.servers[i].id === this.props.serverId) {
                return this.props.servers[i];
            }
        }
        return null;
    }

    toggleCurrentServer() {
        const currentServer = this.getCurrentServer();
        if (currentServer.onlineStatus === 0) {
            this.props.setConsoleLines([]);
            axios.get("http://localhost:3000/server/" + this.props.serverId + "/start", {
                headers: {
                    "Authorization": "Token " + this.props.sessionId()
                }
            });
        } else if (currentServer.onlineStatus === 1 | currentServer.onlineStatus === 2) {
            axios.get("http://localhost:3000/server/" + this.props.serverId + "/stop", {
                headers: {
                    "Authorization": "Token " + this.props.sessionId()
                }
            });
        }
    }

    render() {
        let serverStatus = "";
        const currentServer = this.getCurrentServer();
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
                    break;
            };
            ip = currentServer.ip;
        }

        return <div id="server-information">Server: 
                <select value={this.props.serverId} onChange={(e) => this.serverChanged(e)}>
                    {this.props.servers.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
                    <CopyField text={ip} />
                    Status: <div id="online-status" className={serverStatus}></div>
                    <button id="control-server" onClick={() => this.toggleCurrentServer()} disabled={!buttonEnabled} >{buttonText}</button>
                </div>;
    }
}

export default ServerInfo;