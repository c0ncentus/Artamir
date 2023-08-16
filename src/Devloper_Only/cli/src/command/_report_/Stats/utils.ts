import { isBetweenNum, arrNumToIntervall, prctFrom, mean } from "@lord_ts/core";
import { TypeModule, dependiesPackageJson } from "@lord_ts/directory_local";
import { MetadataDefTestsFunc, TestResult } from "@lord_ts/test";
import { sortBy, flatten, sum, compact, cloneDeep } from "lodash";
import { DocGenType, TsEntityStats, FileStats, PackStats, GlobalStatsReport, FilesStats, PacksStats, ReportLine } from "../../../model";
import { IPackageJson } from "@lord_ts/file";
import { INIT_STATS } from "./CONST";

type CategReportStats = any;
type CategReportName= string
export function categValue(arr: CategReportStats, value: number): string {
    return arr.types.find((x, i, arr) => {
        return isBetweenNum(
            value, [
            i === 0 ? 0 : arr[i - 1].size,
            i === arr.length - 1 ? Number.MAX_SAFE_INTEGER : x.size
        ])
    }).categ
}


function evaluateJSDoc(jsDoc: any[]) {
    const MUST_HAVE = ["date", "returns", "remarks"];
    const BONUS = ["see"];
    const JS_DOC = jsDoc[0];
    const TAGS = JS_DOC.tags.map((tag) => tag.tagName.replace("\r", "").replace("@", ""))
    return prctFrom(
        (
            (TAGS.filter(x => MUST_HAVE.includes(x)).length)
            + (TAGS.filter(x => BONUS.includes(x)).length) / 2
        )
        , MUST_HAVE.length)
}
function evaluateTests(tests: {
    metadata: MetadataDefTestsFunc;
    fail: TestResult[];
    pass: TestResult[];
}) {
    return tests === undefined
        || tests.metadata === undefined
        || tests.metadata.totalPathCase === undefined
        || tests.metadata.numPathCase === undefined
        || tests.metadata.numPathCase.total === undefined
        ? 0
        : prctFrom(tests.metadata.numPathCase.total, tests.metadata.totalPathCase)

}

function coverageStats(jsDoc: any, tests: any) {
    const COND_JSDOC = (jsDoc === undefined) || Array.isArray(jsDoc) === false;
    let cov = { doc: 0, test: 0 }
    if (COND_JSDOC === false) { cov.doc = evaluateJSDoc(jsDoc) }
    if (cov.doc === null) { cov.doc = 0 }
    if (tests !== undefined) { cov.test = evaluateTests(tests) }
    if (cov.test === null) { cov.test = 0 }
    return cov
}

function orderTestsResult(tests: { metadata: MetadataDefTestsFunc; fail: TestResult[]; pass: TestResult[]; }) {
    return tests === undefined || (tests.fail === undefined && tests.pass === undefined)
        ? []
        : tests.fail !== undefined && tests.pass !== undefined
            ? sortBy([...tests.fail, ...tests.pass], (e => e.info.order))
            : tests.fail === undefined
                ? sortBy(tests.pass, (e => e.info.order))
                : sortBy(tests.pass, (e => e.info.order))
}


export function docFileIntoStats(packname: string, filename: string, x: DocGenType, type: TypeModule) {
    const { name, numComplexity, code, jsDoc, tests } = x;
    return {
        file: filename, pack: packname, name,
        stats: {
            cyclo: numComplexity === undefined || numComplexity === null ? 0 : numComplexity,
            type,
            coverage: coverageStats(jsDoc, tests),
            tests: orderTestsResult(tests).map(e => e.isPassed)
        }
    } as TsEntityStats
}

