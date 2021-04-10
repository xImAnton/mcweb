import { useEffect } from "react";
import { setTitle } from "../services";


function UserView({currentServer}) {
    
    useEffect(() => {
        setTitle("User Management");
    }, []);

    return  <div id="page-content">
                <h1 id="page-headline">User Management</h1>
            </div>;
}

export default UserView;