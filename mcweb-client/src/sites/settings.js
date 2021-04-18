import { useState, useEffect } from "react";
import { patchServer, setTitle, splitCamelCase, capitalize, deleteServer as delServer } from "../services";
import LoadingAnimation from "../component/loading/loading";
import { FormTable, FormLine, MergedFormLine, ExpandableFormLine, DistributedFormLine } from "../component/ui/form/form";
import Select from "../component/ui/select/select";
import Site from "./site";
import Input from "../component/ui/input/text";
import Button from "../component/ui/button/button";
import { CustomPopup } from "../component/ui/infobox/infobox";
import { useAlert } from "react-alert";


function SettingsView({currentServer, javaVersions, maxRam}) {

    const [currentName, setName] = useState("");
    const [currentPort, setPort] = useState(25565);
    const [currentRam, setRam] = useState(2);
    const [currentJavaVersion, setCurrentJavaVersion] = useState("");
    const [loadingText, setLoadingText] = useState("");
    const [confirmServerDeletion, setConfirmServerDeletion] = useState(false);

    const alert = useAlert();

    useEffect(() => {
        setTitle("Settings");
    }, []);

    function update(currentServer) {
        setName(currentServer.displayName);
        setPort(currentServer.port);
        setRam(currentServer.allocatedRAM);
        setCurrentJavaVersion(currentServer.javaVersion);
    }

    useEffect(() => {
        update(currentServer);
    }, [currentServer]);

    function submit() {
        setLoadingText("Updating Settings");
        let out = {
            displayName: currentName,
            port: currentPort,
            allocatedRAM: currentRam,
            javaVersion: currentJavaVersion
        }
        patchServer(currentServer.id, out).finally(() => setLoadingText("")).then(() => {
            alert.success("Updated Server Settings");
        }).catch((e) => {
            if (e.response.status === 400) {
                alert.error("Invalid " + capitalize(splitCamelCase(e.response.data.key)));
            }
            // reset states on error
            update(currentServer);
        });
    }

    function deleteServer() {
        setConfirmServerDeletion(false);
        delServer(currentServer.id).then(() => {
            alert.success("Deleted " + currentServer.displayName);
        }).catch(() => {
            alert.error("Couldn't delete the Server");
        })
    }


    return  <Site name="Settings">
                { confirmServerDeletion && <CustomPopup headline="Confirm Server Deletion">
                    <span>Do you really want to delete the Server: {currentServer.displayName}?</span>
                    <FormTable>
                        <DistributedFormLine>
                            <Button onClick={() => setConfirmServerDeletion(false)}>No</Button>
                            <Button onClick={deleteServer}>Yes</Button>
                        </DistributedFormLine>
                    </FormTable>
                </CustomPopup> }
                { !loadingText ? 
                    <>
                        <FormTable mergeLast={true}>
                            <FormLine label="Name" input={<Input type="text" defaultValue={currentServer.displayName} onChange={(e) => setName(e.currentTarget.value)}/>} />
                            <FormLine label="RAM" input={<Input type="number" min={1} defaultValue={currentServer.allocatedRAM} max={maxRam} onChange={(e) => setRam(parseInt(e.currentTarget.value))} />} />
                            <ExpandableFormLine name="Advanced Settings">
                                <FormLine label="Port" input={<Input type="number" min={25000} defaultValue={currentServer.port} max={30000} onChange={(e) => setPort(parseInt(e.currentTarget.value))} />} />
                                <FormLine label="Java Version" input={
                                    <Select value={currentJavaVersion} onChange={e => setCurrentJavaVersion(e.target.value)}>
                                        {Object.keys(javaVersions).map((k, i) => {
                                            return <option value={k} key={k}>{javaVersions[k]}</option>
                                        })}
                                    </Select>
                                } />
                                <MergedFormLine>
                                    <Button style={{backgroundColor: "#de2323", color: "white"}} onClick={() => setConfirmServerDeletion(true)}>Delete Server</Button>
                                </MergedFormLine>
                            </ExpandableFormLine>
                            <MergedFormLine>
                                <Button onClick={submit}>Save Changes</Button>
                            </MergedFormLine>
                        </FormTable>
                    </> :
                    <LoadingAnimation loadingText={loadingText} />
                }
            </Site>;
}

export default SettingsView;
