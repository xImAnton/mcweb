import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Header from "./component/header";
import Sidebar from "./component/sidebar";
import PageContent from "./component/pagecontent";
import Footer from "./component/footer";


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            darkmode: true,
        };
    }

    render() {
        return <div id="app" className={this.state.darkmode ? "darkmode" : "brightmode"}>
            <Header />
            <Sidebar />
            <PageContent />
            <Footer toggleDarkMode={() => this.setState({darkmode: !this.state.darkmode})}/>
        </div>
    }
}

ReactDOM.render(<App />, document.getElementById("root"));
