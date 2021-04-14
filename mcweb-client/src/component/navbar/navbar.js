import history from "../../history"
import styles from "./navbar.module.css";


function NavbarEntry(props) {
    function handleClick() {
        history.push("/" + props.href);
    }

    return (<li onClick={handleClick} key={props.index}>{props.name}</li>);
}


function Navbar(props) {
    if (!props.currentServer.full) return <></>
    return  <div className={styles.wrapper}>
                <ul className={styles.options}>
                    <NavbarEntry name="General" href="general" index={1}/>
                    <NavbarEntry name="Player" href="player" index={2}/>
                    <NavbarEntry name="Console" href="console" index={3}/>
                    <NavbarEntry name="Backups" href="backups" index={4}/>
                    <NavbarEntry name="Settings" href="settings" index={5}/>
                    { props.currentServer && props.currentServer.supports.mods && <NavbarEntry name="Mods" href="mods" index={6} /> }
                    <NavbarEntry name="World Management" href="worlds" index={7}/>
                    <NavbarEntry name="Dynamic Server Management" href="dsm" index={8}/>
                    <NavbarEntry name="User Management" href="user" index={9}/>
                    <li key={9}>Logged in as {props.username} (<span onClick={props.logout} className={styles.logout}>Logout</span>)</li>
                </ul>
            </div>
}

export default Navbar;
