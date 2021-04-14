import styles from "./header.module.css";
import Button from "../ui/button/button";



function Header({responsive, toggleNavbar}) {
    return  <div className={styles.wrapper}>
                <div className={styles.header}>
                    { responsive && <Button onClick={toggleNavbar} style={{width: "1em", height: "auto"}} noMargin>☰</Button> }
                    <img src="logo_wide_bright.png" id="image-heading" alt="LOGO" className={styles.image} />
                </div>
            </div>
}

export default Header;
