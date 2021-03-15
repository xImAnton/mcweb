import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Header from "./component/header";
import Sidebar from "./component/sidebar";
import GeneralView from "./component/general";
import Footer from "./component/footer";
import LoginView from "./component/login"
import { Route, Switch, Redirect, Router } from "react-router-dom";
import PlayerView from "./component/player";
import ConsoleView from "./component/console";
import BackupsView from "./component/backups";
import SettingsView from "./component/settings";
import WorldsView from "./component/worlds";
import DSMView from "./component/dsm";
import UserView from "./component/user";
import { fetchAllServers, fetchServer, fetchUser, getConsoleTicket, logoutUser } from "./services";
import CreateServerView from "./component/createserver";
import history from "./history"
import NoBackend from "./component/nobackend";
import LoadingAnimation from "./component/loading";


class App extends React.Component {

    constructor(props) {
        super(props);

        let darkmode = (localStorage.getItem("MCWeb_Darkmode") === "true");

        this.state = {
            darkmode: darkmode,
            username: "",
            permissions: {},
            servers: [],
            consoleLines: [],
            currentServer: null,
            serverCreationCancellable: true,
            missingFetches: 0
        };

        this.serverSocket = null;
    }

    setSessionId(sid) {
        sessionStorage.setItem("MCWeb_Session", sid);
        this.setState({missingFetches: 2});
        this.refetch();
        this.forceUpdate();
    }

    getSessionId() {
        return sessionStorage.getItem("MCWeb_Session");
    }

    onSocketPacket(data) {
        console.log(data.data);
        data = JSON.parse(data.data);
        if (data.packetType === "StateChangePacket") {
            this.setState({servers: this.state.servers.slice().map(x => {
                if (x.id === this.state.currentServer.id) {
                    Object.assign(x, data.update.server);
                    this.setState({currentServer: Object.assign(x, data.update.server)});
                }
                return x;
            })});
        }
        if (data.packetType === "ServerConsoleMessagePacket") {
            const consoleMessages = this.state.consoleLines.slice();
            consoleMessages.push(data.data.message);
            this.setState({consoleLines: consoleMessages});
        }
        if (data.packetType === "BulkConsoleMessagePacket") {
            if (data.data.reset) {
                this.setState({consoleLines: data.data.lines});
            } else {
                let consoleMessages = this.state.consoleLines.slice();
                consoleMessages = consoleMessages.concat(data.data.lines);
                this.setState({consoleLines: consoleMessages});
            }
        }
    }

    openWs(serverId, ticket) {
        if (!serverId) {
            console.error("current server not set");
            return;
        }
        if (this.serverSocket) {
            this.ignoreSocketClose = true;
            this.serverSocket.close();
        }
        this.setState({consoleLines: []});
        this.serverSocket = new WebSocket("ws://" + window.location.host + "/api/server/" + serverId + "/console?ticket=" + ticket);
        this.serverSocket.onopen = (e) => this.setState((s) => {return {missingFetches: s.missingFetches - 1}});
        this.serverSocket.onmessage = (e) => this.onSocketPacket(e);
        this.serverSocket.onclose = (e) => this.onSocketClose(e);
    }

    onSocketClose(e) {
        if (e.code === 1000) { // Closed by server
            console.error("Server closed websocket")
            history.push("/apierror");
        }
    }

    changeServer(id) {
        this.setState((s) => { return {missingFetches: s.missingFetches + 3} });
        fetchServer(id).then(res => {
            const newservers = [];
            for (let i = 0; i < this.state.servers.length; i++) {
                if (this.state.servers[i].id !== id) {
                    newservers.push(this.state.servers[i]);
                } else {
                    newservers.push(res.data);
                    this.setState({currentServer: res.data});
                }
            }
            this.setState((s) => { return {missingFetches: s.missingFetches - 1, servers: newservers} });
        });

        getConsoleTicket(id).then(ticket => {
            this.setState((s) => {return {missingFetches: s.missingFetches - 1}});
            this.openWs(id, ticket.data.ticket);
        })
    }

    logout() {
        if (this.serverSocket !== null) {
            this.serverSocket.close();
        }
        logoutUser();
        sessionStorage.removeItem("MCWeb_Session");
        this.forceUpdate();
    }

