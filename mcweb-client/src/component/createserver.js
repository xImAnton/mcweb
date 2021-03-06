import React from "react";
import { fetchVersions, putServer } from "../services";
import history from "../history";
import LoadingAnimation from "./loading"


/**
 * Create Server and Cancel button of CreateServerView
 */
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

/**
 * Component for creating new servers
 */
class CreateServerView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            versions: {}, // all possible versions for current server
            currentServer: "", // current software name
            currentVersion: "", // current software version
            currentName: "", // name entered in name field
            currentRam: 2, // current selected ram
            alert: "", // alert to display on error, not rendered when empty
            loading: false, // whether the server is creating at the moment
            maxRam: 32, // the maximal possible ram for the backend, gets set when user tries to set too much ram, because maxram is only sent in error response
            versionsLoaded: false // whether the versions are fetched and ready to display, displays "Loading Versions" when false
        }
    }

    componentDidMount() {
        // fetch possible software and versions from server
        fetchVersions().then(
            res => {
                let server = Object.keys(res.data)[0]; // select first software option
                let serverVersions = res.data[server]; // get all versions for first server
                let version = serverVersions[serverVersions.length - 1]; // select latest version of software
                this.setState({versions: res.data, currentServer: server, currentVersion: version, versionsLoaded: true})
            }
        );
    }

    async createServer() {
        // check if server name is specified
        if (!this.state.currentName) {
            this.setState({alert: "Please enter a name for the new server!"})
            return false;
        }
        // check if ram is set
        if (!this.state.currentRam) {
            this.setState({alert: "Plase specify how much ram the server should have!"})
            return false;
        }
        var status = 0; // 0 or false when error, server id when server created successfully
        // display loading animation
        this.setState({loading: true});
        // send server creation, backend downloads server jar
        await putServer(this.state.currentName, this.state.currentServer, this.state.currentVersion, this.state.currentRam).then(res => {
            status = res.data.add.server.id;
            // cancel loading animation when server is created and ready to start
            this.setState({loading: false});
            // pass server creation to app component
        }).catch((e) => {
            // on api error
            let alert = "";
            status = false;
            let error = e.response.data.error;
            // translate api error to alert message
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
                    alert = "There was an server error creating your server"
                    break;
            }
            // cancel loading animation, display alert
            this.setState({loading: false, alert: alert});
        });
        return status;
    }

    /**
     * called when the software changed, sets version to latest
     */
    serverChanged(e) {
        let server = e.target.value;
        let serverVersions = this.state.versions[server];
        let version = serverVersions[serverVersions.length - 1];
        this.setState({currentServer: server, currentVersion: version});
    }

    render() {
        // capitalize softwares
        let servers = Object.keys(this.state.versions).map(v => {
            return <option value={v} key={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
        });
        
        let versions;
        // display versions for current server when versions loaded
        if (this.state.currentVersion) {
            versions = this.state.versions[this.state.currentServer].map(v => {
                return <option value={v} key={v}>{v}</option>
            });
        // otherwise nothing
        } else {
            versions = [];
        }

        return <>{this.state.versionsLoaded ? (<div id="page-content">
            { !this.state.loading ? (
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
                    Ram: <input type="number" min={1} className={"gb-selection"} defaultValue={this.state.currentRam} max={this.state.maxRam} onChange={e => this.setState({currentRam: parseInt(e.target.value)})} />
                    <br />
                    <CreateServerButton createServer={() => this.createServer()} cancellable={this.props.cancellable} changeServer={this.props.changeServer}/>
                </div>
            ) : (<LoadingAnimation loadingText="Creating Server" />)}

        </div>) : (<LoadingAnimation loadingText="Loading Versions" />)}</>
    }
}

export default CreateServerView;