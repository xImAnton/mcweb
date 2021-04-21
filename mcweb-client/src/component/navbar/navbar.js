import history from "../../history"
import styles from "./navbar.module.css";
import { useDesign } from "../../ctx/design";


/**
 * plus button for opening CreateServerView
 */
 function AddServerEntry({setCreationCancellable}) {

    const design = useDesign();

    function clicked(e) {
        // make server creation cancellable
        setCreationCancellable(true);
        design.setNavbarShown(false);
        // redirect to server creation
        history.push("/createserver");
    }

    return <li onClick={clicked} key="addserver">Create new Server</li>
}


function NavbarEntry({href, name}) {

    const design = useDesign();

    function handleClick() {
        history.push("/" + href);
        if (design.isResponsive) {
            design.setNavbarShown(false);
        }
    }

    return (<li onClick={handleClick} key={name}>{name}</li>);
}


function Navbar({username, logout, currentServer, setCreationCancellable}) {
    if (!currentServer.full) return <></>
    return  <div className={styles.wrapper}>
                <ul className={styles.options}>
                    <NavbarEntry name="General" href="general" />
                    <NavbarEntry name="Player" href="player" />
                    <NavbarEntry name="Console" href="console" />
                    <NavbarEntry name="Backups" href="backups" />
                    <NavbarEntry name="Settings" href="settings" />
                    { currentServer && currentServer.supports.mods && <NavbarEntry name="Mods" href="mods" /> }
                    <NavbarEntry name="World Management" href="worlds" />
                    <NavbarEntry name="Dynamic Server Management" href="dsm" />
                    <NavbarEntry name="User Management" href="user" />
                    <AddServerEntry setCreationCancellable={setCreationCancellable} />
                    <li key="logout">Logged in as {username} (<span onClick={logout} className={styles.logout}>Logout</span>)</li>
                </ul>
            </div>
}

export default Navbar;
