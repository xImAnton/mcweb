import { useState } from "react";


export default function InfoBox({infobox}) {
    return <>{ infobox.text && <div className="infobox-wrapper">
        <div className="infobox-content-wrapper">
            <div className="infobox">
                <h1>{infobox.caption}</h1>
                <div id="input-form">
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
