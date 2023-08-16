import { ModuleTree, TypeModule, filesIn, getPacks, readFile, writeJson } from "@lord_ts/directory_local"
import { FileTestResult } from "@lord_ts/test";
import { compact, uniq, flatten, cloneDeep } from "lodash";
import { buildPackageAnalys } from "./pack";
import { PATH_MONO_REPO, ALL_REPORT_FILES, FINAL_MIXED_REPORT, TEST_REPORT, DOC_TS_REPORT, LINES_PROJ_REPORT, COMPLEXITY_REPORT, pathBigProj, NPM_REPORT } from "../../../CONST";
import { ComplexityReport, DocGenType, ReportLinesPerFile, GlobalLinesPerFileOutput, FinalBundleMixinResult, DocFile, BigRepoProj } from "../../../model";
import { INIT_STATS } from "../Stats/CONST";


function filterModuleByType(moduleTree: ModuleTree, type: TypeModule | TypeModule[]) {
    if (typeof type === "string") { return moduleTree.filter(x => Array.isArray(x.declarations) ? x.declarations.some(y => y.type === type) : x.declarations.type === type) }
    else { return moduleTree.filter(x => Array.isArray(x.declarations) ? x.declarations.some(y => type.includes(y.type)) : type.includes(x.declarations.type)) }
}

function fetchModuleByType(moduleTree: ModuleTree, type: TypeModule | TypeModule[], TEST_BY_FUNC: FileTestResult, COMPLEXITY?: ComplexityReport): DocGenType[] {
    const declaration = filterModuleByType(moduleTree, type).map(x => Array.isArray(x.declarations) ? { name: x.name, ...x.declarations[0] } : { name: x.name, ...x.declarations })

    return declaration.map((e) => {
        const { code, jsDoc, name, file, line } = e;
        const res = TEST_BY_FUNC === undefined ? undefined : TEST_BY_FUNC.funcs.find(x => x.name === name);
        const NUM_COMPLEXITY = COMPLEXITY === undefined ? undefined : COMPLEXITY.find(x => x.path === file && x.line === line[0]);
        return { name, code, numComplexity: NUM_COMPLEXITY === undefined ? undefined : NUM_COMPLEXITY.numComplex, jsDoc: Array.isArray(jsDoc) && jsDoc.length === 0 ? undefined : jsDoc, tests: cloneDeep(res === undefined ? undefined : { fail: res.fail, metadata: res.metadata, pass: res.pass }) }
    })
}

function filterResultTestByPackage(pack: string, tests: FileTestResult[]) { return tests.filter(x => x.name === pack || new RegExp(`^${pack}/`).test(x.name)) }


function fetchLinesOnFile(file: string, linesReport: ReportLinesPerFile) {
    const RESULT = linesReport[file];
    if (RESULT === undefined) { console.log(file) }
    return RESULT === undefined ? INIT_STATS.line : { blank: RESULT.blank, code: RESULT.code, comment: RESULT.comment }
}

function summerizeLineCode(linesReport: ReportLinesPerFile, pack?: string): GlobalLinesPerFileOutput {
    const paths = pack === undefined ? Object.keys(linesReport) : Object.keys(linesReport).filter(x => new RegExp(`package/${pack}`).test(x))
    let ALL_KEY = {} as any;
    paths.forEach((e) => {
        const { blank, code, comment, language } = linesReport[e]
        if (ALL_KEY[language] === undefined) { ALL_KEY[language] = { code: 0, blank: 0, comment: 0 } }
        ALL_KEY[language].code = ALL_KEY[language].code + code
        ALL_KEY[language].comment = ALL_KEY[language].comment + comment
        ALL_KEY[language].blank = ALL_KEY[language].blank + blank
    })
    return ALL_KEY
}


