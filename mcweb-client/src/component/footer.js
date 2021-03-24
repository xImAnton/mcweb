function Footer({toggleDarkMode, darkmode}) {
    return  <div id="footer-wrapper">
                <footer>
                    <div id="footer">
                        <label className="switch">
                            <input type="checkbox" onChange={toggleDarkMode} id="darkmode-switch" defaultChecked={darkmode} />
                            <span className="slider"></span>
                        </label>
                        enable Darkmode
                    </div>
                </footer>
            </div>;
}

export default Footer;