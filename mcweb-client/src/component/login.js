import { useState, useRef, useEffect } from "react";
import { login, getLogin } from "../services";
import LoadingAnimation from "./loading";
import { Alert } from "./ui";
import { Redirect } from "react-router-dom";


function LoginView({setSessionId}) {

    const [currentUsername, setCurrentUsername] = useState(""); // current entered username
    const [currentPassword, setCurrentPassword] = useState(""); // current entered password
    const [alert, setAlert] = useState(""); // displayed alert, not displayed when empty
    const [loading, setLoading] = useState(true); // whether the app is trying to connect to backend, display loading animation
    const [loggingIn, setLoggingIn] = useState(false); // whether the app is currently trying to log in, displays logging in animation
    const [loggedIn, setLoggedIn] = useState(false);

    const ummounted = useRef(false);

    useEffect(() => {
        setLoading(true);
        // check if current session is valid
        getLogin().then(res => {
            // is yes, redirect to app
            setLoggedIn(true);
        }).finally(() => {
            // if no, show login prompt
            if (!ummounted.current) {
                setLoading(false);
            }
        });
        return () => { ummounted.current = true }
    }, []);

    function loginUser() {
        // check if username or password are empty
        if (!currentUsername | !currentPassword) {
            setAlert("Please enter your credentials!");
        }
        // display logging in animation
        setLoggingIn(true);
        // try to log in
        login(currentUsername, currentPassword).then(res => {
            // if success, set session id and redirect to app
            setSessionId(res.data.data.sessionId);
            setLoggedIn(true);
        })
        // if not, display alert
        .catch(e => setAlert("Please check your username and password!"))
        .finally(() => {
            // cancel animation
            setLoggingIn(false);
        })
    }

    if (loggedIn) {
        return <Redirect to="/general" />
    }

    return <>{ !(loading || loggingIn) ? (<div id="login-wrapper">
        <div id="login-field">
            <img src={process.env.PUBLIC_URL + "logo_wide_bright.png"} alt="MCWeb Logo" />
            <h1>Login</h1>
            <Alert text={alert} />
            <div id="input-form">
                <input type={"text"} placeholder={"Username"} onChange={e => setCurrentUsername(e.target.value)} />
                <input type={"password"} placeholder={"Password"} onChange={e => setCurrentPassword(e.target.value)} />
                <button onClick={loginUser}>Login</button>
                <div id="cookie-alert">This website uses cookies for managing your login session. By logging in you agree to that.</div>
            </div>
        </div>
    </div>) : (<LoadingAnimation loadingText={loading ? "Connecting..." : "Loggin in"}/>)}</>
}

export default LoginView;