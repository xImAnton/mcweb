import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Header from "./component/header";
import Sidebar from "./component/sidebar";
import GeneralView from "./component/general";
import Footer from "./component/footer";
import LoginView from "./component/login"
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import PlayerView from "./component/player";
import ConsoleView from "./component/console";
import BackupsView from "./component/backups";
import SettingsView from "./component/settings";
import WorldsView from "./component/worlds";
import DSMView from "./component/dsm";
import UserView from "./component/user";
import axios from "axios";


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            darkmode: true,
            username: "",
            permissions: {},
            serverId: 1,
            servers: [],
            consoleLines: [],
        };

        this.serverSocket = null;
    }

    setSessionId(sid) {
        sessionStorage.setItem("MCWeb_Session", sid);
        this.refetch();
        this.forceUpdate();
    }

    getSessionId() {
        return sessionStorage.getItem("MCWeb_Session");
    }

    onSocketPacket(data) {
        data = JSON.parse(data.data);
        console.log(data);
        if (data.packetType === "StateChangePacket") {
            this.setState({servers: this.state.servers.map(x => {
                if (x.id === this.state.serverId) {
                    Object.assign(x, data.update.server);
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
        if (this.serverSocket) {
            this.serverSocket.close();
        }
        this.setState({consoleLines: []});
        this.serverSocket = new WebSocket("ws://localhost:1337/server/" + this.state.serverId + "/console?ticket=" + ticket);
        this.serverSocket.onmessage = (e) => this.onSocketPacket(e);
    }

    changeServer(id) {
        this.setState({serverId: id});
        axios.get("http://localhost:3000/server/" + id, {
            headers: {
                "Authorization": "Token " + this.getSessionId()
            }
        }).then(res => {
            const newservers = [];
            for (let i = 0; i < this.state.servers.length; i++) {
                if (this.state.servers[i].id !== id) {
                    newservers.push(this.state.servers[i]);
                } else {
                    newservers.push(res.data);
                }
            }
            this.setState({servers: newservers});
        });

        axios.get("http://localhost:3000/account/ticket/server/console", {
            headers: {
                "Authorization": "Token " + this.getSessionId()
            }
        }).then(res => {
            this.openWs(id, res.data.ticket);
        })
    }

    logout() {
        this.serverSocket.close();
        axios.get("http://localhost:3000/account/logout", {
            headers: {
                "Authorization": "Token " + this.getSessionId()
            }
        }).then(res => console.log("logged out"));
        sessionStorage.removeItem("MCWeb_Session");
        this.forceUpdate();
    }

    refetch() {
        if (this.getSessionId()) {
            // refetch user informations
            axios.get("http://localhost:3000/account", {
                headers: {
                    "Authorization": "Token " + this.getSessionId()
                }
            }).then(res => {
                this.setState({username: res.data.username, permissions: res.data.permissions})
            });
            // refetch servers
            axios.get("http://localhost:3000/server/", {
                headers: {
                    "Authorization": "Token " + this.getSessionId()
                }
            }).then(res => {
                this.setState({servers: res.data});
                this.changeServer(1);
            })
        }
    }

    componentDidMount() {
        this.refetch();
    }

    render() {

        const sid = this.getSessionId();

        if (!sid) {
            return <div id="app" className={this.state.darkmode ? "darkmode" : "brightmode"}>
                <LoginView setSessionId={(i) => this.setSessionId(i)}/>
            </div>
        }

        return <div id="app" className={this.state.darkmode ? "darkmode" : "brightmode"}>
            <BrowserRouter>
                <div className="content-wrapper">
                    <Header />
                    <Sidebar logout={() => this.logout()} getUserName={() => this.state.username} servers={this.state.servers} serverId={this.state.serverId} changeServer={(i) => this.changeServer(i)} sessionId={() => this.getSessionId()} setConsoleLines={(a) => this.setState({consoleLines: a})}/>
                    <div id="content-wrapper">
                        <Switch>
                            <Route path="/general">
                                <GeneralView />
                            </Route>
                            <Route path="/player">
                                <PlayerView />
                            </Route>
                            <Route path="/console">
                                <ConsoleView lines={this.state.consoleLines} currentServer={this.state.serverId} getSessionId={() => this.getSessionId()} />
                            </Route>
                            <Route path="/backups">
                                <BackupsView />
                            </Route>
                            <Route path="/settings">
                                <SettingsView />
                            </Route>
                            <Route path="/worlds">
                                <WorldsView />
                            </Route>
                            <Route path="/dsm">
                                <DSMView />
                            </Route>
                            <Route path="/user">
                                <UserView />
                            </Route>
                            <Route path="/">
                                <Redirect to="/general" />
                            </Route>
                        </Switch>
                    </div>
                    <Footer toggleDarkMode={() => this.setState({darkmode: !this.state.darkmode})}/>
                </div>
            </BrowserRouter>
        </div>
    }
}

ReactDOM.render(<App />, document.getElementById("root"));
