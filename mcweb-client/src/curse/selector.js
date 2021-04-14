import { useRef, useState } from "react";
import Input from "../component/ui/input/text";
import Button from "../component/ui/button/button";
import { AddonsList } from "./list";
import styles from "./selector.module.css";


function AddonSelectFooter({page, setPage}) {
    return  <div className={styles.footer}>
                <PaginatorButtons page={page} setPage={setPage} />
            </div>
}


function PaginatorButtons({page, setPage}) {
    return  <div className={styles.paginator}>
                <Button disabled={page === 0} onClick={() => setPage(page - 1)}>⮜</Button>
                <Button onClick={() => setPage(0)}>⭮</Button>
                <Button onClick={() => setPage(page + 1)}>⮞</Button>
            </div>
}


function SearchBar({search, hideIncompatible, setHideIncompatible}) {

    let searchText = "";

    const searchBar = useRef(null);

    function toggleHideIncomcatible() {
        setHideIncompatible(!hideIncompatible);
    }

    return  <div className={styles.search}>
                <Button style={{marginRight: "3px"}} onClick={() => {search(""); searchBar.current.value = ""}} noMargin>×</Button>
                <Input
                    onChange={(e) => {searchText = e.currentTarget.value}}
                    placeholder="Search Mods"
                    type="text"
                    style={{flexGrow: "1"}}
                    onKeyDown={(e) => { if (e.key === "Enter") search(searchText); }}
                    ref={searchBar}
                />
                <Button onClick={() => search(searchText)} noMargin>
                    <span style={{fontSize: ".875em", marginRight: ".125em", position: "relative", top: "-.1em", left: "-.125em"}}>
                        🔍
                    </span>
                </Button>
                <Button style={{color: hideIncompatible ? "red" : "var(--font)"}} onClick={toggleHideIncomcatible} noMargin>
                    <span style={{fontSize: ".875em", marginRight: "-.3em", position: "relative", top: "-.16em", left: "-.125em"}}>
                        ✗
                    </span>
                </Button>
            </div>
}


function AddonSelectHeader({search, hideIncompatible, setHideIncompatible}) {
    return  <div className={styles.head}>
                <SearchBar search={search} hideIncompatible={hideIncompatible} setHideIncompatible={setHideIncompatible} />
            </div>;
}


function AddonSelector({currentServer, page, setPage, setSearch, addons, setLoadingText, setLoaded}) {

    const [hideIncompatible, setHideIncompatible] = useState(true);
    
    return  <div className={styles.selector}>
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

export { AddonSelector };
