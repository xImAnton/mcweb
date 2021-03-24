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


export { CopyField, Select, FormLine, FormTable, LastFormLine, Alert };
