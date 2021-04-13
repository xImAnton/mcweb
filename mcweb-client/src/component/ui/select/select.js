import styles from "./select.module.css";
import uistyles from "../ui.module.css";


export default function Select({children, onChange, value, style}) {
    return <div className={[uistyles.ui, styles.select].join(" ")} style={style}>
                <select onChange={onChange} value={value}>
                    {children}
                </select>
                <span></span>
            </div>
}
