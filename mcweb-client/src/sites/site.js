import styles from "./site.module.css";


export default function Site({children}) {
    return <div className={styles.content}>
        {children}
    </div>
}

export function HeadLine({children, style}) {
    return <h1 className={styles.headline} style={style}>{children}</h1>;
}
