import React from "react";
import { login, getLogin } from "../services";
import history from "../history";
import LoadingAnimation from "./loading";


class LoginView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            alert: "",
            alertColor: "yellow",
            loggedIn: false,
            loading: true,
            loggingIn: false,
        };
    }

    componentDidMount() {
        this.setState({loading: true, loggedIn: false});
        document.title = "MCWeb - Login";
        getLogin().then(res => {
            history.push("/general");
        }).finally(() => {
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
        if (this.state.username === "" | this.state.password === "") {
            this.setState({ alert: "Please enter your credentials!", alertColor: "yellow"})
        }
        this.setState({loggingIn: true});
        login(this.state.username, this.state.password).then(res => {
            this.props.setSessionId(res.data.data.sessionId);
            history.push("/general");
        })
        .catch(e => this.setState({ alert: "Please check your username and password!", alertColor: "red"}))
        .finally(() => {
            this.setState({loggingIn: false});
        })
    }
}

export default LoginView;