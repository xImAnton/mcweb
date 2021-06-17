import styles from "./header.module.css";
import Button from "../ui/button/button";
import { useDesign } from "../../ctx/design";


function Header() {

    const design = useDesign();

    function toggleNavbar() {
        if (!design.isFullPage) {
            design.setNavbarShown(!design.navbarShown);
        }
    }

    return  <div className={styles.wrapper}>
                <div className={styles.header}>
                    { design.isResponsive && !design.isFullPage && <Button onClick={toggleNavbar} style={{width: "1em", height: "auto"}} noMargin>☰</Button> }
                    <img src="logo_wide_bright.png" id="image-heading" alt="LOGO" className={styles.image} />
                </div>
            </div>
}

export default Header;
