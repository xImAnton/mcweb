import axios from "axios";

export function getApiBase() {
    return window.location.protocol + "//" + window.location.host + "/curseforge";
}

function getAddons(sectionId, page, search) {
    return axios.get(getApiBase() + "/addon/search?gameId=432&sectionId=" + sectionId + "&pageSize=25&index=" + (page * 25) + (search ? "&searchFilter=" + encodeURIComponent(search) : ""));
}

function getFiles(projectId) {
    
}

export { getAddons };
