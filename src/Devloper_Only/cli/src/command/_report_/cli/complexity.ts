import { readFile, writeJson } from "@lord_ts/directory_local";
import { compact } from "lodash";
import { COMPLEXITY_REPORT, pathBigProj } from "../../../CONST";
import { BigRepoProj } from "../../../model";
export function buildComplexity(repo: BigRepoProj, ext: string[], exclude: string[] = []) {
    const BASE= pathBigProj(repo)
    const BASE_REPO= pathBigProj(repo,"report")
    const TXT = readFile(BASE_REPO + "complexity.txt") as string
    const LINES =compact(TXT.split("\n")).filter(x => (
        (ext.length === 0 || ext.some(y => new RegExp(y).test(x)))
        && (exclude.length === 0 || exclude.some(y => new RegExp(y).test(x)) === false)
    )).map(e=>e.replace(BASE+"/",""));

    let obj = compact(LINES.map((path) => {
        const LINE = /\d+$/.exec(path);
        const NUM_CYCLO = /^\d+/.exec(path);
        const PATH = path.replace(/^\d+ /, "").replace(/\d+$/, "").replace(/\:$/, "");
        return LINE === null && NUM_CYCLO === null ? undefined : {
            line: LINE === null ? undefined : parseInt(LINE[0]),
            path: PATH,
            numComplex: NUM_CYCLO === null ? undefined : parseInt(NUM_CYCLO[0])
        }
    }));
    writeJson(BASE_REPO + COMPLEXITY_REPORT, obj)
}
buildComplexity("lordTs", [".js", ".jsx", ".ts", ".tsx"], [".spec.ts", ".spec.tsx", ".spec.js", ".spec.jsx", "/dist/"])