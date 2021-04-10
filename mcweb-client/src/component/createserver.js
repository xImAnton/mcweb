import { useState, useEffect } from "react";
import { fetchSoftwaresAndTheirMajors, fetchMinorVersions, putServer, useRestrictedState, capitalize, setTitle } from "../services";
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
    const [currentMinor, setCurrentMinor] = useState(""); // current minor software version
    const [currentMajor, setCurrentMajor] = useState(""); // current major software version
    const [currentName, setCurrentName] = useRestrictedState("", (n) => n.match(/^[a-zA-Z0-9_\-\. ]{0,48}$/), () => {}); // name entered in name field
    const [currentRam, setCurrentRam] = useRestrictedState(2, (r) => r <= maxRam && r > 0, () => {});
    const [creating, setCreating] = useState(false); // whether the server is creating at the moment
    const [versionsLoaded, setVersionsLoaded] = useState(false); // whether the versions are fetched and ready to display, displays "Loading Versions" when false
    const [currentPort, setCurrentPort] = useRestrictedState(25565, (p) => p <= 30000 && p >= 25000, () => {}); // current entered ram
    const [currentJavaVersion, setCurrentJavaVersion] = useState("");

    useEffect(() => {
        if (javaVersions) {
            setCurrentJavaVersion(Object.keys(javaVersions)[0]);
        }
    }, [javaVersions]);

    useEffect(() => {
        setTitle("Server Creation");
        // fetch possible software and versions from server
        fetchSoftwaresAndTheirMajors().then(res => {
            const newVersions = Object.assign({}, versions);
            Object.entries(res.data).forEach(([key, val]) => {
                const softwareVersions = {};
                val.forEach(major => {
                    softwareVersions[major] = {
                        fetched: false,
                        data: [],
                    };
                });
                newVersions[key] = softwareVersions;
            });
            setVersions(newVersions);
            let server = Object.keys(res.data)[0]; // select first software option
            let majorVersion = Object.keys(newVersions[server])[0]; // select first major version of software
            setCurrentSoftware(server);
            setCurrentMajor(majorVersion);
            setVersionsLoaded(true);
        });
    }, []);

    function fetchCurrentMinors() {
        if (!(currentSoftware && currentMajor)) return;
        if (!versions[currentSoftware][currentMajor].fetched) {
            setVersionsLoaded(false);
            fetchMinorVersions(currentSoftware, currentMajor).then(res => {
                const newVersions = Object.assign({}, versions);
                newVersions[currentSoftware][currentMajor] = {
                    data: res.data,
                    fetched: true,
                };
                setVersions(newVersions);
                setVersionsLoaded(true);
                setCurrentMinor(res.data[res.data.length - 1]);
            });
        } else {
            setCurrentMinor(versions[currentSoftware][currentMajor].data[versions[currentSoftware][currentMajor].data.length - 1]);
        }

    }

    useEffect(fetchCurrentMinors, [currentMajor]);

    /**
     * called when the software changed, sets version to latest
     */
     useEffect(() => {
        if (!currentSoftware) return;
        let serverVersions = Object.keys(versions[currentSoftware]);
        let version = serverVersions[serverVersions.length - 1];
        if (currentMajor === version) {
            fetchCurrentMinors();
        } else {
            setCurrentMajor(version);
        }
    }, [currentSoftware]);

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
        await putServer(currentName, currentSoftware, currentMajor, currentMinor, currentRam, currentPort, currentJavaVersion).then(res => {
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
                    alert = "The " + currentSoftware + " version is not supported: " + currentMajor + " " + currentMinor;
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

    // capitalize softwares
    let servers = Object.keys(versions).map(v => {
        return <option value={v} key={v}>{capitalize(v)}</option>
    });

    let currentMajorVersions = [];
    if (currentSoftware) {
        currentMajorVersions = Object.keys(versions[currentSoftware]).map(major => {
            return <option value={major} key={major}>{capitalize(major)}</option>;
        });
    };
    
    let currentMinorVersions = [];
    // display versions for current server when versions loaded
    if (currentMajor && currentMinor && versions[currentSoftware][currentMajor]) {
        currentMinorVersions = versions[currentSoftware][currentMajor].data.map(minor => {
            return <option value={minor} key={minor}>{capitalize(minor)}</option>;
        })
    };

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
                        <Select value={currentSoftware} onChange={e => setCurrentSoftware(e.target.value)}>
                            {servers}
                        </Select>
                    } />
                    <FormLine label="Minecraft Version" input={
                        <Select value={currentMajor} onChange={e => setCurrentMajor(e.target.value)}>
                            {currentMajorVersions}
                        </Select>
                    } />
                    <FormLine label="Software Version" input={
                        <Select value={currentMinor} onChange={e => setCurrentMinor(e.target.value)}>
                        {currentMinorVersions}
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
