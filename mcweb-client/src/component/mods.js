import AddonSelector from "../curse/curse";


function ModView({currentServer}) {
    // 12: Texture Packs, 4471: Modpacks, 6: Mods, 17: Worlds
    return  <div id="page-content">
                <h1 id="page-headline">Mods</h1>
                <AddonSelector sectionId={6} currentServer={currentServer} />
            </div>
}

export default ModView;
