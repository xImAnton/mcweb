import { useState } from "react";
import styles from "./infobox.module.css";
import Button from "../button/button";


export default function InfoBox({text, head, close}) {
    return <>{ text && <div className={styles.wrapper}>
        <div className={styles.contentwrapper}>
            <div className={styles.infobox}>
                <h1>{head}</h1>
                <div className={styles.inputform}>
                    {text}
                    <Button style={{marginTop: ".7em"}} onClick={close}>Close</Button>
                </div>
            </div>
        </div>
    </div> }</>
}


export function useInfoBox() {
    const [text, setText] = useState("");
    const [caption, setCaption] = useState("");

    function close() {
        setText("");
        setCaption("");
    }

    function set(caption, text) {
        setCaption(caption);
        setText(text);
    }

    return [{text: text, caption: caption, close: close}, set]
}
