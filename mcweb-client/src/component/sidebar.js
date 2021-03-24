import Navbar from "./navbar";
import ServerInfo from "./serverinfo";


function Sidebar({servers, currentServer, changeServer, sessionId, setConsoleLines, setCreationCancellable, openInfoBox, logout, username}) {
    return  <div id="sidebar-wrapper">
                <aside>
                    <div id="sidebar-content">
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
                </aside>
            </div>;
}

export default Sidebar;
