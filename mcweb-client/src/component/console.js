import React, { useState, useRef } from "react";
import { sendCommand } from "../services"


function ConsoleInput(props) {

    const [text, setText] = useState("");
    const inputRef = useRef(null);

    async function submitCommand() {
        if (text === "") {
            return
        }
        await sendCommand(props.currentServer, text)
        inputRef.current.value = "";
    }

    return <div className="console-line send">
        <input ref={inputRef} type="text" onChange={e => setText(e.target.value)} placeholder="Enter Command" />
        <button onClick={submitCommand}>Send</button>
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