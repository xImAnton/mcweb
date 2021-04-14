import NoBackend from "./sites/nobackend";
import LoadingAnimation from "./component/loading/loading";
import InfoBox from "./component/ui/infobox/infobox";
import ModView from "./sites/mods";
import ServerInfo from "./component/serverinfo/serverinfo";
import NavBar from "./component/navbar/navbar";
import PlayerView from "./sites/player";
import ConsoleView from "./sites/console";
import BackupsView from "./sites/backups";
import SettingsView from "./sites/settings";
import WorldsView from "./sites/worlds";
import DSMView from "./sites/dynamicserver";
import UserView from "./sites/user";
import { Route, Switch, Redirect } from "react-router-dom";
import CreateServerView from "./sites/servercreation";
import Header from "./component/header/header";
import GeneralView from "./sites/general";
import Footer from "./component/footer/footer";
import LoginView from "./sites/login";
import history from "./history";
import styles from "./index.module.css";
import { useMediaQuery } from "react-responsive";
import { useState } from "react";


function xor(a, b) {
    return (a && !b) || (!a && b)
}


export default function AppContainer({
    sid,
    setSessionId,
    logout,
    refetch,
    config,
    serverCreationCancellable,
    changeServer,
    addFirstServer,
    missingFetches,
    user,
    currentServer,
    servers,
    setConsoleLines,
    openInfoBox,
    closeInfoBox,
    infoCaption,
    infoText,
    consoleLines,
    setDarkMode,
    darkmode,
    setServerCreationCancellable}) {
    
    const responsive = useMediaQuery({query: "(max-width: 700px)"});

    const [navbarOpened, openNavbar] = useState(false);

    const renderContent = !(responsive && navbarOpened);
    const renderSidebar = !(responsive && !navbarOpened);

    const classes = [styles.gridcontainer];
    if (navbarOpened && responsive) {
        classes.push(styles.navopen);
    }

    return  <div className={classes.join(" ")}>
                <Switch history={history} >
                        <Route path="/login">
                            {/*Display LoginView when path is login*/}
                            <LoginView setSessionId={setSessionId} logout={logout} />
                        </Route>
                        <Route path="/">
                            <Header responsive={responsive} toggleNavbar={() => openNavbar(!navbarOpened)}/>
                            <Switch history={history} >
                                <Route path="/apierror">
                                    {/*display backend error*/}
                                    <NoBackend refetch={refetch} />
                                </Route>
                                {/*redirect to login when no session id present, down here bc apierror has higher priority*/}
                                {!sid && <Redirect to="/login" />}
                                <Route path="/createserver">
                                    <div className={[styles.contentwrapper, styles.full].join(" ")}>
                                        <CreateServerView 
                                            cancellable={serverCreationCancellable}
                                            changeServer={changeServer}
                                            addFirstServer={addFirstServer}
                                            maxRam={config.maxRam}
                                            javaVersions={config.javaVersions}
                                        />
                                    </div>
                                </Route>
                                <Route path="/">
                                    <InfoBox close={closeInfoBox} text={infoText} head={infoCaption} />
                                    {/*display app when no fetches are missing*/}
                                    <>{ missingFetches <= 0 && user ? (<>
                                    { renderSidebar && <ServerInfo
                                        servers={servers}
                                        currentServer={currentServer}
                                        changeServer={changeServer}
                                        sessionId={() => sid}
                                        setConsoleLines={setConsoleLines}
                                        setCreationCancellable={setServerCreationCancellable}
                                        openInfoBox={openInfoBox}
                                        publicIP={config.publicIP}
                                        closeNavbar={() => openNavbar(false)}
                                        responsive={responsive}
                                    />}
                                    { renderSidebar && <NavBar logout={logout} username={user.username} currentServer={currentServer} responsive={responsive} closeNavbar={() => openNavbar(false)}/> }
                                    { renderContent && <div className={styles.contentwrapper}>
                                        {currentServer && 
                                            <Switch history={history} >
                                                <Route path="/general">
                                                    <GeneralView currentServer={currentServer} />
                                                </Route>
                                                <Route path="/player">
                                                    <PlayerView currentServer={currentServer} />
                                                </Route>
                                                <Route path="/console">
                                                    <ConsoleView lines={consoleLines} currentServer={currentServer} getSessionId={() => sid} />
                                                </Route>
                                                <Route path="/backups">
                                                    <BackupsView currentServer={currentServer} />
                                                </Route>
                                                <Route path="/settings">
                                                    <SettingsView currentServer={currentServer} javaVersions={config.javaVersions} maxRam={config.maxRam} />
                                                </Route>
                                                { currentServer.supports.mods &&
                                                    <Route path="/mods">
                                                        <ModView currentServer={currentServer} />
                                                    </Route>
                                                }
                                                <Route path="/worlds">
                                                    <WorldsView currentServer={currentServer} />
                                                </Route>
                                                <Route path="/dsm">
                                                    <DSMView currentServer={currentServer} />
                                                </Route>
                                                <Route path="/user">
                                                    <UserView currentServer={currentServer} />
                                                </Route>
                                                <Route path="/">
                                                    <Redirect to="/general" />
                                                </Route>
                                            </Switch>
                                        }
                                    {/*display LoadingAnimation when fetches are missing*/}
                                    </div>}</>) : (<LoadingAnimation loadingText="Loading Server Information" />)}</>
                                </Route>
                            </Switch>
                            <Footer toggleDarkMode={() => {
                                let dm = !darkmode;
                                setDarkMode(dm);
                                localStorage.setItem("MCWeb_Darkmode", dm);
                            }} darkmode={darkmode} />
                        </Route>
                    </Switch>
                </div>
}
