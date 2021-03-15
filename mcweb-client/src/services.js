import axios from "axios";
import history from "./history";


async function get(url) {
    return catchApiErrors(axios.get(url, {
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
        console.error("Error while fetching url " + e.response.url);
        if (e.response.status === 504) { // Gateway Timeout
            if (!(history.location.pathname === "/apierror")) {
                history.push("/apierror");
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

function getSessionId() {
    let sid = sessionStorage.getItem("MCWeb_Session");
    return sid;
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

export function fetchUser() {
    return get(getApiBase() + "/account");
}

export function fetchAllServers() {
    return get(getApiBase() + "/server");
}

export function fetchVersions() {
    return get(getApiBase() + "/server/versions");
}

export function putServer(name, server, version, ram) {
    return put(getApiBase() + "/server/create/" + server + "/" + version, JSON.stringify({
        name: name,
        ram: ram
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