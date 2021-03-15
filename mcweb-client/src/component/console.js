import { useState, useRef, useEffect } from "react";
import { sendCommand } from "../services"

/**
 * Input field and button of console
 */
function ConsoleInput(props) {

    const [text, setText] = useState("");
    // keep ref to input to clear value on submit
    const inputRef = useRef(null);

    // called when send button clicked
    async function submitCommand() {
        // do nothing when no command
        if (text === "") {
            return
        }
        // send command
        await sendCommand(props.currentServer.id, text)
        // clear input field
        inputRef.current.value = "";
    }

    return <div className="console-line send">
        <input ref={inputRef} type="text" onChange={e => setText(e.target.value)} placeholder="Enter Command" />
        <button onClick={submitCommand}>Send</button>
    </div>
}

/**
 * Console Page of Webinterface
 */
function ConsoleView(props) {

    const textRef = useRef(null);

    // scroll to bottom of textarea after render
    useEffect(() => {
        textRef.current.scrollTop = textRef.current.scrollHeight;
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
