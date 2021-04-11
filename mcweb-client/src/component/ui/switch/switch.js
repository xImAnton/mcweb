import styles from "./switch.module.css";


export default function Switch({onChange, defaultChecked=false}) {
    return  <label className={styles.switch}>
                <input type="checkbox" onChange={onChange} defaultChecked={defaultChecked} />
                <span className={styles.slider}></span>
            </label>;
}
