import Navbar from "../navbar/navbar";
import ServerInfo from "../serverinfo/serverinfo";
import styles from "./sidebar.module.css";


function Sidebar({servers, currentServer, changeServer, sessionId, setConsoleLines, setCreationCancellable, openInfoBox, logout, username}) {
    return  <div className={styles.wrapper}>
                <aside>
                    <div className={styles.content}>
                        <div className={styles.container}>
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
                        </div>
                    </div>
                </aside>
            </div>;
}

export default Sidebar;
