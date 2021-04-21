import NoBackend from "./sites/nobackend";
import LoadingAnimation from "./component/loading/loading";
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
import { useAlert } from 'react-alert';
import { useDesign } from "./ctx/design";


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
    setServerCreationCancellable}) {

    const design = useDesign();

    const alert = useAlert();

    const classes = [styles.gridcontainer];
    if (design.navbarShown && design.isResponsive && !design.isFullPage) {
        classes.push(styles.navopen);
    }

    function logoutAndAlert() {
        logout().then(() => 
            alert.success("Logged Out Successfully")
        );
    }

    return  <div id="app" className={design.isDarkmode ? "darkmode" : "brightmode"}>
                <div className={classes.join(" ")}>
                    <Switch history={history} >
                        <Route path="/login">
                            {/*Display LoginView when path is login*/}
                            <LoginView setSessionId={setSessionId} logout={logoutAndAlert} />
                        </Route>
                        <Route path="/">
                            <Header />
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
                                    {/*display app when no fetches are missing*/}
                                    <>{ missingFetches <= 0 && user ? (<>
                                    { design.renderSidebar && <ServerInfo
                                        servers={servers}
                                        currentServer={currentServer}
                                        changeServer={changeServer}
                                        sessionId={() => sid}
                                        setConsoleLines={setConsoleLines}
                                        publicIP={config.publicIP}
                                    />}
                                    { design.renderSidebar && <NavBar logout={logoutAndAlert} username={user.username} currentServer={currentServer} setCreationCancellable={setServerCreationCancellable} /> }
                                    { design.renderContent && <div className={styles.contentwrapper}>
                                        {currentServer && 
                                            <Switch history={history} >
                                                <Route path="/general">
                                                    <GeneralView currentServer={currentServer} />
                                                </Route>
                                                <Route path="/player">
                                                    <PlayerView currentServer={currentServer} />
                                                </Route>
                                                <Route path="/console">
                                                    <ConsoleView currentServer={currentServer} getSessionId={() => sid} />
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
                            <Footer />
                        </Route>
                    </Switch>
                </div>
            </div>
}
