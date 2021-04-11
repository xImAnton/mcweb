import Clipboard from "react-clipboard.js";
import style from "./copy.module.css";
import uistyles from "../ui.module.css";

/**
 * Displays a value and gives the oppotunity to copy it
 */
export default function CopyField(props) {
    return <div className={[uistyles.ui, style.copyfield].join(" ")}>{props.text}
        <Clipboard data-clipboard-text={props.text}>
            📋
        </Clipboard>
    </div>;
}
