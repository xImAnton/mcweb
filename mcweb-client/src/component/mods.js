import { AddonSelector, AddonsListEntry } from "../curse/curse";
import { useState, useEffect } from "react";
import { getAddons } from "../curse/curseapi";
import LoadingAnimation from "./loading";
import { TabArea, Tab } from "./ui";
import { removeAddon, setTitle } from "../services";


function AddonRemoveDialog({data, close, removeAddon}) {
    return  <div className="addon-popup-wrapper" id="addon-popup-wrapper">
                <div className="addon-popup">
                    <h1>{data.name}</h1>
                    <span>{data.summary}</span>
                    <div style={{display: "flex", marginTop: "6px"}}>
                        <button className="mcweb-ui" style={{marginRight: "6px", flexGrow: 1}} onClick={() => removeAddon(data)}>Remove Addon</button>
                        <button className="mcweb-ui" onClick={close} style={{flexGrow: 1}}>Cancel</button>
                    </div>
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

    return  <div className="installed-addons-wrapper">
                <div className={"addon-list"}>
                    <div className={"inner"}>
                        {data}
                    </div>
                    { toRemove && <AddonRemoveDialog data={toRemove} close={() => setToRemove(null)} removeAddon={removeAddon_} />}
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
    return  <div id="page-content">
                { loaded ? <>
                    <h1 id="page-headline">Mods</h1>
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
}

export default ModView;
