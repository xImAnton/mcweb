import React from "react";


class Footer extends React.Component {
    render() {
        return <div id="footer-wrapper">
                    <footer>
                        <div id="footer">
                            <label className="switch">
                                <input type="checkbox" onChange={this.props.toggleDarkMode} id="darkmode-switch" defaultChecked={true} />
                                <span className="slider"></span>
                            </label>
                            enable Darkmode
                        </div>
                    </footer>
                </div>;
    }
}

export default Footer;