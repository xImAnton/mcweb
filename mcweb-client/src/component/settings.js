import { useState, useEffect } from "react";
import { patchServer, fetchJavaVersions } from "../services";
import LoadingAnimation from "./loading";
import { FormTable, FormLine, Select } from "./ui";


function SettingsView({currentServer, changeServer}) {

    const [currentName, setName] = useState("");
    const [currentPort, setPort] = useState(25565);
    const [currentRam, setRam] = useState(2);
    const [javaVersions, setJavaVersions] = useState({});
    const [currentJavaVersion, setCurrentJavaVersion] = useState("");

    useEffect(() => {
        fetchJavaVersions().then(res => {
            setJavaVersions(res.data);
        });
    }, []);

    useEffect(() => {
        console.log("upd");
        setName(currentServer.displayName);
        setPort(currentServer.port);
        setRam(currentServer.allocatedRAM);
        setCurrentJavaVersion(currentServer.javaVersion);
    }, [currentServer]);

    function submit() {
        let out = {
            displayName: currentName,
            port: currentPort,
            allocatedRAM: currentRam,
            javaVersion: currentJavaVersion
        }
        patchServer(currentServer.id, out).then((r) => {
        })
    }

    return  <div id="page-content">
                { Object.keys(javaVersions).length !== 0 ? 
                    <>
                        <h1 id="page-headline">Settings</h1>
                        <FormTable mergeLast={true}>
                            <FormLine label="Name" input={<input type="text" className="mcweb-ui" defaultValue={currentServer.displayName} onChange={(e) => setName(e.currentTarget.value)}/>} />
                            <FormLine label="Port" input={<input className="mcweb-ui" type="number" min={25000} defaultValue={currentServer.port} max={30000} onChange={(e) => setPort(parseInt(e.currentTarget.value))} />} />
                            <FormLine label="RAM" input={<input className="mcweb-ui" type="number" min={1} defaultValue={currentServer.allocatedRAM} max={32} onChange={(e) => setRam(parseInt(e.currentTarget.value))} />} />
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
