import React, { useEffect } from "react";
import styles from "./tab.module.css";


function Tab({name, children}) { }


function TabSelector({name, changeTab, selected}) {
    return <div className={[styles.tab, selected | ""].join(" ")} onClick={() => changeTab(name)}>{name}</div>
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

    return <div className={styles.wrapper}>
        <div className={styles.tabs}>
            {tabNames.map(n => <TabSelector name={n} changeTab={setCurrentTab} key={n} selected={n === currentTab} />)}
        </div>
        <div className={styles.contentwrapper}>
            <div className={styles.content}>
                {tabContent}
            </div>
        </div>
    </div>
}

export { TabArea, Tab };
