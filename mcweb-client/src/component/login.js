import React from "react";
import { login, getLogin } from "../services";
import history from "../history";
import LoadingAnimation from "./loading";


class LoginView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "", // current entered username
            password: "", // current entered password
            alert: "", // displayed alert, not displayed when empty
            alertColor: "yellow", // color of alert
            loggedIn: false, // whether user is logged in or not
            loading: true, // whether the app is trying to connect to backend, display loading animation
            loggingIn: false, // whether the app is currently trying to log in, displays logging in animation
        };
    }

    componentDidMount() {
        this.setState({loading: true, loggedIn: false});
        // check if current session is valid
        getLogin().then(res => {
            // is yes, redirect to app
            history.push("/general");
        }).finally(() => {
            // if no, show login prompt
            this.setState({loading: false});
        });
    }

    render() {
        return <>{ !(this.state.loading || this.state.loggingIn) ? (<div id="login-wrapper">
            <div id="login-field">
                <h1>Login</h1>
                { this.state.alert && <div className={"alert-box " + this.state.alertColor}>{this.state.alert}</div> }
                <div id="input-form">
                    <input type={"text"} placeholder={"Username"} onChange={e => this.setState({username: e.target.value})} />
                    <input type={"password"} placeholder={"Password"} onChange={e => this.setState({password: e.target.value})} />
                    <button onClick={() => this.loginUser()}>Login</button>
                    <div id="cookie-alert">This website uses cookies for managing your login session. By logging in you agree to that.</div>
                </div>
            </div>
        </div>) : (<LoadingAnimation loadingText={this.state.loading ? "Connecting..." : "Loggin in"}/>)}</>
    }

    async loginUser() {
        // check if username or password are empty
        if (this.state.username === "" | this.state.password === "") {
            this.setState({ alert: "Please enter your credentials!", alertColor: "yellow"})
        }
        // display logging in animation
        this.setState({loggingIn: true});
        // try to log in
        login(this.state.username, this.state.password).then(res => {
            // if success, set session id and redirect to app
            this.props.setSessionId(res.data.data.sessionId);
            history.push("/general");
        })
        // if not, display alert
        .catch(e => this.setState({ alert: "Please check your username and password!", alertColor: "red"}))
        .finally(() => {
            // cancel animation
            this.setState({loggingIn: false});
        })
    }
}

export default LoginView;