import AddonSelector from "../curse/curse";


function ModView({currentServer}) {
    return  <div id="page-content">
                <h1 id="page-headline">Mods</h1>
                <AddonSelector sectionId={6} currentServer={currentServer} />
            </div>
}

export default ModView;
