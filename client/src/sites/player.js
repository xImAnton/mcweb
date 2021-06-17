import { useEffect } from "react";
import { setTitle } from "../services";
import Site from "./site";


function PlayerView({currentServer}) {

    useEffect(() => {
        setTitle("Player");
    }, []);

    return  <Site name="Player">
            </Site>;
}

export default PlayerView;
