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
        <Button className={styles.sendbtn} onClick={submitCommand} noMargin>Send</Button>
    </div>
}

function ConsoleOutput({lines}) {

    const textRef = useRef(null);

    // scroll to bottom of textarea after render
    useEffect(() => {
        textRef.current.scrollTop = textRef.current.scrollHeight;
    }, [lines]);

    return <textarea className={[uistyles.ui, styles.out].join(" ")} readOnly value={lines.length === 0 ? "Start your Server to see its Output" : lines.map((l) => l.trim()).join("\n")} ref={textRef} />

}

/**
 * Console Page of Webinterface
 */
function ConsoleView(props) {

    useEffect(() => {
        setTitle("Console");
    }, []);

    return  <Site name="Console">
                <div className={styles.wrapper}>
                    <ConsoleOutput lines={props.lines} />
                    <ConsoleInput currentServer={props.currentServer} getSessionId={props.getSessionId} />
                </div>
            </Site>
}

export default ConsoleView;
