import styles from "./footer.module.css";
import Switch from "../ui/switch/switch";


function Footer({toggleDarkMode, darkmode}) {
    return  <div id="footer-wrapper" className={styles.wrapper}>
                <footer>
                    <div id="footer">
                        <Switch onChange={toggleDarkMode} defaultChecked={darkmode} />
                        <span className={styles.darkmodelabel}>Enable Darkmode</span>
                    </div>
                </footer>
            </div>;
}

export default Footer;