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
import InfoBox from "./component/infobox";
import ModView from "./component/mods";


class App extends React.Component {

    constructor(props) {
        super(props);

        let darkmode = (localStorage.getItem("MCWeb_Darkmode") === "true"); // set darkmode to setting, when defined in localStorage

        this.state = {
            darkmode: darkmode, // whether the app is display in darkmode
            username: "", // name of logged in user
            permissions: {}, // permissions of logged in user
            servers: [],
            consoleLines: [],
            currentServer: null,
            serverCreationCancellable: true,
            missingFetches: 0, // how many fetches are missing, when greater 0, displays loading animation
            infoBox: "",
            infoBoxCaption: ""
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
                    Object.assign(x, data.update.server);
                    this.setState({currentServer: Object.assign(x, data.update.server)});
                }
                return x;
            })});
        } else
        if (data.packetType === "ServerConsoleMessagePacket") {
            // add message to console
            const consoleMessages = this.state.consoleLines.slice();
            consoleMessages.push(data.data.message);
            this.setState({consoleLines: consoleMessages});
        } else
        if (data.packetType === "BulkConsoleMessagePacket") {
            // add several messages to console
            if (data.data.reset) {
                this.setState({consoleLines: data.data.lines});
            } else {
                let consoleMessages = this.state.consoleLines.slice();
                consoleMessages = consoleMessages.concat(data.data.lines);
                this.setState({consoleLines: consoleMessages});
            }
        } else
        if (data.packetType === "ServerCreationPacket") {
            this.addNewServer(data.data.server);
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
        // clear console lines --> new server
        this.setState({consoleLines: []});
        // open ws
        this.serverSocket = new WebSocket("ws://" + window.location.host + "/api/server/" + serverId + "/console?ticket=" + ticket);
        // set handler
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
        // close socket when open
        if (this.serverSocket !== null) {
            this.serverSocket.close();
        }
        // logout in backend
        logoutUser();
        // clear session
        sessionStorage.removeItem("MCWeb_Session");
        // rerender
        this.forceUpdate();
    }

    refetch() {
        this.setState({missingFetches: 2});
        if (this.getSessionId()) {
            // refetch user informations
            fetchUser().then(res => {
                this.setState({username: res.data.username, permissions: res.data.permissions})
                this.setState((s) => {return {missingFetches: s.missingFetches - 1}});
            });
            // refetch servers
            fetchAllServers().then(res => {
                // create server when none existing
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

        return <div id="app" className={this.state.darkmode ? "darkmode" : "brightmode"}>
            <Switch history={history} >
                <Route path="/login">
                    {/*Display LoginView when path is login*/}
                    <LoginView setSessionId={(i) => this.setSessionId(i)} logout={() => this.logout()} />
                </Route>
                <Route path="/">
                    <div className="content-wrapper">
                        <Header />
                            <Switch history={history} >
                                <Route path="/apierror">
                                    {/*display backend error*/}
                                    <NoBackend refetch={() => this.refetch()} />
                                </Route>
                                {/*redirect to login when no session id present, down here bc. apierror has higher priority*/}
                                {!sid && <Redirect to="/login" />}
                                <Route path="/createserver">
                                    <div id="content-wrapper" className="full">
                                        <CreateServerView cancellable={this.state.serverCreationCancellable}
                                        changeServer={(i) => this.changeServer(i)} addFirstServer={(s) => this.addFirstServer(s)}
                                        />
                                    </div>
                                </Route>
                                <Route path="/">
                                    {/*display app when no fetches are missing*/}
                                    <>{ this.state.missingFetches <= 0 ? (<>
                                    <Sidebar
                                        logout={() => this.logout()}
                                        getUserName={() => this.state.username}
                                        servers={this.state.servers}
                                        currentServer={this.state.currentServer}
                                        changeServer={(i) => this.changeServer(i)}
                                        sessionId={() => this.getSessionId()}
                                        setConsoleLines={(a) => this.setState({consoleLines: a})}
                                        setCreationCancellable={(b) => this.setState({serverCreationCancellable: b})}
                                        openInfoBox={(h, b) => this.openInfoBox(h, b)}
                                    />
                                    <div id="content-wrapper">
                                        { this.state.infoBoxCaption && <InfoBox close={(e) => this.setState({infoBox: "", infoBoxCaption: ""})} text={this.state.infoBox} head={this.state.infoBoxCaption} /> }
                                        {this.state.currentServer && 
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
                                                    <SettingsView currentServer={this.state.currentServer} changeServer={(id) => this.changeServer(id)} />
                                                </Route>
                                                { this.state.currentServer.supports.mods &&
                                                    <Route path="/mods">
                                                        <ModView currentServer={this.state.currentServer} />
                                                    </Route>
                                                }
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
                                        }
                                    {/*display LoadingAnimation when fetches are missing*/}
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

// 12: Texture Packs, 4471: Modpacks, 6: Mods, 17: Worlds

/*
ReactDOM.render(
    <AddonSelector sectionId={6} />,
document.getElementById("root"));
*/