    refetch() {
        if (this.getSessionId()) {
            // refetch user informations
            fetchUser().then(res => {
                this.setState({username: res.data.username, permissions: res.data.permissions})
                this.setState((s) => {return {missingFetches: s.missingFetches - 1}});
            });
            // refetch servers
            fetchAllServers().then(res => {
                if (res.data.length === 0) {
                    this.setState({serverCreationCancellable: false});
                    history.push("/createserver");
                    return;
                }
                this.setState({servers: res.data});
                this.changeServer(this.state.servers[0].id);
            }).finally(() => {
                this.setState((s) => {return {missingFetches: s.missingFetches - 1}});
            })
        } else {
            this.setState({missingFetches: 0})
            history.push("/login");
        }
    }

    componentDidMount() {
        this.setState({missingFetches: 2});
        this.refetch();
    }

    render() {
        const sid = this.getSessionId();

        return <div id="app" className={this.state.darkmode ? "darkmode" : "brightmode"}>
            <Switch history={history} >
                <Route path="/login">
                    <LoginView setSessionId={(i) => this.setSessionId(i)} logout={() => this.logout()} />
                </Route>
                <Route path="/">
                    <div className="content-wrapper">
                        <Header />
                            <Switch history={history} >
                                <Route path="/apierror">
                                    <NoBackend refetch={() => this.refetch()} />
                                </Route>
                                {!sid && <Redirect to="/login" />}
                                <Route path="/createserver">
                                    <div id="content-wrapper" className="full">
                                        <CreateServerView addServer={(s) => {
                                            const servers = this.state.servers.slice();
                                            servers.push(s);
                                            this.setState((s) => {return {servers: servers, missingFetches: s.missingFetches}});
                                        }} cancellable={this.state.serverCreationCancellable}
                                        changeServer={(i) => this.changeServer(i)}
                                        />
                                    </div>
                                </Route>
                                <Route path="/">
                                    <>{ this.state.missingFetches <= 0 ? (<>
                                    <Sidebar logout={() => this.logout()} getUserName={() => this.state.username} servers={this.state.servers} currentServer={this.state.currentServer} changeServer={(i) => this.changeServer(i)} sessionId={() => this.getSessionId()} setConsoleLines={(a) => this.setState({consoleLines: a})} setCreationCancellable={(b) => this.setState({serverCreationCancellable: b})} />
                                    <div id="content-wrapper">
                                        <Switch history={history} >
                                            <Route path="/general">
                                                <GeneralView currentServer={this.state.currentServer} />
                                            </Route>
                                            <Route path="/player">
                                                <PlayerView currentServer={this.state.currentServer} />
                                            </Route>
                                            <Route path="/console">
                                                <ConsoleView lines={this.state.consoleLines} currentServer={this.state.currentServer} getSessionId={() => this.getSessionId()} />
                                            </Route>
                                            <Route path="/backups">
                                                <BackupsView currentServer={this.state.currentServer} />
                                            </Route>
                                            <Route path="/settings">
                                                <SettingsView currentServer={this.state.currentServer} />
                                            </Route>
                                            <Route path="/worlds">
                                                <WorldsView currentServer={this.state.currentServer} />
                                            </Route>
                                            <Route path="/dsm">
                                                <DSMView currentServer={this.state.currentServer} />
                                            </Route>
                                            <Route path="/user">
                                                <UserView currentServer={this.state.currentServer} />
                                            </Route>
                                            <Route path="/">
                                                <Redirect to="/general" />
                                            </Route>
                                        </Switch>
                                    </div></>) : (<LoadingAnimation loadingText="Loading Server Information" />)}</>
                                </Route>
                            </Switch>
                        <Footer toggleDarkMode={() => {
                            let darkmode = !this.state.darkmode;
                            this.setState({darkmode: darkmode});
                            localStorage.setItem("MCWeb_Darkmode", darkmode);
                        }} darkmode={this.state.darkmode} />
                    </div>
                </Route>
            </Switch>
        </div>
    }
}

ReactDOM.render(
    <Router history={history}>
        <App />
    </Router>,
document.getElementById("root"));
