import { IPackageJson } from "@lord_ts/file";
import { BigRepoProj } from "./model";
export const CONFIG_COMMAND_IMPERATOR = {
    name: 'lord',
    description: `One CLI to rule them all, One CLI to find them,
One CLI to bring them all and in the darkness bind them

--Dev oriented--
`,
    version: '0.4.6'
}

export const IMPERATOR_CMD = "lord "; export const CMD_EXEC = "lord exec> "
export const PATH_MONO_REPO = { lordTs: "C:/WORKBRENCH/lord_ts", atalante: "C:/WORKBRENCH/atalante" } as const;
export const URL_DISCORD = "https://discord.com/api/webhooks/1096916158034215002/ABi1OR381H-OGVAZ2HHmzwIZrKt9j0yJkpaEoVLtxsax7KsLnFzIW04vTyEyKgwB_3uU"


export const TEST_REPORT = "test.json"; export const LINES_PROJ_REPORT = "lines.json"; export const COMPLEXITY_REPORT = "complexity.json";
export const DOC_TS_REPORT = "ts.json"; export const NPM_REPORT = "npm.json"
export const FINAL_MIXED_REPORT = "mixed.json"; export const STATS_FILE = "stats.json";
export const ALL_REPORT_FILES = [TEST_REPORT, DOC_TS_REPORT, LINES_PROJ_REPORT, COMPLEXITY_REPORT, NPM_REPORT] as const;


export function pathBigProj(proj: BigRepoProj, ext?: "report" | "") { return `${PATH_MONO_REPO[proj]}${ext === undefined ? "" : ext === "report" ? "\\docs\\report\\" : ""}` }




// function reBuildAssets(subFolder: string, excludeFolder?: string[]) {
//     foldersIn(subFolder).filter(x => excludeFolder !== undefined || excludeFolder.includes(x) === false).forEach((e) => {
//         if (existsSync(PATH_ASSETS_PROJ_DEST(e, subFolder)) === true) { rmdirSync(PATH_ASSETS_PROJ_DEST(e, subFolder), { recursive: true }); }
//         if (existsSync(PATH_ASSETS_PROJ_DEST(e, subFolder)) === false) { mkdirSync(PATH_ASSETS_PROJ_DEST(e, subFolder)) }
//         cpSync(PATH_ASSETS_SRC("Css"), PATH_ASSETS_PROJ_DEST(e, subFolder), { recursive: true, force: true });

//         //html
//     })
// }



function normalizePackageJson() {
    const normaPack: IPackageJson = {
        author: { name: "c0ncentus", email: "jeremymartin33610@gmail.com", url: "https://github.com/c0ncentus" },
        browser: "",
        engines: {
            node: "v20.0.1",
            npm: "v9.6.6"
        },
        description: "",
        homepage: "",
        main: "dist/index.js",
        version: "0.0.0",
        keywords: [],

        license: "MIT",
        "bugs": {
            "email": "jeremymartin33610@gmail.com",
            "url": "https://github.com/c0ncentus"
        },
        "files": [
            "dist"
        ],
        name: ""
    }

}


