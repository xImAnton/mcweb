import React, { useState, useRef } from "react";
import axios from "axios";


function ConsoleInput(props) {

    const [text, setText] = useState("");
    const inputRef = useRef(null);

    async function sendCommand() {
        if (text === "") {
            return
        }
        axios.post("http://localhost:3000/server/" + props.currentServer + "/command", JSON.stringify({command: text}), {
            headers: {
                "Authorization": "Token " + props.getSessionId()
            }
        });
        inputRef.current.value = "";
    }

    return <div className="console-line send">
        <input ref={inputRef} type="text" onChange={e => setText(e.target.value)} placeholder="Enter Command" />
        <button onClick={sendCommand}>Send</button>
    </div>
}

function ConsoleView(props) {

    let lines = [];
    for (let i = 0; i < props.lines.length; i++) {
        lines.push(<div className={"console-line"} key={i}>{props.lines[i]}</div>)
    }

    return <div id="page-content">
                <h1 id="page-headline">Console</h1>
                <div id="console-line-container">
                    {lines}
                    <ConsoleInput currentServer={props.currentServer} getSessionId={props.getSessionId}/>
                </div>
                
            </div>;
}

export default ConsoleView;