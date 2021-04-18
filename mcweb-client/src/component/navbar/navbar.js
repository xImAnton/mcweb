import history from "../../history"
import styles from "./navbar.module.css";




/**
 * plus button for opening CreateServerView
 */
 function AddServerEntry({setCreationCancellable, closeNavbar}) {
    function clicked(e) {
        // make server creation cancellable
        setCreationCancellable(true);
        closeNavbar();
        // redirect to server creation
        history.push("/createserver");
    }

    return <li onClick={clicked} key="addserver">Create new Server</li>
}


function NavbarEntry({href, index, name, responsive, closeNavbar}) {
    function handleClick() {
        history.push("/" + href);
        if (responsive) {
            closeNavbar();
        }
    }

    return (<li onClick={handleClick} key={name}>{name}</li>);
}


function Navbar({username, logout, currentServer, responsive, closeNavbar, setCreationCancellable}) {
    if (!currentServer.full) return <></>
    return  <div className={styles.wrapper}>
                <ul className={styles.options}>
                    <NavbarEntry name="General" href="general" responsive={responsive} closeNavbar={closeNavbar} />
                    <NavbarEntry name="Player" href="player" responsive={responsive} closeNavbar={closeNavbar} />
                    <NavbarEntry name="Console" href="console" responsive={responsive} closeNavbar={closeNavbar} />
                    <NavbarEntry name="Backups" href="backups" responsive={responsive} closeNavbar={closeNavbar} />
                    <NavbarEntry name="Settings" href="settings" responsive={responsive} closeNavbar={closeNavbar} />
                    { currentServer && currentServer.supports.mods && <NavbarEntry name="Mods" href="mods" responsive={responsive} closeNavbar={closeNavbar} /> }
                    <NavbarEntry name="World Management" href="worlds" responsive={responsive} closeNavbar={closeNavbar} />
                    <NavbarEntry name="Dynamic Server Management" href="dsm" responsive={responsive} closeNavbar={closeNavbar} />
                    <NavbarEntry name="User Management" href="user" responsive={responsive} closeNavbar={closeNavbar} />
                    <AddServerEntry closeNavbar={closeNavbar} setCreationCancellable={setCreationCancellable} />
                    <li key="logout">Logged in as {username} (<span onClick={logout} className={styles.logout}>Logout</span>)</li>
                </ul>
            </div>
}

export default Navbar;
