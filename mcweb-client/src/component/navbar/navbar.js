import history from "../../history"
import styles from "./navbar.module.css";


function NavbarEntry({href, index, name, responsive, closeNavbar}) {
    function handleClick() {
        history.push("/" + href);
        if (responsive) {
            closeNavbar();
        }
    }

    return (<li onClick={handleClick} key={index}>{name}</li>);
}


function Navbar({username, logout, currentServer, responsive, closeNavbar}) {
    if (!currentServer.full) return <></>
    return  <div className={styles.wrapper}>
                <ul className={styles.options}>
                    <NavbarEntry name="General" href="general" index={1} responsive={responsive} closeNavbar={closeNavbar} />
                    <NavbarEntry name="Player" href="player" index={2} responsive={responsive} closeNavbar={closeNavbar} />
                    <NavbarEntry name="Console" href="console" index={3} responsive={responsive} closeNavbar={closeNavbar} />
                    <NavbarEntry name="Backups" href="backups" index={4} responsive={responsive} closeNavbar={closeNavbar} />
                    <NavbarEntry name="Settings" href="settings" index={5} responsive={responsive} closeNavbar={closeNavbar} />
                    { currentServer && currentServer.supports.mods && <NavbarEntry name="Mods" href="mods" index={6} responsive={responsive} closeNavbar={closeNavbar} /> }
                    <NavbarEntry name="World Management" href="worlds" index={7} responsive={responsive} closeNavbar={closeNavbar} />
                    <NavbarEntry name="Dynamic Server Management" href="dsm" index={8} responsive={responsive} closeNavbar={closeNavbar} />
                    <NavbarEntry name="User Management" href="user" index={9} responsive={responsive} closeNavbar={closeNavbar} />
                    <li key={9}>Logged in as {username} (<span onClick={logout} className={styles.logout}>Logout</span>)</li>
                </ul>
            </div>
}

export default Navbar;
