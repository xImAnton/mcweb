import { useEffect } from "react";
import { setTitle } from "../services";


/**
 * View for managing dynamic server management
 */
function DSMView({currentServer}) {

    useEffect(() => {
        setTitle("Dynamic Server Management");
    }, []);

    return  <div id="page-content">
                <h1 id="page-headline">Dynamic Server Management</h1>
            </div>;
}

export default DSMView;