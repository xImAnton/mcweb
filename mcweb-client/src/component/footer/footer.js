import styles from "./footer.module.css";
import Switch from "../ui/switch/switch";
import { useDesign } from "../../ctx/design";


function Footer() {
    const design = useDesign();

    return  <div id="footer-wrapper" className={styles.wrapper}>
                <footer>
                    <div id="footer">
                        <Switch onChange={() => design.setDarkmode(!design.isDarkmode)} defaultChecked={design.isDarkmode} />
                        <span className={styles.darkmodelabel}>Enable Darkmode</span>
                    </div>
                </footer>
            </div>;
}

export default Footer;