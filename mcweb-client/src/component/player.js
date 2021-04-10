import { useEffect } from "react";
import { setTitle } from "../services";


function PlayerView({currentServer}) {

    useEffect(() => {
        setTitle("Player");
    }, []);

    return  <div id="page-content">
                <h1 id="page-headline">Player</h1>
            </div>;
}

export default PlayerView;
