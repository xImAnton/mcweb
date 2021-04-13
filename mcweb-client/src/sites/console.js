import { useState, useRef, useEffect } from "react";
import { sendCommand, setTitle } from "../services"
import Site from "./site";
import Input from "../component/ui/input/text";
import Button from "../component/ui/button/button";
import styles from "./console.module.css";
import uistyles from "../component/ui/ui.module.css";

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
        setText("");
    }

    return <div className={styles.inputwrapper}>
        <Input className={styles.input}
            ref={inputRef}
            type="text"
            onChange={e => setText(e.target.value)}
            placeholder="Enter Command"
            onKeyPress={(e) => {if (e.key === "Enter") submitCommand()}}
        />
        <Button className={styles.sendbtn} onClick={submitCommand}>Send</Button>
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

    useEffect(() => {
        setTitle("Console");
    }, []);

    return  <Site name="Console">
                <div className={styles.wrapper}>
                    <textarea className={[uistyles.ui, styles.out].join(" ")} readOnly value={props.lines.length === 0 ? "Start your Server to see its Output" :  props.lines.map((l) => l.trim()).join("\n")} ref={textRef} />
                    <ConsoleInput currentServer={props.currentServer} getSessionId={props.getSessionId} />
                </div>
            </Site>
}

export default ConsoleView;
