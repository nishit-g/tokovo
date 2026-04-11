import { createTokovoRuntime, getSharedTokovoRuntime, resolveCatalogProfile, } from "@tokovo/episodes";
function getVideoRunnerCatalogProfile() {
    return resolveCatalogProfile(process.env.TOKOVO_EPISODE_CATALOG_PROFILE, "studio");
}
export function createVideoRunnerRuntime() {
    return createTokovoRuntime(getVideoRunnerCatalogProfile());
}
export function getSharedVideoRunnerRuntime() {
    return getSharedTokovoRuntime(getVideoRunnerCatalogProfile());
}
