import { allPackInMonoRepo, dependiesPackageJson, getPacks, readFile, writeJson } from "@lord_ts/directory_local"

import { cloneDeep, compact, uniq } from "lodash";
import { buildFileFromEntities, buildFileFromPack, buildGlobalResult, buildPackFromGlobal, buildPackStatsFromFiles, docFileIntoStats } from "./utils";
import { FINAL_MIXED_REPORT, STATS_FILE, pathBigProj } from "../../../CONST";
import { BigRepoProj, FilesStats, FinalBundleMixinResult, PacksStats, ReportNpmAudit, ResultStats, TsEntityStats } from "../../../model";
import { IPackageJson } from "@lord_ts/file";
import { prctFrom } from "@lord_ts/core";



// mean of all cyclo !==0
// the same for the tests 




function npmAuditGlobalToPack(npmGlobal: ReportNpmAudit, pack: IPackageJson): { have: ReportNpmAudit, parent: ReportNpmAudit } {

    const HAVE = dependiesPackageJson(pack)
    let TOTAL = [] as {
        name: string;
        v: string;
    }[]

    Object.keys(HAVE).forEach((e) => { TOTAL.push(HAVE[e]) })
    TOTAL = uniq(compact(TOTAL));
    const ALL_TOTAL_NAMES = TOTAL.map(e => e.name);
    const have = {
        dependencies: { total: TOTAL.length, dev: HAVE.dev.length, optional: HAVE.opt.length, peer: HAVE.peer.length, prod: HAVE.prod.length },
        vulnerabilities: npmGlobal.vulnerabilities !== undefined ? npmGlobal.vulnerabilities.filter(x => ALL_TOTAL_NAMES.includes(x.name)) : undefined
    } as ReportNpmAudit

    return {
        have,
        parent: {
            dependencies: {
                dev: prctFrom(have.dependencies.dev, npmGlobal.dependencies.dev),
                optional: prctFrom(have.dependencies.optional, npmGlobal.dependencies.optional),
                peer: prctFrom(have.dependencies.peer, npmGlobal.dependencies.peer),
                prod: prctFrom(have.dependencies.prod, npmGlobal.dependencies.prod),
                total: prctFrom(have.dependencies.total, npmGlobal.dependencies.total)
            }
        }
    }

}

export function mixedToStats(big: BigRepoProj, subFolder: string) {
    const BASE_URL = pathBigProj(big);

    const ALL_PACK_OBJ = allPackInMonoRepo(BASE_URL, subFolder);

    const PACK_ABS = getPacks(BASE_URL, subFolder)

    let PACKS_RESULT: PacksStats = [];
    let FILES_RESULT: FilesStats = []; let FILES_BEFORE: FilesStats = [];
    let entities: TsEntityStats[] = [];
    const BASE_URL_REPORT = pathBigProj(big, "report");
    const { code, monoRepo } = readFile(BASE_URL_REPORT + FINAL_MIXED_REPORT) as FinalBundleMixinResult;

    code.inside.forEach((p) => {
        // ALL FILES
        p.files.forEach((file) => {
            let ALL_TS_STATS = [] as TsEntityStats[]
            const { func, other, type } = file; const var_ = file.var; const class_ = file.class; const int = file.interface
            func.forEach((x) => { ALL_TS_STATS.push(cloneDeep(docFileIntoStats(p.packName!, file.filename!, x, "function"))) });
            [...type, ...int].forEach((x) => { ALL_TS_STATS.push(cloneDeep(docFileIntoStats(p.packName!, file.filename!, x, "type"))) });
            class_.forEach((x) => { ALL_TS_STATS.push(cloneDeep(docFileIntoStats(p.packName!, file.filename!, x, "class"))) });
            other.forEach((x) => { ALL_TS_STATS.push(cloneDeep(docFileIntoStats(p.packName!, file.filename!, x, "unknown"))) });
            var_.forEach((x) => { ALL_TS_STATS.push(cloneDeep(docFileIntoStats(p.packName!, file.filename!, x, "variable"))) });

            const RES = cloneDeep(buildFileFromEntities(file.filename!, p.packName, file.statFile, ALL_TS_STATS))

            cloneDeep(ALL_TS_STATS).forEach((x) => entities.push(x))
            FILES_BEFORE.push(RES);
        });
        //END ALL FILES
        const PACK_NEW = buildPackStatsFromFiles(
            p.packName,
            FILES_BEFORE.filter(x => x.pack === p.packName),
            ALL_PACK_OBJ.items.find(x => x.name.replace(`@${ALL_PACK_OBJ.ref.name}/`, "") === PACK_ABS.find(y => y.folder === p.packName).npm)
        );

        FILES_BEFORE.forEach((e) => { FILES_RESULT.push(buildFileFromPack(e, PACK_NEW)) });

        FILES_BEFORE = [];
        PACKS_RESULT.push(PACK_NEW);
    })

    const ALL = buildGlobalResult(PACKS_RESULT)
    PACKS_RESULT = PACKS_RESULT.map(e => {
        const r = npmAuditGlobalToPack(monoRepo.npm, ALL_PACK_OBJ.items.find(x => x.name.replace(`@${ALL_PACK_OBJ.ref.name}/`, "") === PACK_ABS.find(y => y.folder === e.name).npm));
        const { name, totalOf, have, parent } = buildPackFromGlobal(e, ALL)
        return { have: { ...have, npm: r.have.dependencies }, name, totalOf, parent: { ...parent, npm: r.parent.dependencies } }
    });
    const ALL_PACK_NAME = uniq(FILES_RESULT.map(x => x.pack));
    ALL_PACK_NAME.forEach((packname) => {
        const pack = PACKS_RESULT.find(x => x.name === packname)
        FILES_RESULT.filter(x => x.pack === packname).forEach((el) => {
            const INDEX = FILES_RESULT.findIndex(x => x.name === el.name && x.pack === packname)
            FILES_RESULT[INDEX] = buildFileFromPack(el, pack)
        })
    })
    writeJson(BASE_URL_REPORT + STATS_FILE, { packs: PACKS_RESULT, files: FILES_RESULT, entities: entities, global: ALL } as ResultStats)
}

mixedToStats("lordTs", "package")