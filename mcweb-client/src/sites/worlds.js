import { useEffect } from "react";
import { setTitle } from "../services";
import Site from "./site";


function WorldsView({currentServer}) {

    useEffect(() => {
        setTitle("World Management");
    }, []);

    return  <Site name="World Management">
            </Site>
}

export default WorldsView;
