import { addAddon } from "../services";
import { useRef, useState, useEffect } from "react";
import { AddonInstallationDialog } from "./install";
import styles from "./list.module.css";


function AddonsList({currentServer, addons, setLoadingText, setLoaded, hideIncompatible}) {

    const [selected, setSelected] = useState(null);

    const listDiv = useRef(null);

    useEffect(() => {
        if (listDiv.current) {
            listDiv.current.scrollTop = 0;
        }
    }, [addons]);

    function installAddon(addonId, fileId, addonName) {
        setLoadingText("Installing " + addonName);
        setLoaded(false);
        addAddon(currentServer.id, addonId, "mods", fileId).then((res) => {
            setLoaded(true);
        }
        );
    }

    const data = []

    addons.forEach(e => {
        if (e.gameVersionLatestFiles.map(v => v.gameVersion).includes(currentServer.software.minecraftVersion) | !hideIncompatible) {
            data.push(<AddonsListEntry data={e} key={e.id} onClick={() => setSelected(e) } />);
        }
    });

    let classes = [styles.inner];
    if (selected) {
        classes.push(styles.unscrollable);
    }

    return  <div className={styles.list}>
                <div ref={listDiv} className={classes.join(" ")}>
                    {data}
                </div>
                { selected && <AddonInstallationDialog data={selected} close={() => setSelected(null)} currentServer={currentServer} installAddon={installAddon} hideIncompatible={hideIncompatible} /> }
            </div>
}


function AddonsListEntry({data, onClick}) {

    const thumbnail = data.attachments[0];
    let thumbnailUrl;

    if (!thumbnail) {
        thumbnailUrl = "";
    } else {
        thumbnailUrl = thumbnail.thumbnailUrl;
    }

    return  <div className={styles.entry} onClick={() => onClick(data)}>
                <div className={styles.imagewrap}>
                    <img src={thumbnailUrl} alt="" />
                </div>
                <div className={styles.text}>
                    <h3>{data.name}</h3>
                    <span>{data.summary}</span>
                </div>
            </div>;
}

export { AddonsList, AddonsListEntry };