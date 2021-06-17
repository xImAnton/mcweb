import { useEffect } from "react";
import { setTitle } from "../services";
import Site from "./site";


/**
 * Backup Page of Webinterface
 */
function BackupsView({currentServer}) {

    useEffect(() => {
        setTitle("Backups");
    }, []);

    return  <Site name="Backups">
            </Site>;
}

export default BackupsView;