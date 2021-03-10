import axios from "axios";


function getSessionId() {
    return sessionStorage.getItem("MCWeb_Session");
}

export function getApiBase() {
    return window.location.protocol + "//" + window.location.host + "/api";
}

export async function sendCommand(server, command) {
    return axios.post(getApiBase() + "/server/" + server + "/command", JSON.stringify({command: command}), {
            headers: {
                "Authorization": "Token " + getSessionId()
            }
    });
}

export async function login(user, password) {
    return axios.post(getApiBase() + "/account/login/", JSON.stringify({username: user, password: password }))
}

export async function startServer(server) {
    return axios.get(getApiBase() + "/server/" + server + "/start", {
            headers: {
                "Authorization": "Token " + getSessionId()
            }
    });
}

export async function stopServer(server) {
    return axios.get(getApiBase() + "/server/" + server + "/stop", {
        headers: {
            "Authorization": "Token " + getSessionId()
        }
});
}

export async function fetchServer(server) {
    return axios.get(getApiBase() + "/server/" + server, {
        headers: {
            "Authorization": "Token " + getSessionId()
        }
    });
}

export async function getConsoleTicket() {
    return axios.get(getApiBase() + "/account/ticket/server/console", {
        headers: {
            "Authorization": "Token " + getSessionId()
        }
    });
}

export async function logoutUser() {
    return axios.get(getApiBase() + "/account/logout", {
        headers: {
            "Authorization": "Token " + getSessionId()
        }
    });
}

export async function fetchUser() {
    return axios.get(getApiBase() + "/account", {
        headers: {
            "Authorization": "Token " + getSessionId()
        }
    });
}

export async function fetchAllServers() {
    return axios.get(getApiBase() + "/server", {
        headers: {
            "Authorization": "Token " + getSessionId()
        }
    });
}

export async function fetchVersions() {
    return axios.get(getApiBase() + "/server/versions", {
        headers: {
            "Authorization": "Token " + getSessionId()
        }
    });
}

export async function putServer(name, server, version, ram) {
    return axios.put(getApiBase() + "/server/create/" + server + "/" + version, JSON.stringify({
        name: name,
        ram: ram
    }), {
        headers: {
            "Authorization": "Token " + getSessionId()
        }
    });
}
