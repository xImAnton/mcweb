import { useEffect } from "react";
import { setTitle } from "../services";
import Site from "./site";


function UserView({currentServer}) {
    
    useEffect(() => {
        setTitle("User Management");
    }, []);

    return  <Site name="User Management">
            </Site>;
}

export default UserView;