import React, { useState, useRef, useEffect } from "react";
import { sendCommand } from "../services"


function ConsoleInput(props) {

    const [text, setText] = useState("");
    const inputRef = useRef(null);

    async function submitCommand() {
        if (text === "") {
            return
        }
        await sendCommand(props.currentServer.id, text)
        inputRef.current.value = "";
    }

    return <div className="console-line send">
        <input ref={inputRef} type="text" onChange={e => setText(e.target.value)} placeholder="Enter Command" />
        <button onClick={submitCommand}>Send</button>
    </div>
}

function ConsoleView(props) {

    const textRef = useRef(null);

    // scroll to bottom after render
    useEffect(() => {
        textRef.current.scrollTop = textRef.current.scrollHeight;
        if (props.currentServer) 
        document.title = props.currentServer.name + " - Console";
    })

    return <div id="page-content">
                <h1 id="page-headline">Console</h1>
                <div id="console-wrapper">
                    <textarea id="console-out" readOnly value={props.lines.map((l) => l.trim()).join("\n")} ref={textRef} />
                    <ConsoleInput currentServer={props.currentServer} getSessionId={props.getSessionId} />
                </div>
            </div>;
}

export default ConsoleView;
