import styles from "./loading.module.css";


/**
 * loading animation component
 * you may pass loadingText prop to display text for animation
 */
export default function LoadingAnimation({loadingText}) {
    return <div>
                <div className={styles.animation}>
                    <div className={styles.wrapper}>
                        <div className={styles.content}>
                            <div className={styles.spinner}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                            <div>{loadingText ? (loadingText) : (<span>Loading...</span>)}</div>
                        </div>
                    </div>
                </div>
            </div>
}