export function searchPack(value: string, packs: { npm: string, folder: string }[]): { npm: string, folder: string } {
    if (/\//.test(value)) {
        const arr = value.split("/");
        const INDEX = arr.indexOf('src')
        return packs.find(x => x.folder === arr[INDEX === -1 ? arr.indexOf('package') + 1 : INDEX - 1])
    }
    let findSolve = packs.find(x => x.folder === value);
    if (findSolve !== undefined) { return findSolve }
    findSolve = packs.find(x => x.npm === value);
    if (findSolve !== undefined) { return findSolve }
}

function mergeAllReport(
    nameMonoRepo: string,
    tests: FileTestResult[],
    docResult: [moduleName: string, moduleTree: ModuleTree][],
    linesReport: ReportLinesPerFile,
    complexytyReport: ComplexityReport,
    npmReport: any
): FinalBundleMixinResult {
    const PACKS = getPacks(PATH_MONO_REPO.lordTs, "package")
    return {
        monoRepo: buildPackageAnalys(nameMonoRepo, npmReport),
        code: {
            inside: docResult.map(([namePack, mod]) => {
                const FILES = compact(uniq(flatten(mod.map((e) => Array.isArray(e.declarations) ? e.declarations.map(f => f.file) : e.declarations.file))));
                let TEMP = filterResultTestByPackage(namePack, tests);
                let TEST_BY_PACKAGE: FileTestResult = TEMP.length === 0 ? undefined : TEMP.length === 1 ? TEMP[0] : { name: TEMP[0].name.replace(/\/\w+$/, ""), funcs: flatten(TEMP.map(e => e.funcs)) }

                return {
                    packName: namePack,
                    files: FILES.map((file) => {
                        const TS_DOC_BY_FILE = mod.filter(x => { return Array.isArray(x.declarations) ? x.declarations.some(y => y.file === file) : x.declarations.file === file })
                        const FILENAME = /\w+\.(\w+\.{0,})?\w+$/.exec(file)[0];

                        return {
                            filename: FILENAME,
                            dirs: file.replace(FILENAME, "").replace(/^.+\/src\//gmi, ""),
                            statFile: fetchLinesOnFile(file, linesReport),


                            func: fetchModuleByType(TS_DOC_BY_FILE, "function", TEST_BY_PACKAGE, complexytyReport),
                            class: fetchModuleByType(TS_DOC_BY_FILE, "class", TEST_BY_PACKAGE, complexytyReport),
                            var: fetchModuleByType(TS_DOC_BY_FILE, "variable", TEST_BY_PACKAGE, complexytyReport),
                            other: fetchModuleByType(TS_DOC_BY_FILE, ["namespace", "identifier", "module", "unknown"], TEST_BY_PACKAGE),
                            type: fetchModuleByType(TS_DOC_BY_FILE, "type", TEST_BY_PACKAGE),
                            interface: fetchModuleByType(TS_DOC_BY_FILE, "interface", TEST_BY_PACKAGE),
                        } as DocFile
                    }) as DocFile[],
                    lines: summerizeLineCode(linesReport, searchPack(namePack, PACKS).folder)
                }
            }),
            lines: summerizeLineCode(linesReport)
        }
    }
}

export function buildMixinReport(big: BigRepoProj) {
    const BASE_URL_REPORT = pathBigProj(big, "report")
    const FILES = filesIn(BASE_URL_REPORT);
    if (ALL_REPORT_FILES.every(x => FILES.includes(x)) === false) { throw new Error("Incomplet Process !"); };

    writeJson(`${BASE_URL_REPORT}${FINAL_MIXED_REPORT}`,
        mergeAllReport("lord_ts",
            readFile(`${BASE_URL_REPORT}${TEST_REPORT}`) as any,
            readFile(`${BASE_URL_REPORT}${DOC_TS_REPORT}`) as any,
            readFile(`${BASE_URL_REPORT}${LINES_PROJ_REPORT}`) as any,
            readFile(`${BASE_URL_REPORT}${COMPLEXITY_REPORT}`) as any,
            readFile(`${BASE_URL_REPORT}${NPM_REPORT}`) as any
        )
    )
}

buildMixinReport("lordTs")
