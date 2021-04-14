import uistyles from "../ui.module.css";
import btnstyle from "./button.module.css";


export default function Button({children, onClick, style, id, disabled, className, noMargin, title}) {
    let classes = [className, uistyles.ui, btnstyle.button];
    if (noMargin) {
        classes.push(btnstyle.nomargin);
    }
    return <button title={title} id={id} className={classes.join(" ")} onClick={onClick} style={style} disabled={disabled}>{children}</button>
}
