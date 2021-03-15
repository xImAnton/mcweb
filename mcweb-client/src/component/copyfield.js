import React from "react";

/**
 * Handy component
 * Displays a value and gives the oppotunity to copy it
 */
function CopyField(props) {
    return <div className="copy-field">{props.text} <button onClick={() => navigator.clipboard.writeText(props.text)}>📋</button></div>;
}

export default CopyField;