import { useState, useEffect } from "react";
import { patchServer, setTitle } from "../services";
import LoadingAnimation from "../component/loading/loading";
import { FormTable, FormLine } from "../component/ui/form/form";
import Select from "../component/ui/select/select";
import Site from "./site";
import Input from "../component/ui/input/text";
import Button from "../component/ui/button/button";


function SettingsView({currentServer, javaVersions, maxRam}) {

    const [currentName, setName] = useState("");
    const [currentPort, setPort] = useState(25565);
    const [currentRam, setRam] = useState(2);
    const [currentJavaVersion, setCurrentJavaVersion] = useState("");
    const [loadingText, setLoadingText] = useState("");

    useEffect(() => {
        setTitle("Settings");
    }, []);

    useEffect(() => {
        setName(currentServer.displayName);
        setPort(currentServer.port);
        setRam(currentServer.allocatedRAM);
        setCurrentJavaVersion(currentServer.javaVersion);
    }, [currentServer]);

    function submit() {
        setLoadingText("Updating Settings");
        let out = {
            displayName: currentName,
            port: currentPort,
            allocatedRAM: currentRam,
            javaVersion: currentJavaVersion
        }
        patchServer(currentServer.id, out).finally(() => setLoadingText(""));
    }

    return  <Site name="Settings">
                { !loadingText ? 
                    <>
                        <FormTable mergeLast={true}>
                            <FormLine label="Name" input={<Input type="text" defaultValue={currentServer.displayName} onChange={(e) => setName(e.currentTarget.value)}/>} />
                            <FormLine label="Port" input={<Input type="number" min={25000} defaultValue={currentServer.port} max={30000} onChange={(e) => setPort(parseInt(e.currentTarget.value))} />} />
                            <FormLine label="RAM" input={<Input type="number" min={1} defaultValue={currentServer.allocatedRAM} max={maxRam} onChange={(e) => setRam(parseInt(e.currentTarget.value))} />} />
                            <FormLine label="Java Version" input={
                                <Select value={currentJavaVersion} onChange={e => setCurrentJavaVersion(e.target.value)}>
                                    {Object.keys(javaVersions).map((k, i) => {
                                        return <option value={k} key={k}>{javaVersions[k]}</option>
                                    })}
                                </Select>
                            } />
                            <tr>
                                <td colSpan={2}><Button onClick={submit}>Save Changes</Button></td>
                            </tr>
                        </FormTable>
                    </> :
                    <LoadingAnimation loadingText={loadingText} />
                }
            </Site>;
}

export default SettingsView;