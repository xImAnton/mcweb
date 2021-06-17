import { useEffect, useState } from "react";
import { getFiles } from "./curseapi";
import LoadingAnimation from "../component/loading/loading";
import Button from "../component/ui/button/button";
import styles from "./install.module.css";
import { FormTable, MergedFormLine, DistributedFormLine } from "../component/ui/form/form";


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

    return  <div className={styles.fileselectionlist}>
                { !loading ?
                    <>{fileElements}</>
                    :
                    <LoadingAnimation loadingText="Loading Files..." />}
            </div>
}


function AddonInstallationFileEntry({fileName, gameVersion, onClick}) {
    return  <div className={styles.entry} onClick={onClick}>
                <div className={styles.field}>{fileName}</div>
                <div className={styles.field}>{gameVersion.join(", ")}</div>
            </div>
}


function AddonInstallationDialog({data, close, currentServer, installAddon, hideIncompatible}) {

    const [fileSelection, setFileSelection] = useState(false);

    function toggleFileSelection() {
        setFileSelection(!fileSelection);
    }

    return  <div className={styles.popupwrap}>
                <div className={styles.popup}>
                    <h1>{data.name}</h1>
                    <span>{data.summary}</span>
                    <span><a href={data.websiteUrl} target="_blank" rel="noreferrer">{data.websiteUrl + "/files"}</a></span>
                    { fileSelection && <>
                        Lookup the File Name from the Link above and click to install it.
                        <AddonInstallationFileSelection currentServer={currentServer} addonId={data.id} installAddon={installAddon} addonName={data.name} hideIncompatible={hideIncompatible} />
                    </>}
                    <FormTable>
                        <DistributedFormLine>
                            <Button onClick={() => {
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
                            { !fileSelection && <Button onClick={toggleFileSelection}>Select Version</Button> }
                        </DistributedFormLine>
                        <MergedFormLine>
                            <Button onClick={close}>Cancel</Button>
                        </MergedFormLine>
                    </FormTable>
                    </div>
            </div>;
}

export { AddonInstallationDialog };
