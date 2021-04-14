import { AddonsListEntry } from "../curse/list";
import { AddonSelector } from "../curse/selector";
import { useState, useEffect } from "react";
import { getAddons } from "../curse/curseapi";
import LoadingAnimation from "../component/loading/loading";
import { TabArea, Tab } from "../component/ui/tab/tab";
import { removeAddon, setTitle, downloadAddons } from "../services";
import Site from "./site";
import styles from "./mods.module.css";
import Button from "../component/ui/button/button";
import installstyles from "../curse/install.module.css";
import liststyles from "../curse/list.module.css";
import { FormTable, DistributedFormLine } from "../component/ui/form/form";


function AddonRemoveDialog({data, close, removeAddon}) {
    return  <div className={installstyles.popupwrap}>
                <div className={installstyles.popup}>
                    <h1>{data.name}</h1>
                    <span>{data.summary}</span>
                    <FormTable>
                        <DistributedFormLine>
                            <Button onClick={close}>Cancel</Button>
                            <Button onClick={() => removeAddon(data)}>Remove Addon</Button>
                        </DistributedFormLine>
                    </FormTable>
                </div>
            </div>
}


function addonToData(a) {
    return {
        attachments: [{thumbnailUrl: a.imageUrl}],
        name: a.name,
        summary: a.description,
        id: a.id,
    }
}


function InstalledAddonsList({addons, currentServer, setLoaded, setLoadingText}) {

    const [toRemove, setToRemove] = useState(null);

    const data = addons.map(a => {
        return <AddonsListEntry onClick={setToRemove} data={addonToData(a)} key={a.name}/>
    })

    function removeAddon_(data) {
        setLoadingText("Removing " + data.name)
        setLoaded(false);
        removeAddon(currentServer.id, data.id).finally(() => {
            setLoaded(true);
        })
    }

    let classes = [liststyles.inner];
    if (toRemove) {
        classes.push(liststyles.unscrollable);
    }

    return  <div className={liststyles.list} style={{height: "100%"}}>
                { toRemove && <AddonRemoveDialog data={toRemove} close={() => setToRemove(null)} removeAddon={removeAddon_} />}
                <div className={classes.join(" ")}>
                    {data}
                </div>
            </div>
}


function ModView({currentServer}) {

    const [page, setPage] = useState(0);
    const [searchText, setSearch] = useState("");
    const [addons, setAddons] = useState([]);
    const [loadingText, setLoadingText] = useState("Loading Mods");
    const [loaded, setLoaded] = useState(true);
    const tab = useState("");

    useEffect(() => {
        setLoadingText("Loading Mods");
        setLoaded(false);
        getAddons(6, page, searchText).then((res) => {
            setAddons(res.data);
            setLoaded(true);
        });
    }, [page, searchText]);

    useEffect(() => {
        setTitle("Mods")
    }, []);

    // 12: Texture Packs, 4471: Modpacks, 6: Mods, 17: Worlds
    return  <Site name="Mods">
                <div className={styles.wrapper}>
                    { loaded ? 
                        <>
                            <Button onClick={() => downloadAddons(currentServer.id)}>Download All</Button>
                            <TabArea tab={tab}>
                                <Tab name="Installed Addons">
                                    <InstalledAddonsList
                                        addons={currentServer.addons}
                                        currentServer={currentServer}
                                        setLoaded={setLoaded}
                                        setLoadingText={setLoadingText}
                                    />
                                </Tab>
                                <Tab name="Add Addons">
                                    <AddonSelector
                                        sectionId={6}
                                        currentServer={currentServer}
                                        page={page} setPage={setPage}
                                        setAddons={setAddons}
                                        addons={addons}
                                        searchText={searchText}
                                        setSearch={setSearch}
                                        setLoaded={setLoaded}
                                        setLoadingText={setLoadingText}
                                    />
                                </Tab>
                            </TabArea>
                        </>
                    : <LoadingAnimation loadingText={loadingText} /> }
                </div>
            </Site>;
}

export default ModView;
