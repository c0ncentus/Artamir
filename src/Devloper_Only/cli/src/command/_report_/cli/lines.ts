import { readFile, slashPath, foldersIn, writeJson } from "@lord_ts/directory_local";
import { BigRepoProj } from "../../../model";
import { LINES_PROJ_REPORT, pathBigProj } from "../../../CONST";

export function buildReportLines(repo: BigRepoProj, ext: string[]) {
    const EXT = ext.map(e => "." + e);
    const BASE = pathBigProj(repo);
    let JSON = readFile(slashPath(BASE) + ".VSCodeCounter/" + foldersIn(".VSCodeCounter")[0] + "/results.json")

    let obj = {} as any;
    const TEST = Object.keys(JSON)
        .filter(x =>
            /\.spec\./.test(x) === false
            && EXT.some(y => new RegExp(`${y}$`).test(x))
        )
        .forEach((k) => { obj[k.replace("file:///c%3A/", "C:/").replace(BASE + "/", "")] = JSON[k] })
    writeJson(pathBigProj(repo, "report") + LINES_PROJ_REPORT, obj)
}

buildReportLines("lordTs", ["js", "jsx", "ts", "tsx"])