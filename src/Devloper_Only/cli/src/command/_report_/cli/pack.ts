import { scanLocalFiles, astFilesToStrTree } from "@lord_ts/directory_local";
import { PATH_MONO_REPO } from "../../../CONST";
import { ReportAll, ReportNpmAudit } from "../../../model";
import { omit } from "lodash";

// to @lord_ts/file
export interface INpmAudit {
    vulnerabilities?: {
        [key: string]: {
            name: string;
            severity: string;
            isDirect: boolean;
            via?: string[];
            effects?: any[];
            range?: string;
            nodes?: string[];
            fixAvailable?: {
                name: string;
                version: string;
                isSemVerMajor: boolean;
            };
        }
    }
    auditReportVersion: number;
    metadata: {
        dependencies: {
            prod: number;
            dev: number;
            optional: number;
            peer: number;
            peerOptional: number;
            total: number;
        };
        "vulnerabilities": {
            "info": 0,
            "low": 0,
            "moderate": 0,
            "high": 0,
            "critical": 0,
            "total": 0
        }

    }
}



function buildNpmReport(npmAudit: INpmAudit): ReportNpmAudit {
    const { dependencies } = npmAudit.metadata
    return {
        dependencies: omit(dependencies, "peerOptional"),
        vulnerabilities: Object.keys(npmAudit.vulnerabilities).map(key => npmAudit.vulnerabilities[key])
    }
}

export function buildPackageAnalys(name: string, npmAudit: INpmAudit): ReportAll {
    const dree = scanLocalFiles(PATH_MONO_REPO.lordTs, {
        emptyDirectory: false, hash: false, symbolicLinks: false,
        extensions: ["ts", "tsx", "js", "jsx"],
        exclude: ["dist", "node_modules", "temp", ".git", ".VSCodeCounter"],
        size: false,
        sizeInBytes: false,
        stat: false,
        followLinks: false
    });

    return { name, tree: { obj: dree, str: astFilesToStrTree(dree) }, npm: buildNpmReport(npmAudit) }
}