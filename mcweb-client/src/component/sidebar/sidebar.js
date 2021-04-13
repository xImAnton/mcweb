import Navbar from "../navbar/navbar";
import ServerInfo from "../serverinfo/serverinfo";
import styles from "./sidebar.module.css";


function Sidebar({servers, currentServer, changeServer, sessionId, setConsoleLines, setCreationCancellable, openInfoBox, logout, username}) {
    return  <div className={styles.wrapper}>
                <aside>
                    <ServerInfo
                        servers={servers}
                        currentServer={currentServer}
                        changeServer={changeServer}
                        sessionId={sessionId}
                        setConsoleLines={setConsoleLines}
                        setCreationCancellable={setCreationCancellable}
                        openInfoBox={openInfoBox}
                    />
                    <Navbar logout={logout} username={username} currentServer={currentServer} />
                </aside>
            </div>;
}

export default Sidebar;