export function buildFileFromEntities(filename: string, packname: string, line: ReportLine, items: TsEntityStats[]): FileStats {
    const CYCLO = compact(items.map(e => e.stats.cyclo));
    const TESTS = items.map(x => x.stats.tests);
    const TOTAL = flatten(TESTS).length;
    const COVERAGE = items.map(x => x.stats.coverage);
    const ENTITIES = cloneDeep({
        class: items.filter(e => e.stats.type === "class").length,
        func: items.filter(e => e.stats.type === "function").length,
        other: items.filter(e => e.stats.type === "identifier" || e.stats.type === "unknown" || e.stats.type === "namespace" || e.stats.type === "module").length,
        type: items.filter(e => e.stats.type === "type").length,
        var: items.filter(e => e.stats.type === "variable").length
    })
    return {
        name: filename,
        pack: packname,
        have: {
            line: line === undefined ? INIT_STATS.line : line,
            coverage: { doc: mean(COVERAGE.map(x => x.doc)), test: mean(COVERAGE.map(x => x.test)) },
            cyclo: CYCLO.length === 0 ? INIT_STATS.cyclo : { interval: arrNumToIntervall(CYCLO), mean: mean(CYCLO) },
            tests: {
                pass: flatten(TESTS.map(e => e.filter(x => x === true))).length,
                total: TOTAL,
                mean: mean(TESTS.map(x => x.length).filter(x => x !== 0))
            },
            tsEntities: ENTITIES
        },
        parent: INIT_STATS,
        totalOf: { entities: sum([ENTITIES.class, ENTITIES.var, ENTITIES.type, ENTITIES.other, ENTITIES.func]) }
    }
}

// Im a file and do 
export function buildFileFromPack(fileStat: FileStats, item: PackStats): FileStats {
    const { coverage, cyclo, line, tests, tsEntities } = item.have;
    return {
        ...fileStat,
        parent: {
            coverage: { doc: prctFrom(fileStat.have.coverage.doc, coverage.doc), test: prctFrom(fileStat.have.coverage.test, coverage.test) },
            cyclo: { interval: [0, 0], mean: prctFrom(fileStat.have.cyclo.mean, cyclo.mean) },
            line: { blank: prctFrom(fileStat.have.line.blank, line.blank), code: prctFrom(fileStat.have.line.code, line.code), comment: prctFrom(fileStat.have.line.comment, line.comment) },
            tests: { mean: prctFrom(fileStat.have.tests.mean, tests.mean), pass: prctFrom(fileStat.have.tests.pass, tests.pass), total: prctFrom(fileStat.have.tests.total, tests.total) },
            tsEntities: {
                class: prctFrom(fileStat.have.tsEntities.class, tsEntities.class),
                func: prctFrom(fileStat.have.tsEntities.func, tsEntities.func),
                other: prctFrom(fileStat.have.tsEntities.other, tsEntities.other),
                type: prctFrom(fileStat.have.tsEntities.type, tsEntities.type),
                var: prctFrom(fileStat.have.tsEntities.var, tsEntities.var)
            }

        },
    }
}


export function buildPackFromGlobal(packStat: PackStats, item: GlobalStatsReport): PackStats {
    const { coverage, cyclo, line, tests, tsEntities } = item.main;
    return {
        ...packStat,
        parent: {
            coverage: { doc: prctFrom(coverage.doc, coverage.doc), test: prctFrom(coverage.test, coverage.test) },
            cyclo: { interval: [0, 0], mean: prctFrom(packStat.have.cyclo.mean, cyclo.mean) },
            line: { blank: prctFrom(packStat.have.line.blank, line.blank), code: prctFrom(packStat.have.line.code, line.code), comment: prctFrom(packStat.have.line.comment, line.comment) },
            tests: { mean: prctFrom(packStat.have.tests.mean, tests.mean), pass: prctFrom(packStat.have.tests.pass, tests.pass), total: prctFrom(packStat.have.tests.total, tests.total) },
            tsEntities: {
                class: prctFrom(packStat.have.tsEntities.class, tsEntities.class),
                func: prctFrom(packStat.have.tsEntities.func, tsEntities.func),
                other: prctFrom(packStat.have.tsEntities.other, tsEntities.other),
                type: prctFrom(packStat.have.tsEntities.type, tsEntities.type),
                var: prctFrom(packStat.have.tsEntities.var, tsEntities.var)
            }
        },
    }
}

