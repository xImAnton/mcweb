import history from "../history";
import Site, { HeadLine } from "./site";
import Button from "../component/ui/button/button";
import appstyles from "../index.module.css";
import { useEffect } from "react";


/**
 * page to display when server error, server not responding or websocket closed by server
 */
function NoBackend({refetch}) {

    function retry() {
        history.push("/");
        refetch();
    }

    return  <div className={appstyles.contentwrapper}>
                <Site name="Server Error">
                    The Server is not responding
                    <Button onClick={retry}>Retry</Button>
                </Site>
            </div>
}

export default NoBackend;
