import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import { fetchAllServers, fetchServer, fetchUser, getConsoleTicket, logoutUser, fetchConfig } from "./services";
import history from "./history";
import AppContainer from "./appcontainer";
import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { DesignProvider } from "./ctx/design";

import "./variables.css";


const alertOptions = {
    position: positions.BOTTOM_CENTER,
    timeout: 3000,
    offset: "0 0 2em 0",
    transition: transitions.SCALE,
}


class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user: null,
            servers: [],
            currentServer: null,
            serverCreationCancellable: true,
            missingFetches: 0, // how many fetches are missing, when greater 0, displays loading animation
            error: "The Server is not Responding",
            config: {}
        };
        this.serverSocket = null;
    }

    setSessionId(sid) {
        // set session id after login, refetch
        sessionStorage.setItem("MCWeb_Session", sid);
        this.refetch();
    }

    getSessionId() {
        return sessionStorage.getItem("MCWeb_Session");
    }

    setConsoleMessages(a) {
        this.setState({servers: this.state.servers.slice().map(x => {
            if (x.id === this.state.currentServer.id) {
                this.setState({currentServer: Object.assign(x, {consoleOut: a})});
            }
            return x;
        })});
    }

    /**
     * called when a new packet is sent via ws
     */
    onSocketPacket(data) {
        console.log(data.data);
        // parse packet
        data = JSON.parse(data.data);
        if (data.packetType === "StateChangePacket") {
            // update state of current server
            this.setState({servers: this.state.servers.slice().map(x => {
                if (x.id === this.state.currentServer.id) {
                    this.setState({currentServer: Object.assign(x, data.update.server)});
                }
                return x;
            })});
        } else
        if (data.packetType === "ConsoleMessagePacket") {
            // add message to console
            let nm = this.state.currentServer.consoleOut.slice();
            nm.push(data.data.message);
            this.setConsoleMessages(nm);
        } else
        if (data.packetType === "ServerCreationPacket") {
            this.addNewServer(data.data.server);
        } else
        if (data.packetType === "AddonUpdatePacket") {
            if (data.type === "add") {
                this.setState({servers: this.state.servers.slice().map(x => {
                    if (x.id === this.state.currentServer.id) {
                        x.addons.push(data.data);
                    }
                    return x;
                })});
            } else
            if (data.type === "remove") {
                this.setState({servers: this.state.servers.slice().map(x => {
                    if (x.id === this.state.currentServer.id) {
                        let newaddons = [];
                        // eslint-disable-next-line
                        x.addons.map(a => {
                            if (!(a.id === data.data.id && a.fileId === data.data.fileId)) {
                                newaddons.push(a)
                            }
                        });
                        x.addons = newaddons;
                    }
                    return x;
                })});
            }
        } else 
        if (data.packetType === "ServerDeletionPacket") {
            const newservers = [];
            this.state.servers.forEach((s) => {
                if (s.id !== data.data.id) {
                    newservers.push(s);
                }
            })
            this.setState({servers: newservers})
            if (this.state.currentServer.id === data.data.id) {
                if (newservers.length > 0) {
                    this.changeServer(newservers[0].id);
                } else {
                    this.setState({serverCreationCancellable: false});
                    history.push("/createserver");
                }
            }
        }
    }

    openWs(serverId, ticket) {
        if (!serverId) {
            console.error("current server not set");
            return;
        }
        // when socket open, close it
        if (this.serverSocket) {
            this.serverSocket.close();
        }
        // open ws
        this.serverSocket = new WebSocket("ws://" + window.location.host + "/api/server/" + serverId + "/console?ticket=" + ticket);
        // set handler
        this.serverSocket.onopen = (e) => this.setState((s) => {return {missingFetches: s.missingFetches - 1}});
        this.serverSocket.onmessage = (e) => this.onSocketPacket(e);
        this.serverSocket.onclose = (e) => this.onSocketClose(e);
    }

    onSocketClose(e) {
        console.log(e);
        if (e.code === 1000 | e.code === 1006) { // Closed by server
            console.error("Server closed websocket")
            history.push("/apierror");
        }
    }

    changeServer(id) {
        // set missing fetches
        this.setState((s) => { return {missingFetches: s.missingFetches + 3} });
        fetchServer(id).then(res => {
            const newservers = [];
            // update servers state with new fetched server
            for (let i = 0; i < this.state.servers.length; i++) {
                if (this.state.servers[i].id !== id) {
                    newservers.push(this.state.servers[i]);
                } else {
                    newservers.push(res.data);
                    this.setState({currentServer: res.data});
                }
            }
            // decrement missing fetches
            this.setState((s) => { return {missingFetches: s.missingFetches - 1, servers: newservers} });
        });
        // open console ws ticket
        getConsoleTicket(id).then(ticket => {
            this.setState((s) => {return {missingFetches: s.missingFetches - 1}});
            // open ws when ticket retrieved
            this.openWs(id, ticket.data.ticket);
        })
    }

    addFirstServer(s) {
        if (this.state.servers.length === 0) {
            console.log("addfirst");
            const servers = this.state.servers.slice();
            servers.push(s);
            this.setState({servers: servers});
        }
    }

    addNewServer(s) {
        const servers = this.state.servers.slice();
        servers.push(s);
        this.setState({servers: servers});
    }

    logout() {
        return new Promise(async (resolve, reject)  => {
            // close socket when open
            if (this.serverSocket !== null) {
                this.serverSocket.close();
            }
            // logout in backend
            await logoutUser();
            // clear session
            sessionStorage.removeItem("MCWeb_Session");
            // rerender
            this.forceUpdate();
            resolve();
        })
    }

    async refetch() {
        this.setState({missingFetches: 3});
        if (this.getSessionId()) {
            // refetch user informations
            let userData = (await fetchUser()).data;

            this.setState({user: userData});
            this.setState((s) => {return {missingFetches: s.missingFetches - 1}});
            let lastServerId = userData.lastServer;

            // refetch servers
            fetchAllServers().then(res => {
                // create server when none existing
                if (res.data.length === 0) {
                    this.setState({serverCreationCancellable: false});
                    history.push("/createserver");
                    return;
                }
                this.setState({servers: res.data});
                this.changeServer(lastServerId || this.state.servers[0].id);
            }).finally(() => {
                this.setState((s) => {return {missingFetches: s.missingFetches - 1}});
            });
            fetchConfig().then((res) => {
                this.setState({config: res.data});
            }).finally(() => {
                this.setState((s) => {return {missingFetches: s.missingFetches - 1}});
            });
        } else {
            // login when no session id is saved
            this.setState({missingFetches: 0})
            history.push("/login");
        }
    }

    componentDidMount() {
        this.refetch();
    }

    openInfoBox(head, body) {
        this.setState({infoBoxCaption: head, infoBox: body});
    }

    render() {
        const sid = this.getSessionId();
        return  <div id="app" className={this.state.darkmode ? "darkmode" : "brightmode"}>
                    <AppContainer
                        sid={sid} 
                        setSessionId={(i) => this.setSessionId(i)}
                        logout={() => this.logout()}
                        refetch={() => this.refetch()}
                        config={this.state.config}
                        serverCreationCancellable={this.state.serverCreationCancellable}
                        changeServer={(i) => this.changeServer(i)}
                        addFirstServer={(s) => this.addFirstServer(s)}
                        missingFetches={this.state.missingFetches}
                        user={this.state.user}
                        currentServer={this.state.currentServer}
                        servers={this.state.servers}
                        setConsoleLines={(a) => this.setConsoleMessages(a)}
                        setCreationCancellable={(b) => this.setState({serverCreationCancellable: b})}
                        setServerCreationCancellable={(v) => this.setState({serverCreationCancellable: v})}
                        />
                </div>
    }
}

ReactDOM.render(
    <Router history={history}>
        <AlertProvider template={AlertTemplate} {...alertOptions}>
            <DesignProvider>
                <App />
            </DesignProvider>
        </AlertProvider>
    </Router>,
document.getElementById("root"));
