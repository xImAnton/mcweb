import Select from "../ui/select/select";
import { startServer, stopServer } from "../../services";
import history from "../../history";
import { FormTable, FormLine } from "../ui/form/form";
import styles from "./serverinfo.module.css";
import Button from "../ui/button/button";
import uistyles from "../ui/ui.module.css";
import CopyField from "../ui/copy/copy";


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

    return <Button onClick={clicked}>+</Button>
}

function ServerStatus({status}) {
    let serverStatus;
    switch (status) {
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

    return <div className={[uistyles.ui, styles.serverstatus, styles[serverStatus]].join(" ")}></div>;
}

function ServerInfo({changeServer, currentServer, setConsoleLines, openInfoBox, setCreationCancellable, servers, publicIP}) {

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
        port = currentServer.port;
    }

    return  <div className={styles.serverinfo}>
                <FormTable mergeLast={false}>
                    <FormLine label="Server" input={
                        <Select value={currentServer ? currentServer.id : 0} onChange={(e) => changeServer(e.target.value)} style={{maxWidth: "12em"}}>
                            {servers.map(x => <option key={x.id} value={x.id}>{x.displayName}</option>)}
                        </Select>
                    } />
                    <FormLine label="IP" input={<CopyField text={publicIP + (port !== 25565 ? ":" + port : "")} style={{maxWidth: "10em"}} />} />
                    <FormLine label="Status" input={<ServerStatus status={currentServer ? currentServer.onlineStatus : undefined} />} />
                    <tr>
                        <td colSpan={2}>
                            <div className={styles["start-add-wrapper"]}>
                                <Button id="control-server" onClick={toggleCurrentServer} disabled={!buttonEnabled}>{buttonText}</Button>
                                <AddServerButton setCreationCancellable={setCreationCancellable} />
                            </div>
                        </td>
                    </tr>
                </FormTable>
            </div>;
}

export default ServerInfo;
