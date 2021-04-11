import { useEffect } from "react";
import { setTitle } from "../services";
import Site, { HeadLine } from "./site";


function UserView({currentServer}) {
    
    useEffect(() => {
        setTitle("User Management");
    }, []);

    return  <Site>
                <HeadLine>User Management</HeadLine>
            </Site>;
}

export default UserView;