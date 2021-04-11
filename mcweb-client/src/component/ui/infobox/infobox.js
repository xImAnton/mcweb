import { useState } from "react";
import styles from "./infobox.module.css";


export default function InfoBox({infobox}) {
    return <>{ infobox.text && <div className={styles.wrapper}>
        <div className={styles.contentwrapper}>
            <div className={styles.infobox}>
                <h1>{infobox.caption}</h1>
                <div className={styles.inputform}>
                    {infobox.text}
                    <button onClick={infobox.close}>Close</button>
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
