import uistyles from "../ui.module.css";
import btnstyle from "./button.module.css";


export default function Button({children, onClick, style, id, disabled, className}) {
    let classes = [className, uistyles.ui, btnstyle.button];
    return <button id={id} className={classes.join(" ")} onClick={onClick} style={style} disabled={disabled}>{children}</button>
}
