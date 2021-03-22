import { useState } from "react";
import { patchServer } from "../services";


function SettingsView({currentServer, changeServer}) {

    let name, port, ram;
    if (currentServer) {
        name = currentServer.displayName;
        port = currentServer.port;
        ram = currentServer.allocatedRAM;
    }

    const [currentName, setName] = useState(name);
    const [currentPort, setPort] = useState(port);
    const [currentRam, setRam] = useState(ram);

    function submit() {
        let out = {
            displayName: currentName,
            port: currentPort,
            allocatedRAM: currentRam,
        }
        patchServer(currentServer.id, out).then((r) => {
            changeServer(currentServer.id);
        })
    }

    return  <div id="page-content">
                <h1 id="page-headline">Settings</h1>
                <table className={"formtable"}>
                    <tbody>
                        <tr>
                            <td>Name</td>
                            <td><input type="text" className="mcweb-ui" defaultValue={name} onChange={(e) => setName(e.currentTarget.value)}/></td>
                        </tr>
                        <tr>
                            <td>Port</td>
                            <td><input className="mcweb-ui" type="number" min={25000} defaultValue={port} max={30000} onChange={(e) => setPort(parseInt(e.currentTarget.value))}></input></td>
                        </tr>
                        <tr>
                            <td>RAM</td>
                            <td><input className="mcweb-ui" type="number" min={1} defaultValue={ram} max={32} onChange={(e) => setRam(parseInt(e.currentTarget.value))}></input></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><button className="mcweb-ui" onClick={submit}>Save Changes</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>;
}

export default SettingsView;
