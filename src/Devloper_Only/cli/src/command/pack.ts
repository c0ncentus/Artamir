import { buildMonoRepo, buildSimpleRepo } from "@lord_ts/directory_local"
import {  pathBigProj } from "../CONST"
import { BigRepoProj } from "../model"
import { exe } from "../operation"

export function scriptBuildMonoRepo(proj: BigRepoProj, subfolder: string) { exe(buildMonoRepo(pathBigProj(proj), subfolder)) }
export function scriptBuildPackInMonorepo(proj: BigRepoProj, subFolder: string, pack: string) { return exe(buildSimpleRepo(`${pathBigProj(proj)}/${subFolder}/${pack}`)) }
