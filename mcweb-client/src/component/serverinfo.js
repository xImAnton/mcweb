import React from "react";


class ServerInfo extends React.Component {
    render() {
        return <div id="server-information">Name: Testserver
                    <div className="copy-field" copy-text="127.0.0.1">127.0.0.1 <button>📋</button></div>
                    Status: <div id="online-status" className="offline"></div>
                    <button id="control-server">Start</button>
                    Select Server: <select>
                        <option>Server 1</option>
                        <option>Server 2</option>
                    </select>
                </div>;
    }
}

export default ServerInfo;