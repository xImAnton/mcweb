import React from "react";


export default function InfoBox(props) {
    return <div className="infobox-wrapper">
        <div className="infobox-content-wrapper">
            <div className="infobox">
                <h1>{props.head}</h1>
                <div id="input-form">
                    {props.text}
                    <button onClick={props.close}>Close</button>
                </div>
            </div>
        </div>
    </div>
}
