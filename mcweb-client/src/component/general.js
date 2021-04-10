import { useEffect } from "react";
import { setTitle } from "../services";


function GeneralView({currentServer}) {

    useEffect(() => {
        setTitle("General");
    }, []);

    return <div id="page-content">
                <h1 id="page-headline">General</h1>
            </div>;
}

export default GeneralView;
