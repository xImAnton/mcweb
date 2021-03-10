import React from "react";


function CopyField(props) {
    return <div className="copy-field">{props.text} <button onClick={() => navigator.clipboard.writeText(props.text)}>📋</button></div>;
}

export default CopyField;