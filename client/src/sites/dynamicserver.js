import { useEffect } from "react";
import { setTitle } from "../services";
import Site from "./site";


/**
 * View for managing dynamic server management
 */
function DSMView({currentServer}) {

    useEffect(() => {
        setTitle("Dynamic Server Management");
    }, []);

    return  <Site name="Dynamic Server Management">
            </Site>;
}

export default DSMView;