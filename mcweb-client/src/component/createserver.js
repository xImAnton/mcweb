import React from "react";
import { fetchVersions, putServer } from "../services";
import history from "../history";


function CreateServerButton(props) {

    async function createServer() {
        let id = await props.createServer()
        if (id) {
            props.changeServer(id);
            history.push("/general");
        }
    }

    return <div className="server-create-btns">
            <button onClick={createServer}>Create Server</button>
            { props.cancellable &&
                <button onClick={() => history.push("/general")}>Cancel</button>
            }
        </div>
}

class CreateServerView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            versions: {},
            currentServer: "",
            currentVersion: "",
            currentName: "",
            currentRam: 2,
            alert: "",
            loading: false,
            maxRam: 32,
        }
    }

    componentDidMount() {
        fetchVersions().then(
            res => {
                let server = Object.keys(res.data)[0];
                let serverVersions = res.data[server];
                let version = serverVersions[serverVersions.length - 1];
                this.setState({versions: res.data, currentServer: server, currentVersion: version})
            }
        );
        document.title = "MCWeb - Create New Server";
    }

    async createServer() {
        if (!this.state.currentName) {
            this.setState({alert: "Please enter a name for the new server!"})
            return false;
        }
        if (!this.state.currentRam) {
            this.setState({alert: "Plase specify how much ram the server should have!"})
            return false;
        }
        var status = 0;
        this.setState({loading: true});
        await putServer(this.state.currentName, this.state.currentServer, this.state.currentVersion, this.state.currentRam).then(res => {
            status = res.data.add.server.id;
            this.setState({loading: false});
            this.props.addServer(res.data.add.server);
        }).catch((e) => {
            let alert = "";
            status = false;
            let error = e.response.data.error;
            switch (error) {
                case "Duplicate Name":
                    alert = "There is already a server with that name: " + this.state.currentName;
                    break;
                case "Invalid Server":
                    alert = "There is no server type called " + this.state.currentServer;
                    break;
                case "Invalid Version":
                    alert = "The " + this.state.currentServer + " version is not supported: " + this.state.currentVersion;
                    break;
                case "Too Much RAM":
                    alert = "The maximal possible ram is " + e.response.data.maxRam;
                    this.setState({maxRam: e.response.data.maxRam})
                    break;
                default:
                    break;
            }
            this.setState({loading: false, alert: alert});
        });
        return status;
    }

    serverChanged(e) {
        let server = e.target.value;
        let serverVersions = this.state.versions[server];
        let version = serverVersions[serverVersions.length - 1];
        this.setState({currentServer: server, currentVersion: version});
    }

    render() {
        let servers = Object.keys(this.state.versions).map(v => {
            return <option value={v} key={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
        });
        
        let versions;
        if (this.state.currentVersion) {
            versions = this.state.versions[this.state.currentServer].map(v => {
                return <option value={v} key={v}>{v}</option>
            });
        } else {
            versions = [];
        }

        return <div id="page-content">
            { !this.state.loading &&
                <div className="page-full">
                    <h1 id="page-headline">Create a new Server</h1>
                    { this.state.alert && <div className={"alert-box red"}>{this.state.alert}</div> }
                    Name: <input type="text" onChange={e => {this.setState({currentName: e.target.value})}} defaultValue={this.state.currentName} />
                    <br />
                    Server: <select value={this.state.currentServer} onChange={e => this.serverChanged(e)}>
                        {servers}
                    </select>
                    <br />
                    Version: <select value={this.state.currentVersion} onChange={e => this.setState({currentVersion: e.target.value})}>
                        {versions}
                    </select>
                    <br />
                    Ram: <input type="number" min={1} defaultValue={this.state.currentRam} max={this.state.maxRam} onChange={e => this.setState({currentRam: parseInt(e.target.value)})} />
                    <br />
                    <CreateServerButton createServer={() => this.createServer()} cancellable={this.props.cancellable} changeServer={this.props.changeServer}/>
                </div>
            }
            { this.state.loading && 
                <div id="loading-wrapper">
                    <div id="loading-content">
                        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                        <div>Creating Server...</div>
                    </div>
                </div>
            }

        </div>
    }
}

export default CreateServerView;