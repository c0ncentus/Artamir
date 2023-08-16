import { Dree, TypeModule } from "@lord_ts/directory_local";
import { MetadataDefTestsFunc, TestResult } from "@lord_ts/test";


export interface IPrompt {
    type: 'number' | "text" | "list" | "toggle" | "select" | "multiselect"
    | "autocompleteMultiselect" | "autocomplete" | "date",


    style?: "default" | "password" | "invisible"
    initial: number | string | boolean | number[] | string[] | boolean[],
    name: string // key
    message: string,
    instructions?: string | boolean
    warn?: string
    hint?: string,
    onRender?: Function,
    onState?: Function
    validate: (value: any) => boolean | string


    choices: { title: string, description: string, value: string, disable?: boolean }[]
    format: Function,
    // list, number, multiselect, select
    max?: number
    min?: number

    limit?: number

    //Toogle
    active?: string,
    inactive?: string,

    //list
    separator?: string
}

export type ICommands = { id: string; command: string, help: string }[];
export type IDeclinCommands = { to: string; commands: ICommands | string, help?: string }[]
export type IDeclinComItem = { to: string; commands: string | ICommands, help?: string }
export interface ICommandsImperator {
    name: string;
    help: string
    concern: { obj: string; declinaisons: IDeclinCommands; }[];
}

export type CmdCli = {
    pack: string,
    subject: string,
    specificTo: string,
    command: string | Function,
    form?: any[],
    transfoToFunc?: (obj: object) => any
    type?: "script" | "cmd" | "custom"

};










export interface DocPack { package: string; files: DocFile[] }

export interface DocGenType {
    code?: string;
    jsDoc?: any;
    name: string;
    numComplexity?: number
    // when is function or class or CONST REGEX!
    tests?: {
        metadata: MetadataDefTestsFunc;
        fail: TestResult[];
        pass: TestResult[];
    };
}

export interface DocFile {
    filename?: string,
    statFile?: { code: number, comment: number, blank: number },
    var?: DocGenType[],
    interface?: DocGenType[],
    type?: DocGenType[]
    func?: DocGenType[],
    class?: DocGenType[],
    other?: DocGenType[]
}





export type TsEntites = { func: number, var: number, type: number, class: number, other: number }
export type ReportLine = { code: number, comment: number, blank: number }

export type GlobalStatsReport = { main: StatsReport, totalOf: { entities: number, files: number, packages: number, npmPacks: ObjDepDevPack } }
export type StatsReport = { line: ReportLine, tests: { pass: number, total: number, mean: number }, coverage: { doc: number, test: number }, cyclo: { interval: [number, number], mean: number }, tsEntities: TsEntites }
export type StatsReportPack = { npm?: ObjDepDevPack, line: ReportLine, tests: { pass: number, total: number, mean: number }, coverage: { doc: number, test: number }, cyclo: { interval: [number, number], mean: number }, tsEntities: TsEntites }
export type StatsReportEntitiy = { tests: boolean[], coverage: { doc: number, test: number }, cyclo: number, type: TypeModule }

export type PackStats = { name: string, parent: StatsReportPack, have: StatsReportPack, totalOf: { files: number, entities: number, npmPacks: ObjDepDevPack }, };
export type PacksStats = PackStats[];
export type FileStats = { pack: string, name: string, parent: StatsReport, have: StatsReport, totalOf: { entities: number } };
export type FilesStats = FileStats[];
export type TsEntityStats = { file: string, pack: string, name: string, stats: StatsReportEntitiy }
export type ResultStats = { packs: PacksStats, files: FilesStats, entities: TsEntityStats[], global: GlobalStatsReport }
// export type ScorIngReport = { test: number, doc: number, complex: number, total: number }
export interface ReportLinesPerFile { [key: string]: { "language": string, "code": number, "comment": number, "blank": number }; }
export interface GlobalLinesPerFileOutput { [key: string]: { "code": number, "comment": number, "blank": number }; }
export type ComplexityReport = { path: string, numComplex: number, line: number }[]
export interface ReportNpmAudit {
    dependencies: ObjDepDevPack;
    vulnerabilities?: {
        name: string; severity: string; isDirect: boolean; via?: string[];
        effects?: any[]; range?: string; nodes?: string[];
        fixAvailable?: { name: string; version: string; isSemVerMajor: boolean; };
    }[]
}

export type ObjDepDevPack = { prod: number; dev: number; optional: number; peer: number; total: number; }

export interface ReportAll {
    name: string
    tree: { obj: Dree, str: string };
    npm: ReportNpmAudit
}

export interface FinalBundleMixinResult {
    monoRepo: ReportAll,
    code: {
        inside: { packName: string; files: DocFile[]; }[],
        lines: GlobalLinesPerFileOutput;
    }
}

export type BigRepoProj = "lordTs" | "atalante"