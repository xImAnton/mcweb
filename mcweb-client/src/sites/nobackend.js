import history from "../history";
import Site, { HeadLine } from "./site";


/**
 * page to display when server error, server not responding or websocket closed by server
 */
function NoBackend({refetch}) {

    function retry() {
        history.push("/");
        refetch();
    }

    return  <div id="content-wrapper" className="full">
                <div className="page-full">
                    <div id="page-content">
                        <HeadLine>Server Error</HeadLine>
                        The Server is not responding
                        <button className="mcweb-ui" onClick={retry}>Retry</button>
                    </div>
                </div>
            </div>
}

export default NoBackend;
