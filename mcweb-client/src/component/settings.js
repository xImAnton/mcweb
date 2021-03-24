import { useState, useEffect } from "react";
import { patchServer, fetchJavaVersions } from "../services";
import LoadingAnimation from "./loading";
import { FormTable, FormLine, Select } from "./ui";


function SettingsView({currentServer, changeServer}) {

    let name, port, ram, javaVersion;
    if (currentServer) {
        name = currentServer.displayName;
        port = currentServer.port;
        ram = currentServer.allocatedRAM;
        javaVersion = currentServer.javaVersion;
    }

    const [currentName, setName] = useState(name);
    const [currentPort, setPort] = useState(port);
    const [currentRam, setRam] = useState(ram);
    const [javaVersions, setJavaVersions] = useState({});
    const [currentJavaVersion, setCurrentJavaVersion] = useState(javaVersion);

    useEffect(() => {
        fetchJavaVersions().then(res => {
            setJavaVersions(res.data);
            // setCurrentJavaVersion(Object.keys(res.data)[0]);
        });
    }, []);

    function submit() {
        let out = {
            displayName: currentName,
            port: currentPort,
            allocatedRAM: currentRam,
            javaVersion: currentJavaVersion
        }
        patchServer(currentServer.id, out).then((r) => {
            changeServer(currentServer.id);
        })
    }

    return  <div id="page-content">
                { Object.keys(javaVersions).length !== 0 ? 
                    <>
                        <h1 id="page-headline">Settings</h1>
                        <FormTable mergeLast={true}>
                            <FormLine label="Name" input={<input type="text" className="mcweb-ui" defaultValue={name} onChange={(e) => setName(e.currentTarget.value)}/>} />
                            <FormLine label="Port" input={<input className="mcweb-ui" type="number" min={25000} defaultValue={port} max={30000} onChange={(e) => setPort(parseInt(e.currentTarget.value))} />} />
                            <FormLine label="RAM" input={<input className="mcweb-ui" type="number" min={1} defaultValue={ram} max={32} onChange={(e) => setRam(parseInt(e.currentTarget.value))} />} />
                            <FormLine label="Java Version" input={
                                <Select value={currentJavaVersion} onChange={e => setCurrentJavaVersion(e.target.value)}>
                                    {Object.keys(javaVersions).map((k, i) => {
                                        return <option value={k} key={k}>{javaVersions[k]}</option>
                                    })}
                                </Select>
                            } />
                            <tr>
                                <td colSpan={2}><button className="mcweb-ui" onClick={submit}>Save Changes</button></td>
                            </tr>
                        </FormTable>
                    </> :
                    <LoadingAnimation />
                }
            </div>;
}

export default SettingsView;
