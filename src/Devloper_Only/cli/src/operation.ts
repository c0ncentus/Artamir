import { replaceAll } from "@lord_ts/core";
import { prompt } from "prompts"
import { spawnSync } from "child_process";
import { cloneDeep, compact } from "lodash";
import { isPromise } from "util/types";
import {  CMD_EXEC, IMPERATOR_CMD } from "./CONST";
import { ALL_COMMAND_V2 } from "./ALL_CMD";


export function executeCmdsWhatever(cmd: string | Function, form?: any[], transfoToFunc?: (obj: object) => any) {
	if (typeof cmd === "function") {
		if (form !== undefined && form.length !== 0) { cmdFormFunc(cmd, form, transfoToFunc); }
		else { cmdFunc(cmd) }
	}
	if (typeof cmd === "string") {
		if (form !== undefined && form.length !== 0) { cmdStr(cmd, form, transfoToFunc); }
		else {
			if (typeof cmd === "string" && (cmd as string).search(IMPERATOR_CMD) !== -1) { cmdStrLordTs(cmd as string) }
			else { cmdStr(cmd) }
		}
	}
}

function cmdFormFunc(cmd: string | Function, form?: any[], transfoToFunc?: (obj: object) => any) {
	(async () => {
		const RESPONSE_FORM = await prompt(form);
		cmdFunc(cmd, RESPONSE_FORM, form, transfoToFunc)
	})();
}


function cmdStrLordTs(cmd: string) {
	const ALL_CMD = cmd.split(/\s*&&\s*/gm).map(e => e.trim())
	const OVERVIEW = ALL_CMD.map(x => lordTsCommand(x));
	OVERVIEW.forEach((cmdBuild, i) => {
		if (cmdBuild === false) { executeCmdsWhatever(ALL_CMD[i]) }
		else { 
			const {command, form,transfoToFunc }= ALL_COMMAND_V2.find(x=>x.pack===cmdBuild.pack && x.subject===cmdBuild.subject && x.specificTo===cmdBuild.specificTo);
			console.log(command);
			executeCmdsWhatever(command, form, transfoToFunc) ;
		}
	})
}



function cmdStr(cmd: string,  form?: any[], transfoToFunc?: (obj: object) => any) {
	let cmdMaster = cloneDeep(cmd)
	if (form !== undefined) {
		(async () => {
			const RESPONSE_FORM = await prompt(form);
			Object.entries(RESPONSE_FORM).forEach(([k, v], i) => { cmdMaster = cmdMaster.replace(`<${k}>`, v as any) });
			exe(cmdMaster)
		})();
	}
	else {exe(cmdMaster) }
}

function cmdFunc(cmd: string | Function, args?: object, form?: any[], transfoToFunc?: (obj: object) => any) {
	if (args === undefined && transfoToFunc !== undefined) { throw new Error("transfo useless"); }
	if (typeof cmd === "function") {
		if (args !== undefined && transfoToFunc === undefined) { throw new Error("need transfo"); }

		const ARGS = transfoToFunc === undefined ? undefined : transfoToFunc(args);
		console.log(`${cmd.name}()`);
		const result = args === undefined ? cmd() : cmd.apply(undefined, ARGS);
		if (isPromise(result) === false) {
			if (typeof result === "string" && result.length > CMD_EXEC.length && new RegExp(`^${CMD_EXEC}`).test(result)) { exe(result.replace(CMD_EXEC, "")) }
			console.log(result)
		}
	}
}



// lord starter app tsx
function lordTsCommand(cmdItem: string): false | { pack: string; subject: string; specificTo: string; command: string | Function; form?: any[]; transfoToFunc?: (obj: object) => any; } {
	let newStr = replaceAll(cmdItem.trim(), "  ", " ");
	if (new RegExp(IMPERATOR_CMD).test(newStr)) {
		newStr = newStr.replace(IMPERATOR_CMD, "")
		const SPLIT_CMD = compact(newStr.split(" "));
		if (SPLIT_CMD.length !== 3) { return false }
		const [pack, subject, specificTo] = SPLIT_CMD
		const result = ALL_COMMAND_V2.find(x => x.pack === pack && x.subject === subject && specificTo === x.specificTo);
		return result === undefined ? false : result
	}
	else { return false }
}

export function exe(cmd: string) {
	const child = spawnSync(cmd, undefined, { shell: true })
	console.log(cmd)
	console.log(child.stdout.toString("utf-8"))
}