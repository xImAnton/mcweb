/**
 * loading animation component
 * you may pass loadingText prop to display text for animation
 */
export default function LoadingAnimation(props) {
    return <div className="loadable-area">
                <div className="loading-animation">
                    <div id="loading-wrapper">
                        <div id="loading-content">
                            <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                            <div>{props.loadingText ? (props.loadingText) : (<span>Loading...</span>)}</div>
                        </div>
                    </div>
                </div>
            </div>
}