import styles from "./site.module.css";


export default function Site({children, name}) {
    return  <div className={styles.page}>
                <HeadLine>
                    {name}
                </HeadLine>
                <div className={styles.content}>   
                    {children}
                </div>
            </div>
}

export function HeadLine({children, style}) {
    return <h1 className={styles.headline} style={style}>{children}</h1>;
}
