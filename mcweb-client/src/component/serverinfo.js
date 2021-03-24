import { CopyField, Select } from "./ui";
import { startServer, stopServer, getServer } from "../services";
import history from "../history";
import { FormTable, FormLine } from "./ui";


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

function ServerInfo({changeServer, currentServer, setConsoleLines, openInfoBox, setCreationCancellable, servers}) {

    function toggleCurrentServer() {
        // start/ stop current server
        // when server offline, clear console and start it
        if (currentServer.onlineStatus === 0) {
            setConsoleLines([]);
            startServer(currentServer.id).catch((e) => {
                if (e.response.data.error === "Port Unavailable") {
                    openInfoBox("Port Unavailable", "There is already a server running on that port!")
                }
            });
        // when server online or starting, stop it
        } else if (currentServer.onlineStatus === 1 | currentServer.onlineStatus === 2) {
            stopServer(currentServer.id);
        }
    }

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
                <FormTable mergeLast={false}>
                    <FormLine label="Server" input={
                        <Select value={currentServer ? currentServer.id : 0} onChange={(e) => changeServer(e.target.value)}>
                            {servers.map(x => <option key={x.id} value={x.id}>{x.displayName}</option>)}
                        </Select>
                    } />
                    <FormLine label="IP" input={<CopyField text={ip + ":" + port} />} />
                    <FormLine label="Status" input={<ServerStatus status={currentServer ? currentServer.onlineStatus : undefined} />} />
                    <tr>
                        <td colSpan={2}>
                            <div className="start-add-wrapper mcweb-ui" style={{"padding": "0"}}>
                                <button className="mcweb-ui" id="control-server" onClick={toggleCurrentServer} disabled={!buttonEnabled} >{buttonText}</button>
                                <AddServerButton setCreationCancellable={setCreationCancellable} />
                            </div>
                        </td>
                    </tr>
                </FormTable>
            </div>;
}

export default ServerInfo;
