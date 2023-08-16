import { writeJson, docMonoRepo, readFile, ModuleTree } from "@lord_ts/directory_local"
import { DOC_TS_REPORT, PATH_MONO_REPO, pathBigProj } from "../../../CONST"
import { BigRepoProj } from "../../../model"
import { cloneDeep } from "lodash"

const WIP = ["endpointV3", "endpoint", "gameUtils"]
const OTHER = [
    // "geoBorder", "geoCoord", "color", "id", "license", "measure", "math", "file", "eventListener", "request", "schema", "window", "test",
    // "semvers", "node", "meta", "gamePgn", "geoArea", "gameFen", "gameDice", "rank", "range","cron", "api", "anthropos", "range",
    // "random", "gamePiece", "directory_local", "core", "numPhone", 
    // "device"
]
function buildTsCode(big: BigRepoProj) {
    writeJson(pathBigProj(big, "report") + DOC_TS_REPORT,
        docMonoRepo(PATH_MONO_REPO.lordTs, "package",
            ["cli", "_Test_", "scrap", ...WIP, ...OTHER]
        )
    )
}

function updatepath(big: BigRepoProj) {
    const BASE = pathBigProj(big);
    const TS_DOC = (readFile(pathBigProj(big, "report") + DOC_TS_REPORT) as [moduleName: string, moduleTree: ModuleTree][]).map(e => {
        return [
            e[0],
            e[1].map(r => {
                const DECLA = Array.isArray(r.declarations) 
                ? r.declarations.map(t => { return cloneDeep({ ...t, file: t.file.replace(BASE + "/", "") }) }) 
                : {...r.declarations,file:r.declarations.file.replace(BASE + "/", "") };

                return cloneDeep({ ...r, declarations: DECLA })
            })
        ]
    });
    writeJson(pathBigProj(big, "report") + DOC_TS_REPORT, TS_DOC)
}


buildTsCode("lordTs")
updatepath("lordTs")

