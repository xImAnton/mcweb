import Clipboard from "react-clipboard.js";
import styles from "./copy.module.css";
import uistyles from "../ui.module.css";

/**
 * Displays a value and gives the oppotunity to copy it
 */
export default function CopyField({text, style, onCopy}) {
    return <div className={[uistyles.ui, styles.copyfield].join(" ")} style={style}>
        <div className={styles.text}>{text}</div>
        <Clipboard data-clipboard-text={text} onSuccess={onCopy} button-title="Copy IP" className={styles.button}>
            📋
        </Clipboard>
    </div>;
}
