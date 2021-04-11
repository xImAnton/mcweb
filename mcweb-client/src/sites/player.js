import { useEffect } from "react";
import { setTitle } from "../services";
import Site, { HeadLine } from "./site";


function PlayerView({currentServer}) {

    useEffect(() => {
        setTitle("Player");
    }, []);

    return  <Site>
                <HeadLine>Player</HeadLine>
            </Site>;
}

export default PlayerView;
