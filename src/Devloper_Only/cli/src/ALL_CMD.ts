import { vercelProdMode, vercelDevMode } from "./command"
import { scriptBuildMonoRepo } from "./command/pack"
import { CmdCli } from "./model"

// { pack: "repository", subject: "build", specificTo: "Lord_ts_Monorepo", command: buildMonoRepo(PATH_MONO_REPO.lordTs) },
// {
//     pack: "repository", subject: "build", specificTo: "Lord_ts_Repo", command: buildRepoInMonorrepo, transfoToFunc: (obj: any) => { return [obj.folder] },
//     form: [{ type: 'text', name: 'folder', message: "repository's name ?" }],
// },
// rebuildAssets
// normalizeJSON
//aelfMass


// build && rebuild
export const CUSTOM_SCRIPT: CmdCli[] = [
    { pack: "build", subject: "vercel_atalante", specificTo: "prod_package", command: () => { vercelProdMode("atalante", "app",) } },
    { pack: "build", subject: "vercel_atalante", specificTo: "dev_package", command: () => { vercelDevMode("atalante", "app",) } },
    // { pack: "docs", subject: "TsCode", specificTo: "lord", command: () => writeJson(PATH_MONO_REPO.lordTs, docMonoRepo(PATH_MONO_REPO.lordTs, "package", ["cli", "_Test_", "scrap"])) },
    // { pack: "build", subject:"monorepo_package", specificTo:"atalante", command:()=>scriptBuildPackInMonorepo("atalante", "app","")},
    // { pack: "build", subject:"monorepo_package", specificTo:"lordTs", command:()=>scriptBuildPackInMonorepo("lordTs", "package","x")},
    { pack: "build", subject:"monorepo", specificTo:"lordTs", command:()=>scriptBuildMonoRepo("lordTs", "package")},
    { pack: "build", subject:"monorepo", specificTo:"atalante", command:()=>scriptBuildMonoRepo("atalante", "app")},
]


export const CUSTOM_COMMAND: CmdCli[] = [
    { pack: "info", subject: "version", specificTo: "all", command: "lord info version node && lord info version npm && lord info version firefox && lord info version window && lord info version python && lord info version java" },
]

export const COMMAND_LIST: CmdCli[] = [
    { pack: "starter", subject: "Package_in_Monorepo", specificTo: "Lord_Ts_package", command: `git clone --branch package_in_monorepo https://github.com/c0ncentus/starters.git` },
    { pack: "starter", subject: "app", specificTo: "cra", command: "npx create-react-app <app>", form: [{ type: 'text', name: 'app', message: "what is app's name ?" }] },
    { pack: "starter", subject: "app", specificTo: "cra_tsx", command: "npx create-react-app <app> --template typescript", form: [{ type: 'text', name: 'app', message: "what is app's name ?" }] },
    { pack: "info", subject: "version", specificTo: "node", command: "node -v" },
    { pack: "info", subject: "version", specificTo: "npm", command: "npm -v" },
    { pack: "info", subject: "version", specificTo: "firefox", command: "cd C:\\Program Files\\Mozilla Firefox && firefox -v" },
    { pack: "info", subject: "version", specificTo: "window", command: "slmgr /dlv" },
    { pack: "info", subject: "version", specificTo: "python", command: "python -V" },
    { pack: "info", subject: "version", specificTo: "java", command: "java -version" },

    { pack: "clean", subject: "repo", specificTo: "build", command: "del-cli dist && del-cli *.tsbuildinfo" },
    { pack: "clean", subject: "monorepo", specificTo: "build", command: "del-cli package/**/dist && del-cli **/*.tsbuildinfo" },
    { pack: "package", subject: "update", specificTo: "monorepo", command: "npm update && npm-upgrade-monorepo -w package/*" },
    { pack: "package", subject: "update", specificTo: "repo", command: "npm update" },



    { pack: "docs", subject: "complexity", specificTo: "_", command: "codemetrics-cli --deep --threshold 1 > complexity.txt" },
    { pack: "docs", subject: "audit", specificTo: "repo_npm", command: "npm audit --json > npm.json" },
    { pack: "docs", subject: "audit", specificTo: "monorepo_lord_npm", command: `npm audit --json -ws "package/*" > npm.json` },
    // {pack:"docs", subject:"audit", specificTo:"monorepo_atalante_npm", command:"npm audit --json -w package > npm.json"},

]




export const ALL_COMMAND_V2: CmdCli[] = [
    ...CUSTOM_SCRIPT.map(e => { return { ...e, type: "script" as "script" | "cmd" | "custom" } }),
    ...COMMAND_LIST.map(e => { return { ...e, type: "cmd" as "script" | "cmd" | "custom" } }),
    ...CUSTOM_COMMAND.map(e => { return { ...e, type: "custom" as "script" | "cmd" | "custom" } })
]