import { useState, useRef, useEffect } from "react";
import { sendCommand, setTitle } from "../services"
import Site from "./site";
import Input from "../component/ui/input/text";
import Button from "../component/ui/button/button";
import styles from "./console.module.css";
import uistyles from "../component/ui/ui.module.css";
import { useAlert } from "react-alert";


/**
 * Input field and button of console
 */
function ConsoleInput({currentServer, toggleAutoscroll, autoscroll}) {

    const [text, setText] = useState("");
    // keep ref to input to clear value on submit
    const inputRef = useRef(null);
    const alert = useAlert();

    // called when send button clicked
    async function submitCommand() {
        // do nothing when no command
        if (text === "") {
            return
        }
        // send command
        await sendCommand(currentServer.id, text).catch((e) => {
            if (e.response.status === 423) {
                alert.info("Server is Offline");
            }
        })
        // clear input field
        inputRef.current.value = "";
        setText("");
    }

    return <div className={styles.inputwrapper}>
        <Button className={styles.sendbtn} onClick={toggleAutoscroll} noMargin title={(autoscroll ? "Disable" : "Enable") + " Autoscroll"} >{autoscroll ? "▼" : "▲"}</Button>
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

function ConsoleOutput({lines, autoscroll}) {

    const textRef = useRef(null);

    function updateScroll() {
        if (autoscroll) {
            textRef.current.scrollTop = textRef.current.scrollHeight;
        }
    }

    // scroll to bottom of textarea after render
    useEffect(() => {
        updateScroll();
    }, [lines, autoscroll]);

    return <textarea className={[uistyles.ui, styles.out].join(" ")} readOnly value={lines.length === 0 ? "Start your Server to see its Output" : lines.map((l) => l.trim()).join("\n")} ref={textRef} />

}

/**
 * Console Page of Webinterface
 */
function ConsoleView({lines, currentServer, getSessionId}) {

    const [autoscroll, setAutoscroll] = useState(true);

    const alert = useAlert();

    useEffect(() => {
        setTitle("Console");
    }, []);

    return  <Site name="Console">
                <div className={styles.wrapper}>
                    <ConsoleOutput lines={lines} autoscroll={autoscroll} />
                    <ConsoleInput currentServer={currentServer} getSessionId={getSessionId} toggleAutoscroll={() => setAutoscroll(!autoscroll)} autoscroll={autoscroll} />
                </div>
            </Site>
}

export default ConsoleView;
