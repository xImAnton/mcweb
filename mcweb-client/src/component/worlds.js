import { useEffect } from "react";
import { setTitle } from "../services";


function WorldsView({currentServer}) {

    useEffect(() => {
        setTitle("World Management");
    }, []);

    return  <div id="page-content">
                <h1 id="page-headline">World Management</h1>
            </div>;
}

export default WorldsView;
