import { useState, useRef, useEffect } from "react";
import { login, getLogin, setTitle } from "../services";
import LoadingAnimation from "../component/loading/loading";
import { Redirect } from "react-router-dom";
import styles from "./login.module.css";
import { useAlert } from "react-alert";


function LoginView({setSessionId}) {

    const [currentUsername, setCurrentUsername] = useState(""); // current entered username
    const [currentPassword, setCurrentPassword] = useState(""); // current entered password
    const [loading, setLoading] = useState(true); // whether the app is trying to connect to backend, display loading animation
    const [loggingIn, setLoggingIn] = useState(false); // whether the app is currently trying to log in, displays logging in animation
    const [loggedIn, setLoggedIn] = useState(false);

    const alert = useAlert();

    const ummounted = useRef(false);

    useEffect(() => {
        setTitle("Login")
        setLoading(true);
        // check if current session is valid
        getLogin().then(res => {
            // is yes, redirect to app
            setLoggedIn(true);
        }).catch((e) => {
            if (!e.response) {
                alert.error("Couldn't reach MCWeb!");
            }
        })
        .finally(() => {
            // if no, show login prompt
            if (!ummounted.current) {
                setLoading(false);
            }
        });
        return () => { ummounted.current = true }
    }, []);

    function loginUser() {
        // check if username or password are empty
        if (!currentUsername) {
            alert.info("Please enter your username!")
            return;
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
        .catch(e => {
            if (e.toJSON().message === "Network Error") {
                alert.error("Couldn't reach MCWeb!");
            } else if
            (e.response.status === 401) {
                alert.error("Please check your credentials!");
            } else {
                alert.error("An unknown error occured")
            }
        })
        .finally(() => {
            // cancel animation
            setLoggingIn(false);
        })
    }

    if (loggedIn) {
        return <Redirect to="/general" />
    }

    return <>{ !(loading || loggingIn) ? (<div className={styles.wrapper}>
        <div className={styles.field}>
            <img src={process.env.PUBLIC_URL + "logo_wide_bright.png"} alt="MCWeb Logo" />
            <h1>Login</h1>
            <div className={styles.form}>
                <input type={"text"} placeholder={"Username"} onChange={e => setCurrentUsername(e.target.value)} />
                <input type={"password"} placeholder={"Password"} onChange={e => setCurrentPassword(e.target.value)} />
                <button onClick={loginUser}>Login</button>
                <div className={styles.cookiealert}>This website uses cookies for managing your login session. By logging in you agree to that.</div>
            </div>
        </div>
    </div>) : (<LoadingAnimation loadingText={loading ? "Connecting..." : "Logging in"}/>)}</>
}

export default LoginView;
