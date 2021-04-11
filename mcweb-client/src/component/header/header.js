import styles from "./header.module.css";



function Header() {
    return  <div id="header-wrapper" className={styles.wrapper}>
                <header>
                    <div id="header" className={styles.header}>
                        <img src="logo_wide_bright.png" id="image-heading" alt="LOGO" className={styles.image} />
                        
                    </div>
                </header>
            </div>;
}

export default Header;
