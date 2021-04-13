import styles from "./form.module.css";


function LastFormLine(props) {
    return <tr>
        <td colSpan={2} className={styles.value}>
            {props.children}
        </td>
    </tr>
}


function FormLine({label, input}) {
    return  <tr>
                <td className={styles.label}>{label + ": "}</td>
                <td className={styles.value}>{input}</td>
            </tr>
}


function FormTable(props) {
    return  <table className={[styles.formtable, props.mergeLast ? styles.mergelast : undefined].join(" ")}>
                <tbody>
                    {props.children}
                </tbody>
            </table>
}

export { LastFormLine, FormLine, FormTable };
