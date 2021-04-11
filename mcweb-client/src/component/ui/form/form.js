import styles from "./form.module.css";


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
    return  <table className={props.mergeLast ? styles.formtable : undefined}>
                <tbody>
                    {props.children}
                </tbody>
            </table>
}

export { LastFormLine, FormLine, FormTable };
