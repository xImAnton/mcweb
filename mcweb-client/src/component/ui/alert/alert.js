import styles from "./alert.module.css";


export function Alert({text, color}) {
    return <>{ text && <div className={[styles.alertbox, (color ? styles[color] : styles.red)].join(" ")}>{text}</div>}</>;
}
