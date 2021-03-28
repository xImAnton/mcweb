import { useState, useEffect } from "react";
import { fetchVersions, putServer, useRestrictedState } from "../services";
import history from "../history";
import LoadingAnimation from "./loading";
import { Select, FormTable, FormLine, LastFormLine, Alert } from "./ui";


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
            <button className="mcweb-ui" onClick={createServer}>Create Server</button>
            { props.cancellable &&
                <button className="mcweb-ui" onClick={() => history.push("/general")}>Cancel</button>
            }
        </div>
}

/**
 * Component for creating new servers
 */
function CreateServerView({addFirstServer, cancellable, changeServer, maxRam, javaVersions}) {
    const [alert, setAlert] = useState(""); // alert to display on error, not rendered when empty
    const [versions, setVersions] = useState({}); // all possible versions for current server
    const [currentSoftware, setCurrentSoftware] = useState(""); // current software name
    const [currentVersion, setCurrentVersion] = useState(""); // current software version
    const [currentName, setCurrentName] = useRestrictedState("", (n) => n.match(/^[a-zA-Z0-9_\-\. ]{0,48}$/), () => {}); // name entered in name field
    const [currentRam, setCurrentRam] = useRestrictedState(2, (r) => r <= maxRam && r > 0, () => {});
    const [creating, setCreating] = useState(false); // whether the server is creating at the moment
    const [versionsLoaded, setVersionsLoaded] = useState(false); // whether the versions are fetched and ready to display, displays "Loading Versions" when false
    const [currentPort, setCurrentPort] = useRestrictedState(25565, (p) => p <= 30000 && p >= 25000, () => {}); // current entered ram
    const [currentJavaVersion, setCurrentJavaVersion] = useState("");

    useEffect(() => {
        // fetch possible software and versions from server
        fetchVersions().then(res => {
            let server = Object.keys(res.data)[0]; // select first software option
            let serverVersions = res.data[server]; // get all versions for first server
            let version = serverVersions[serverVersions.length - 1]; // select latest version of software
            setVersions(res.data);
            setCurrentSoftware(server);
            setCurrentVersion(version);
            setVersionsLoaded(true);
        });
    }, []);

    async function createServer() {
        // check if server name is specified
        if (!currentName) {
            setAlert("Please enter a name for the new server!");
            return false;
        }
        // check if ram is set
        if (!currentRam) {
            setAlert("Please specify how much ram the server should have!");
            return false;
        }
        if (!currentPort) {
            setAlert("Please specify the server port!")
            return false;
        }
        var status = false; // 0 or false when error, server id when server created successfully
        // display loading animation
        setCreating(true);
        // send server creation, backend downloads server jar
        await putServer(currentName, currentSoftware, currentVersion, currentRam, currentPort, currentJavaVersion).then(res => {
            status = res.data.add.server.id;
            addFirstServer(res.data.add.server);
            // cancel loading animation when server is created and ready to start
            setCreating(false);
            // pass server creation to app component
        }).catch((e) => {
            // on api error
            let alert = "";
            status = false;
            console.error(e.response.data.description);
            let error = e.response.data.error;
            // translate api error to alert message
            switch (error) {
                case "Duplicate Name":
                    alert = "There is already a server with that name: " + currentName;
                    break;
                case "Invalid Server":
                    alert = "There is no server type called " + currentSoftware;
                    break;
                case "Invalid Version":
                    alert = "The " + currentSoftware + " version is not supported: " + currentVersion;
                    break;
                case "Too Much RAM":
                    alert = "The maximal possible ram is " + maxRam;
                    break;
                case "Invalid Port":
                    alert = "The Port Number is invalid!";
                    break;
                case "Illegal Server Name":
                    alert = "The Server Name either has unsupported Symbols or has an invalid Length (3-48)";
                    break;
                default:
                    alert = "There was an server error creating your server"
                    break;
            }
            // cancel loading animation, display alert
            setCreating(false);
            setAlert(alert);
        });
        return status;
    }

    /**
     * called when the software changed, sets version to latest
     */
    function serverChanged(e) {
        let server = e.target.value;
        let serverVersions = versions[server];
        let version = serverVersions[serverVersions.length - 1];
        setCurrentSoftware(server);
        setCurrentVersion(version);
    }

    // capitalize softwares
    let servers = Object.keys(versions).map(v => {
        return <option value={v} key={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
    });
    
    let currentServerVersions;
    // display versions for current server when versions loaded
    if (currentVersion) {
        currentServerVersions = versions[currentSoftware].map(v => {
            return <option value={v} key={v}>{v}</option>
        });
    // otherwise nothing
    } else {
        currentServerVersions = [];
    }

    return <>{versionsLoaded ? (<div id="page-content">
        { !creating ? (
            <div className="page-full">
                <h1 id="page-headline">Create a new Server</h1>
                <Alert text={alert} />
                <FormTable mergeLast={true}>
                    <FormLine label="Name" input={
                        <input className="mcweb-ui" type="text" onChange={e => setCurrentName(e.target.value)} value={currentName}
                    />} />
                    <FormLine label="Software" input={
                        <Select value={currentSoftware} onChange={serverChanged}>
                            {servers}
                        </Select>
                    } />
                    <FormLine label="Version" input={
                        <Select value={currentVersion} onChange={e => setCurrentVersion(e.target.value)}>
                        {currentServerVersions}
                    </Select>
                    } />
                    <FormLine label="RAM" input={
                        <input className="mcweb-ui gb-selection" type="number" min={1} value={currentRam} max={maxRam} onChange={e => setCurrentRam(parseInt(e.target.value))} />
                    } />
                    <FormLine label="Port" input={
                        <input className="mcweb-ui" type="number" min={25000} value={currentPort} max={30000} onChange={e => setCurrentPort(parseInt(e.target.value))} />
                    } />
                    <FormLine label="Java Version" input={
                        <Select value={currentJavaVersion} onChange={e => setCurrentJavaVersion(e.target.value)}>
                            {Object.keys(javaVersions).map((k, i) => {
                                return <option value={k} key={k}>{javaVersions[k]}</option>
                            })}
                        </Select>
                    } />
                    <LastFormLine>
                        <CreateServerButton createServer={createServer} cancellable={cancellable} changeServer={changeServer} />
                    </LastFormLine>
                </FormTable>
            </div>
        ) : (<LoadingAnimation loadingText="Creating Server" />)}

    </div>) : (<LoadingAnimation loadingText="Loading Versions" />)}</>
}

export default CreateServerView;
