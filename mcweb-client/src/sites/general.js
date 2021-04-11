import { useEffect } from "react";
import { setTitle } from "../services";
import Site, { HeadLine } from "./site";


function GeneralView({currentServer}) {

    useEffect(() => {
        setTitle("General");
    }, []);

    return  <Site>
                <HeadLine>General</HeadLine>
            </Site>;
}

export default GeneralView;
