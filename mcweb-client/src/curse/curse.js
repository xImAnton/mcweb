import { useEffect, useState, useRef } from "react";
import { getAddons, getFiles } from "./curseapi";
import LoadingAnimation from "../component/loading";
import { addAddon } from "../services";


function AddonsListEntry({data, onClick}) {

    const thumbnail = data.attachments[0];
    let thumbnailUrl;

    if (!thumbnail) {
        thumbnailUrl = "";
    } else {
        thumbnailUrl = thumbnail.thumbnailUrl;
    }

    return  <div className="addon" onClick={() => onClick(data.id)}>
                <div className="image-wrap">
                    <img src={thumbnailUrl} alt="" />
                </div>
                <div className="text">
                    <h3>{data.name}</h3>
                    <span>{data.summary}</span>
                </div>
            </div>;
}


function AddonInstallationFileSelection({currentServer, addonId, installAddon, addonName}) {

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getFiles(addonId).then(res => {
            setLoading(false);
            const fileObjs = [];
            res.data.map((e) => {
                if (e.fileName.endsWith(".jar"))
                fileObjs.push({
                    fileName: e.fileName,
                    fileId: e.id,
                    gameVersion: e.gameVersion[0]
                })
            });
            setFiles(fileObjs);
        })
    }, []);

    let fileElements = files.map((e) => <AddonInstallationFileEntry
            gameVersion={e.gameVersion}
            fileName={e.fileName}
            key={e.fileId}
            onClick={() => installAddon(addonId, e.fileId, addonName)}
        />
    )

    return  <div className="file-selection-list">
                { !loading ?
                    <>{fileElements}</>
                    :
                    <LoadingAnimation loadingText="Loading Files..." />}
            </div>
}


function AddonInstallationFileEntry({fileName, gameVersion, onClick}) {
    return  <div className="file-selection-list-entry" onClick={onClick}>
                <div className="file-selection-list-entry-field">{fileName}</div>
                <div className="file-selection-list-entry-field">{gameVersion}</div>
            </div>
}


function AddonInstallationDialog({data, close, currentServer, installAddon}) {

    const [fileSelection, setFileSelection] = useState(false);

    function toggleFileSelection() {
        setFileSelection(!fileSelection);
    }

    return  <div className="addon-popup-wrapper" id="addon-popup-wrapper">
                <div className="addon-popup">
                    <h1>{data.name}</h1>
                    <span>{data.summary}</span>
                    <span><a href={data.websiteUrl} target="_blank" rel="noreferrer">{data.websiteUrl + "/files"}</a></span>
                    { fileSelection && <>
                        Lookup the File Name from the Link above and click to install it.
                        <AddonInstallationFileSelection currentServer={currentServer} addonId={data.id} installAddon={installAddon} addonName={data.name} />
                    </>}
                    <div style={{display: "flex", marginTop: "6px"}}>
                        <button className="mcweb-ui" style={{marginRight: "6px", flexGrow: "1"}} onClick={() => installAddon(data.id, data.latestFiles[0].id, data.name)}>Install Latest</button>
                        { !fileSelection && <button className="mcweb-ui" style={{flexGrow: "1"}} onClick={toggleFileSelection}>Select Version</button> }
                    </div>
                    <button className="mcweb-ui" style={{width: "100%", marginTop: "6px"}} onClick={close}>Cancel</button>
                </div>
            </div>;
}


function AddonsList({page, sectionId, searchText, currentServer}) {

    const [addons, setAddons] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loaded, setLoaded] = useState(true);
    const [loadingText, setLoadingText] = useState("Loading Mods");

    const listDiv = useRef(null);

    useEffect(() => {
        setLoadingText("Loading Mods");
        setLoaded(false);
        getAddons(sectionId, page, searchText).then((res) => {
            setAddons(res.data);
            if (listDiv.current)
            listDiv.current.scrollTop = 0;
            setLoaded(true);
        });
    }, [page, searchText, sectionId]);

    function installAddon(addonId, fileId, addonName) {
        setLoadingText("Installing " + addonName);
        setLoaded(false);
        addAddon(currentServer.id, addonId, "mods", fileId).then((res) => {
            setLoaded(true);
            setSelected(null);
        }
        );
    }

    const data = addons.map(e => {
        return <AddonsListEntry data={e} key={e.id} onClick={() => setSelected(e) } />
    })

    return  <div className={"addon-list"}>
                { loaded ? <>
                    <div ref={listDiv} className={"inner" + (selected ? " unscrollable" : "")}>
                        {data}
                    </div>
                    { selected && <AddonInstallationDialog data={selected} close={() => setSelected(null)} currentServer={currentServer} installAddon={installAddon} /> }
                </> : <LoadingAnimation loadingText={loadingText} /> }
            </div>
}


function AddonSelectFooter({page, setPage}) {
    return  <div className="curse-footer">
                <PaginatorButtons page={page} setPage={setPage} />
            </div>
}


function PaginatorButtons({page, setPage}) {
    return  <div className="curse-paginator">
                <button className="mcweb-ui" disabled={page === 0} onClick={() => setPage(page - 1)}>⮜</button>
                <button className="mcweb-ui" onClick={() => setPage(0)}>⭮</button>
                <button className="mcweb-ui" onClick={() => setPage(page + 1)}>⮞</button>
            </div>
}


function SearchBar({search}) {

    let searchText = "";

    const searchBar = useRef(null);

    return  <div className="search">
                <button className="mcweb-ui" style={{width: "32px", display: "inline-block", marginRight: "3px"}} onClick={() => {search(""); searchBar.current.value = ""}}>×</button>
                <input
                    onChange={(e) => {searchText = e.currentTarget.value}}
                    placeholder="Search Mods"
                    className="mcweb-ui"
                    type="text"
                    style={{display: "inline-block", flexGrow: "1", marginRight: "3px"}}
                    onKeyDown={(e) => { if (e.key === "Enter") search(searchText); }}
                    ref={searchBar}
                />
                <button className="mcweb-ui" style={{width: "32px", display: "inline-block"}} onClick={() => search(searchText)}>🔍</button>
            </div>
}


function AddonSelectHeader({search}) {
    return  <div className="curse-head">
                <h1>Mods</h1>
                <SearchBar search={search} />
            </div>;
}


function AddonSelector({sectionId, currentServer}) {

    const [searchText, setSearch] = useState("");
    const [page, setPage] = useState(0);
    
    return  <div className="curse-selector">
                <AddonSelectHeader search={(s) => setSearch(s)} />
                <AddonsList page={page} sectionId={sectionId} searchText={searchText} currentServer={currentServer} />
                <AddonSelectFooter page={page} setPage={setPage} />
            </div>;
}

export default AddonSelector;
