import uistyles from "../ui.module.css";
import btnstyle from "./button.module.css";


export default function Button({children, onClick, style, id, disabled}) {
    return <button id={id} className={[uistyles.ui, btnstyle.button].join(" ")} onClick={onClick} style={style} disabled={disabled}>{children}</button>
}
