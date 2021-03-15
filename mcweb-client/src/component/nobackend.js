import React from "react";
import history from "../history";


/**
 * page to display when server error, server not responding or websocket closed by server
 */
class NoBackend extends React.Component {

    retry() {
        history.push("/");
        this.props.refetch();
    }

    render() {
        return <div id="content-wrapper" className="full">
            <div className="page-full">
                <div id="page-content">
                    <h1 id="page-headline">Server Error</h1>
                    The Server is not responding
                    <br />
                    <button onClick={() => this.retry()}>Retry</button>
                </div>
            </div>
        </div>
    }
}

export default NoBackend;
