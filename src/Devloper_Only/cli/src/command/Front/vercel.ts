import { foldersIn, readFile, writeJson } from "@lord_ts/directory_local";
import { IPackageJson } from "@lord_ts/file";
import { BigRepoProj } from "../../model";
import { pathBigProj } from "../../CONST";
const PATH_PCK_REF = "./package.json"

const PATH_ASSETS_SRC = (bigProj: BigRepoProj, subDir: string) => `${pathBigProj(bigProj)}\\temp\\commun\\${subDir}`
const PATH_ASSETS_PROJ_DEST = (big: BigRepoProj, proj: string, subFolder: string) => `${pathBigProj(big)}/${subFolder}\\${proj}\\public\\Css`
const PATH_PACKAGE_PROJ = (big: BigRepoProj, proj: string, subFolder: string) => `${pathBigProj(big)}/${subFolder}/${proj}/package.json`



export function vercelDevMode(big: BigRepoProj, subFolder: string, excludeFolder?: string[]) {
    foldersIn(subFolder).filter(x => excludeFolder == undefined || excludeFolder.includes(x) === false).forEach((e) => {
        let LOCAL_PACKAGE = readFile(PATH_PACKAGE_PROJ(big, e, subFolder)) as IPackageJson
        LOCAL_PACKAGE.devDependencies = {};
        LOCAL_PACKAGE.dependencies = {};
        writeJson(PATH_PACKAGE_PROJ(big, e, subFolder), LOCAL_PACKAGE)
    })
}

export function vercelProdMode(big: BigRepoProj, subFolder: string, excludeFolder?: string[]) {
    const readPackageRef = readFile(PATH_PCK_REF) as IPackageJson;
    foldersIn(subFolder).filter(x => excludeFolder === undefined || excludeFolder.includes(x) === false).forEach((e) => {
        let LOCAL_PACKAGE = readFile(PATH_PACKAGE_PROJ(big, e, subFolder)) as IPackageJson;
        LOCAL_PACKAGE.devDependencies = readPackageRef.devDependencies
        LOCAL_PACKAGE.dependencies = readPackageRef.dependencies
        writeJson(PATH_PACKAGE_PROJ(big, e, subFolder), LOCAL_PACKAGE);
    })
}