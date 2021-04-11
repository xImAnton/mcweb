import style from "./select.module.css";
import uistyles from "../ui.module.css";


export default function Select(props) {
    return <div className={[uistyles.ui, style.select].join(" ")}>
                <select onChange={props.onChange} value={props.value}>
                    {props.children}
                </select>
                <span></span>
            </div>
}
