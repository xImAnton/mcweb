import { useEffect, useState, useRef } from "react";
import { getFiles } from "./curseapi";
import LoadingAnimation from "../component/loading/loading";
import { addAddon } from "../services";
import Input from "../component/ui/input/text";
import Button from "../component/ui/button/button";


function AddonsListEntry({data, onClick}) {

    const thumbnail = data.attachments[0];
    let thumbnailUrl;

    if (!thumbnail) {
        thumbnailUrl = "";
    } else {
        thumbnailUrl = thumbnail.thumbnailUrl;
    }

    return  <div className="addon" onClick={() => onClick(data)}>
                <div className="image-wrap">
                    <img src={thumbnailUrl} alt="" />
                </div>
                <div className="text">
                    <h3>{data.name}</h3>
                    <span>{data.summary}</span>
                </div>
            </div>;
}


function AddonInstallationFileSelection({currentServer, addonId, installAddon, addonName, hideIncompatible}) {

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getFiles(addonId).then(res => {
            setLoading(false);
            const fileObjs = [];
            // eslint-disable-next-line
            res.data.map((e) => {
                if (e.fileName.endsWith(".jar"))
                fileObjs.push({
                    fileName: e.fileName,
                    fileId: e.id,
                    gameVersion: e.gameVersion
                })
            });
            setFiles(fileObjs);
        })
    }, [addonId]);

    const fileElements = [];

    files.forEach((e) => {
        if (e.gameVersion.includes(currentServer.software.minecraftVersion) | !hideIncompatible) {
            fileElements.push(<AddonInstallationFileEntry
                gameVersion={e.gameVersion}
                fileName={e.fileName}
                key={e.fileId}
                onClick={() => installAddon(addonId, e.fileId, addonName)}
            />);
        }
    });

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
                <div className="file-selection-list-entry-field">{gameVersion.join(", ")}</div>
            </div>
}


function AddonInstallationDialog({data, close, currentServer, installAddon, hideIncompatible}) {

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
                        <AddonInstallationFileSelection currentServer={currentServer} addonId={data.id} installAddon={installAddon} addonName={data.name} hideIncompatible={hideIncompatible} />
                    </>}
                    <div style={{display: "flex", marginTop: "6px"}}>
                        <Button style={{marginRight: "6px", flexGrow: "1"}} onClick={() => {
                            if (hideIncompatible) {
                                for (let i = 0; i < data.gameVersionLatestFiles.length; i++) {
                                    if (data.gameVersionLatestFiles[i].gameVersion === currentServer.software.minecraftVersion) {
                                        installAddon(data.id, data.gameVersionLatestFiles[i].projectFileId, data.name);
                                        break;
                                    }
                                }
                            } else {
                                installAddon(data.id, data.latestFiles[0].id, data.name);
                            }
                        }}>
                            Install Latest{hideIncompatible ? " Compatible" : ""}
                        </Button>
                        { !fileSelection && <Button style={{flexGrow: "1"}} onClick={toggleFileSelection}>Select Version</Button> }
                    </div>
                    <Button style={{width: "100%", marginTop: "6px"}} onClick={close}>Cancel</Button>
                </div>
            </div>;
}


function AddonsList({currentServer, addons, setLoadingText, setLoaded, hideIncompatible}) {

    const [selected, setSelected] = useState(null);

    const listDiv = useRef(null);

    useEffect(() => {
        if (listDiv.current) {
            listDiv.current.scrollTop = 0;
        }
    }, [addons])

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

    return  <div className={"addon-list"}>
                <div ref={listDiv} className={"inner" + (selected ? " unscrollable" : "")}>
                    {data}
                </div>
                { selected && <AddonInstallationDialog data={selected} close={() => setSelected(null)} currentServer={currentServer} installAddon={installAddon} hideIncompatible={hideIncompatible} /> }
            </div>
}


function AddonSelectFooter({page, setPage}) {
    return  <div className="curse-footer">
                <PaginatorButtons page={page} setPage={setPage} />
            </div>
}


function PaginatorButtons({page, setPage}) {
    return  <div className="curse-paginator">
                <Button disabled={page === 0} onClick={() => setPage(page - 1)}>⮜</Button>
                <Button onClick={() => setPage(0)}>⭮</Button>
                <Button onClick={() => setPage(page + 1)}>⮞</Button>
            </div>
}


function SearchBar({search, hideIncompatible, setHideIncompatible}) {

    let searchText = "";

    const searchBar = useRef(null);

    return  <div className="search">
                <Button style={{width: "32px", display: "inline-block", marginRight: "3px"}} onClick={() => {search(""); searchBar.current.value = ""}}>×</Button>
                <Input
                    onChange={(e) => {searchText = e.currentTarget.value}}
                    placeholder="Search Mods"
                    type="text"
                    style={{display: "inline-block", flexGrow: "1", marginRight: "3px"}}
                    onKeyDown={(e) => { if (e.key === "Enter") search(searchText); }}
                    ref={searchBar}
                />
                <Button style={{width: "32px", display: "inline-block", marginRight: "3px"}} onClick={() => search(searchText)}>
                    <span style={{fontSize: ".875em", marginRight: ".125em", position: "relative", top: "-.1em", left: "-.125em"}}>
                        🔍
                    </span>
                </Button>
                <Button style={{width: "32px", display: "inline-block", color: hideIncompatible ? "red" : "var(--font)"}} onClick={() => {setHideIncompatible(!hideIncompatible)}}>
                    <span style={{fontSize: ".875em", marginRight: "-.3em", position: "relative", top: "-.16em", left: "-.125em"}}>
                        ✗
                    </span>
                </Button>
            </div>
}


function AddonSelectHeader({search, hideIncompatible, setHideIncompatible}) {
    return  <div className="curse-head">
                <SearchBar search={search} hideIncompatible={hideIncompatible} setHideIncompatible={setHideIncompatible} />
            </div>;
}


function AddonSelector({currentServer, page, setPage, setSearch, addons, setLoadingText, setLoaded}) {

    const [hideIncompatible, setHideIncompatible] = useState(true);
    
    return  <div className="curse-selector">
                <AddonSelectHeader search={setSearch} hideIncompatible={hideIncompatible} setHideIncompatible={setHideIncompatible} />
                <AddonsList
                    currentServer={currentServer}
                    addons={addons}
                    setLoaded={setLoaded}
                    setLoadingText={setLoadingText}
                    hideIncompatible={hideIncompatible}
                />
                <AddonSelectFooter page={page} setPage={setPage} />
            </div>;
}

export { AddonSelector, AddonsListEntry };
 