import React from "react";


class Header extends React.Component {
    render() {
        return <div id="header-wrapper">
                    <header>
                        <div id="header">
                            <img src="favicon.ico" id="image-heading" alt="LOGO"/>
                            <div className="text-right">MCWeb Client</div>
                        </div>
                    </header>
                </div>;
    }
}

export default Header;
