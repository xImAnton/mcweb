import { useEffect } from "react";
import { setTitle } from "../services";
import Site from "./site";


function GeneralView({currentServer}) {

    useEffect(() => {
        setTitle("General");
    }, []);

    return  <Site name="General">
            </Site>;
}

export default GeneralView;
