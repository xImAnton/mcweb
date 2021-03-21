import React from "react";

/**
 * Displays a value and gives the oppotunity to copy it
 */
function CopyField(props) {
    return <div className="mcweb-ui copy-field">{props.text} <button onClick={() => navigator.clipboard.writeText(props.text)}>📋</button></div>;
}

function Select(props) {
    return <div className="mcweb-ui select">
                <select onChange={props.onChange} value={props.value}>
                    {props.children}
                </select>
                <span></span>
            </div>
}

export { CopyField, Select };
