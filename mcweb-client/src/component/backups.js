import { useEffect } from "react";
import { setTitle } from "../services";


/**
 * Backup Page of Webinterface
 */
function BackupsView({currentServer}) {

    useEffect(() => {
        setTitle("Backups");
    }, []);

    return <div id="page-content">
                <h1 id="page-headline">Backups</h1>
            </div>;
}

export default BackupsView;