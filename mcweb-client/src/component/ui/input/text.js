import styles from "./text.module.css";
import uistyles from "../ui.module.css";
import React from "react";


export default React.forwardRef(({onChange, defaultValue, value, placeholder, type="text", style, onKeyDown, min, max, onKeyPress}, ref) => {
    return  <input className={[uistyles.ui, styles.text].join(" ")} ref={ref} onKeyDown={onKeyDown} onKeyPress={onKeyPress} style={style} type={type} onChange={onChange} defaultValue={defaultValue} value={value} placeholder={placeholder} min={min} max={max} ></input>
})
