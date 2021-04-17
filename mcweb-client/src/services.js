import axios from "axios";
import history from "./history";
import { useEffect, useState, useRef } from "react";


async function get(url) {
    return catchApiErrors(axios.get(url, {
        headers: {
            "Authorization": "Token " + getSessionId()
        }
    }));
}

async function delete_(url) {
    return catchApiErrors(axios.delete(url, {
        headers: {
            "Authorization": "Token " + getSessionId()
        }
    }));
}

async function patch(url, data) {
    return catchApiErrors(axios.patch(url, data, {
        headers: {
            "Authorization": "Token " + getSessionId()
        }
    }));
}

async function post(url, data) {
    return catchApiErrors(axios.post(url, data, {
        headers: {
            "Authorization": "Token " + getSessionId()
        }
    }));
}

async function put(url, data) {
    return catchApiErrors(axios.put(url, data, {
        headers: {
            "Authorization": "Token " + getSessionId()
        }
    }));
}

function catchApiErrors(promise) {
    return catchTimeoutError(catchUnauthorized(promise));
}

function catchTimeoutError(promise) {
    return promise.catch((e => {
        console.error("Error while fetching url " + e.config.url);
        console.error(e.response);
        if (e.response) {
            if (e.response.status === 504) { // Gateway Timeout
                if (!(history.location.pathname === "/apierror")) {
                    history.push("/apierror");
                }
            }
        }
        throw e;
    }));
}

function catchUnauthorized(promise) {
    return promise.catch((e => {
        if (e.response.status === 401) { // Unauthorized
            if (!(history.location.pathname === "/login")) {
                history.push("/login");
            }
        }
        throw e;
    }));
}

export function getSessionId() {
    return sessionStorage.getItem("MCWeb_Session");
}

export function getApiBase() {
    return window.location.protocol + "//" + window.location.host + "/api";
}

export function sendCommand(server, command) {
    return post(getApiBase() + "/server/" + server + "/command", JSON.stringify({command: command}));
}

export function login(user, password) {
    return catchTimeoutError(axios.post(getApiBase() + "/account/login/", JSON.stringify({username: user, password: password })));
}

export function startServer(server) {
    return get(getApiBase() + "/server/" + server + "/start");
}

export function stopServer(server) {
    return get(getApiBase() + "/server/" + server + "/stop");
}

export function fetchServer(server) {
    return get(getApiBase() + "/server/" + server);
}

export function getConsoleTicket(server) {
    return post(getApiBase() + "/account/ticket", {"type": "server.console", "data": {"serverId": server}});
}

export function logoutUser() {
    return get(getApiBase() + "/account/logout");
}

export async function fetchUser() {
    return await get(getApiBase() + "/account");
}

export function fetchAllServers() {
    return get(getApiBase() + "/server?idonly=1");
}

export function fetchSoftwaresAndTheirMajors() {
    return get(getApiBase() + "/server/versions");
}

export function fetchMinorVersions(software, majorVersion) {
    return get(getApiBase() + "/server/versions/" + software + "/" + majorVersion);
}

export function putServer(name, server, major, minor, ram, port, javaVersion) {
    return put(getApiBase() + "/server/create/" + server + "/" + major + "/" + minor, JSON.stringify({
        name: name,
        allocatedRAM: ram,
        port: port,
        javaVersion: javaVersion
    }));
}

export function getServer(servers, id) {
    if (!servers) return null;
    for (let i = 0; i < servers.length; i++) {
        if (servers[i].id === id) {
            return servers[i]
        }
    }
    return null;
}

export function getLogin() {
    return get(getApiBase() + "/account/login");
}

export function patchServer(server, data) {
    return patch(getApiBase() + "/server/" + server, data);
}

export function addAddon(server, addonId, addonType, addonVersion) {
    return put(getApiBase() + "/server/" + server + "/addons", {
            addonId: addonId,
            addonType: addonType,
            addonVersion: addonVersion,
        }
    );
}

export function removeAddon(server, addonId) {
    return delete_(getApiBase() + "/server/" + server + "/addons/" + addonId);
}

export function fetchConfig() {
    return get(getApiBase() + "/config");
}

export function deleteServer(id) {
    return delete_(getApiBase() + "/server/" + id);
}

export function setSessionId(sid) {
    // set session id after login, refetch
    sessionStorage.setItem("MCWeb_Session", sid);
}

export function downloadFile(url, defaultname) {
    axios({
        url: url,
        method: 'GET',
        responseType: 'blob', // important,
        headers: { "Authorization": "Token " + getSessionId() }
    }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        var filename = defaultname;
        var disposition = response.headers["content-disposition"];
        if (disposition && disposition.indexOf('attachment') !== -1) {
            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            var matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '');
            }
        }
        link.setAttribute('download', filename); //or any other extension
        document.body.appendChild(link);
        link.click();
    });
}

export function downloadAddons(server) {
    return downloadFile(getApiBase() + "/server/" + server + "/addons/download", "addons.zip");
}

export function usePrevious(state, def=undefined) {
    const ref = useRef(def);
    useEffect(() => {
        ref.current = state;
    });
    return ref.current;
}

export function useRestrictedState(defaultVal, check, errorCallback) {
    const [state, setState] = useState(defaultVal);
    const prevState = usePrevious(state, defaultVal);

    useEffect(() => {
        if (!check(state)) {
            errorCallback(state);
            setState(prevState);
        }
    }, [state]);

    return [state, setState];
}

export function capitalize(string) {
    return string.split(" ").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}

export function splitCamelCase(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function setTitle(section) {
    document.title = section + " | MCWeb Client"
}
