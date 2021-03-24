import { useState } from "react";
import { patchServer } from "../services";
import { FormTable, FormLine } from "./ui";


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
                <FormTable mergeLast={true}>
                    <FormLine label="Name" input={<input type="text" className="mcweb-ui" defaultValue={name} onChange={(e) => setName(e.currentTarget.value)}/>} />
                    <FormLine label="Port" input={<input className="mcweb-ui" type="number" min={25000} defaultValue={port} max={30000} onChange={(e) => setPort(parseInt(e.currentTarget.value))} />} />
                    <FormLine label="RAM" input={<input className="mcweb-ui" type="number" min={1} defaultValue={ram} max={32} onChange={(e) => setRam(parseInt(e.currentTarget.value))} />} />
                    <tr>
                        <td colSpan={2}><button className="mcweb-ui" onClick={submit}>Save Changes</button></td>
                    </tr>
                </FormTable>
            </div>;
}

export default SettingsView;
