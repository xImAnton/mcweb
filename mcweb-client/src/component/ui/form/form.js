import styles from "./form.module.css";
import { useState } from "react";
import Button from "../button/button";


function ExpandableFormLine({children, name}) {
    const [expanded, setExpanded] = useState(false);

    const expandButtonLine = (<MergedFormLine>
                                  <Button onClick={() => setExpanded(!expanded)}>{(expanded ? "Hide " : "Show ") + name}</Button>
                              </MergedFormLine>)

    return  <>
                { expanded && children }
                { expandButtonLine }
            </>
}


function MergedFormLine({children}) {
    return <tr>
        <td colSpan={2} className={[styles.value, styles.lastline].join(" ")}>
            {children}
        </td>
    </tr>
}


function DistributedFormLine({children}) {
    return  <MergedFormLine>
                <div className={styles.distributed}>
                    {children}
                </div>
            </MergedFormLine>;
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

export { MergedFormLine, FormLine, FormTable, DistributedFormLine, ExpandableFormLine };
