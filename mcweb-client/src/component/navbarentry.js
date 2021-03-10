import React from "react";
import { useHistory } from "react-router-dom";


export default function NavbarEntry(props) {
    const history = useHistory();

    function handleClick() {
        history.push("/" + props.href);
    }

    return (<li onClick={handleClick} key={props.index}>{props.name}</li>);
}
