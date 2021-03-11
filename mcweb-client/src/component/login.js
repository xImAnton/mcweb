import React from "react";
import { login } from "../services";


class LoginView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            alert: "",
            alertColor: "yellow",
        };
    }

    componentDidMount() {
        document.title = "MCWeb - Login";
    }

    render() {
        return <div id="login-wrapper">
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
        </div>
    }

    async loginUser() {
        if (this.state.username === "" | this.state.password === "") {
            this.setState({ alert: "Please enter your credentials!", alertColor: "yellow"})
            return
        }
        login(this.state.username, this.state.password).then(res => {
            this.props.setSessionId(res.data.data.sessionId);
        }).catch(e => this.setState({ alert: "Please check your username and password!", alertColor: "red"}));
    }
}

export default LoginView;