export function buildPackStatsFromFiles(packName: string, items: FilesStats, pack: IPackageJson): PackStats {
    const LINES = compact(items.map(e => e.have.line));
    const COVERAGE = items.map(x => x.have.coverage);
    const CYCLO = items.map(x => x.have.cyclo).filter(x => x.mean !== 0);
    const TS_ENTITIES = items.map(e => e.have.tsEntities);
    const TESTS = items.map(e => e.have.tests);
    const PACKS_PACK = dependiesPackageJson(pack);
    const PACK_NUM = { dev: PACKS_PACK.dev.length, optional: PACKS_PACK.opt.length, peer: PACKS_PACK.peer.length, prod: PACKS_PACK.prod.length }
    return {
        name: packName,
        have: {
            line: { blank: sum(LINES.map(e => e.blank)), code: sum(LINES.map(e => e.code)), comment: sum(LINES.map(e => e.comment)) },
            coverage: { doc: mean(COVERAGE.map(x => x.doc)), test: mean(COVERAGE.map(x => x.test)) },
            cyclo: CYCLO.length === 0
                ? INIT_STATS.cyclo
                : { interval: [Math.min(...CYCLO.map(e => e.interval[0])), Math.max(...CYCLO.map(e => e.interval[1]))], mean: mean(CYCLO.map(x => x.mean)) },
            tests: { pass: sum(TESTS.map(x => x.pass)), total: sum(TESTS.map(x => x.total)), mean: mean(TESTS.map(x => x.mean).filter(y => y !== 0)) },
            tsEntities: {
                class: sum(TS_ENTITIES.map(e => e.class)),
                func: sum(TS_ENTITIES.map(e => e.func)),
                other: sum(TS_ENTITIES.map(e => e.other)),
                type: sum(TS_ENTITIES.map(e => e.type)),
                var: sum(TS_ENTITIES.map(e => e.var))
            }
        },
        parent: INIT_STATS,
        totalOf: {
            entities: sum(items.map(x => x.totalOf.entities)),
            files: items.length,
            npmPacks: { ...PACK_NUM, total: PACK_NUM.dev + PACK_NUM.optional + PACK_NUM.peer + PACK_NUM.prod }
        }
    }
}

export function buildGlobalResult(packs: PacksStats): GlobalStatsReport {
    const LINES = packs.map(e => e.have.line);
    const COVERAGE = packs.map(x => x.have.coverage);
    const CYCLO = packs.map(x => x.have.cyclo).filter(x => x.mean !== 0);
    const TS_ENTITIES = packs.map(e => e.have.tsEntities);
    const TESTS = packs.map(e => e.have.tests);
    const PACK = packs.map(e => e.totalOf.npmPacks)
    const PACKS_SUM = { dev: sum(PACK.map(e => e.dev)), optional: sum(PACK.map(e => e.optional)), peer: sum(PACK.map(e => e.peer)), prod: sum(PACK.map(e => e.prod)) };



    const ENTITIES = {
        class: sum(TS_ENTITIES.map(e => e.class)),
        func: sum(TS_ENTITIES.map(e => e.func)),
        other: sum(TS_ENTITIES.map(e => e.other)),
        type: sum(TS_ENTITIES.map(e => e.type)),
        var: sum(TS_ENTITIES.map(e => e.var))
    };
    return {
        main: {
            line: { blank: sum(LINES.map(e => e.blank)), code: sum(LINES.map(e => e.code)), comment: sum(LINES.map(e => e.comment)) },
            coverage: { doc: mean(COVERAGE.map(x => x.doc)), test: mean(COVERAGE.map(x => x.test)) },
            cyclo: CYCLO.length === 0 ? INIT_STATS.cyclo : { interval: [Math.min(...CYCLO.map(e => e.interval[0])), Math.max(...CYCLO.map(e => e.interval[1]))], mean: mean(CYCLO.map(x => x.mean)) },
            tests: { pass: sum(TESTS.map(x => x.pass)), total: sum(TESTS.map(x => x.total)), mean: mean(TESTS.map(x => x.mean)) },
            tsEntities: ENTITIES
        },
        totalOf: {
            entities: sum(packs.map(e => e.totalOf.entities)),
            files: sum(packs.map(e => e.totalOf.files)),
            packages: packs.length,
            npmPacks: { ...PACKS_SUM, total: sum([PACKS_SUM.dev, PACKS_SUM.optional, PACKS_SUM.peer, PACKS_SUM.prod]) }
        }

    }
}