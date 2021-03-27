import React, { useEffect } from "react";

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


function LastFormLine(props) {
    return <tr>
        <td colSpan={2}>
            {props.children}
        </td>
    </tr>
}


function FormLine({label, input}) {
    return  <tr>
                <td>{label + ": "}</td>
                <td>{input}</td>
            </tr>
}


function FormTable(props) {
    return  <table className={props.mergeLast ? "formtable" : undefined}>
                <tbody>
                    {props.children}
                </tbody>
            </table>
}


function Alert({text, color}) {
    return <>{ text && <div className={"alert-box " + (color ? color : "red")}>{text}</div>}</>;
}


function Tab({name, children}) {

}


function TabSelector({name, changeTab, selected}) {
    return <div className={"tabarea-tab" + (selected ? " selected" : "")} onClick={() => changeTab(name)}>{name}</div>
}


function TabArea({tab, children}) {

    const [currentTab, setCurrentTab] = tab;

    const tabNames = [];

    useEffect(() => {
        let set = false;
        React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === Tab) {
                if (currentTab === "" && !set) {
                    setCurrentTab(child.props.name);
                    set = true;
                }
            }
        })
    }, []);
    
    let tabContent;
    React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === Tab) {
            tabNames.push(child.props.name);
            if (currentTab === child.props.name) {
                tabContent = child.props.children;
            }
        }
    })

    return <div className="tab-wrapper">
        <div className="tabarea-tabs">
            {tabNames.map(n => <TabSelector name={n} changeTab={setCurrentTab} key={n} selected={n === currentTab} />)}
        </div>
        <div className="tab-content-wrapper">
            <div className="tab-content">
                {tabContent}
            </div>
        </div>
    </div>
}


export { CopyField, Select, FormLine, FormTable, LastFormLine, Alert, TabArea, Tab };
