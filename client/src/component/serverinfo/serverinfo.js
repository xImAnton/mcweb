import Select from "../ui/select/select";
import { startServer, stopServer, restartServer } from "../../services";
import { FormTable, FormLine, DistributedFormLine } from "../ui/form/form";
import styles from "./serverinfo.module.css";
import Button from "../ui/button/button";
import uistyles from "../ui/ui.module.css";
import CopyField from "../ui/copy/copy";
import { useAlert } from "react-alert";
import { useDesign } from "../../ctx/design";


function ToggleServerButton({server, onClick}) {
    let buttonText = "Start";
    let buttonEnabled = true;
    
    // determine button text
    if (server) {
        switch (server.onlineStatus) {
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
    }

    return <Button id="control-server" onClick={onClick} disabled={!buttonEnabled}>{buttonText}</Button>
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

function ServerInfo({changeServer, currentServer, setConsoleLines, servers, publicIP}) {

    const alert = useAlert();
    const design = useDesign();

    function toggleCurrentServer() {
        // start/ stop current server
        // when server offline, clear console and start it
        if (currentServer.onlineStatus === 0) {
            setConsoleLines([]);
            startServer(currentServer.id).catch((e) => {
                if (e.response.data.error === "Port Unavailable") {
                    alert.error("Port Unavailable");
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

    const ipstyle = {};
    const serverliststyle = {};
    if (!design.isResponsive) {
        ipstyle.maxWidth = "10em";
        serverliststyle.maxWidth = "12em"
    }

    return  <div className={styles.container}>
                <div className={styles.serverinfo}>
                    <FormTable mergeLast={false}>
                        <FormLine label="Server" input={
                            <Select value={currentServer ? currentServer.id : 0} onChange={(e) => changeServer(e.target.value)} style={serverliststyle}>
                                {servers.map(x => <option key={x.id} value={x.id}>{x.displayName}</option>)}
                            </Select>
                        } />
                        <FormLine label="IP" input={<CopyField text={publicIP + (port !== 25565 ? ":" + port : "")} style={ipstyle} onCopy={() => alert.success("Copied Server IP")}/>} />
                        <FormLine label="Status" input={<ServerStatus status={currentServer ? currentServer.onlineStatus : undefined} />} />
                        <DistributedFormLine>
                            <ToggleServerButton onClick={toggleCurrentServer} server={currentServer} />
                            { currentServer.onlineStatus === 2 && <Button onClick={() => restartServer(currentServer.id)}>Restart</Button> }
                        </DistributedFormLine>
                    </FormTable>
                </div>
            </div>
}

export default ServerInfo;
