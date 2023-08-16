#! /usr/bin/env node

import { ALL_COMMAND_V2 } from "./ALL_CMD"
import { executeCmdsWhatever } from "./operation";
import yargs from "yargs/yargs"

import { hideBin } from 'yargs/helpers'
import prompts from "prompts";
import { uniqBy } from "lodash";
const argv = yargs(hideBin(process.argv)).argv as any
const KEYS_SHOULD_HAVE = ["s", "v", "p"]
let QUESTION = {
    type: 'autocomplete',
    name: 'value',
    message: 'Pick one command sir/lady ...',
    choices: [
        { title: 'Cage' },
        { title: 'Clooney' },
        { title: 'Gyllenhaal' },
        { title: 'Gibson' },
        { title: 'Grant' }
    ]
}

function validCmd(arg: any) { return KEYS_SHOULD_HAVE.every(x => typeof arg[x] === "string") }
function reExecLord(arg: any) { return `lordts${arg.s !== undefined ? ` -s ${arg.s}` : ""}${arg.v !== undefined ? ` -v ${arg.v}` : ""}${arg.p !== undefined ? ` -p ${arg.p}` : ""}` }
function searchTheCmd() {


    if (argv.s === undefined) {

        QUESTION.choices = uniqBy(
            ALL_COMMAND_V2
                .filter(x => (
                    (argv.v === undefined || x.subject === argv.v)
                    && (argv.p === undefined || x.specificTo === argv.p)
                ))
                .map(e => { return { title: e.pack } })

            , ("title")
        );
        (async () => {
            const response = await prompts(QUESTION as any)
            console.log(response)
            
        })();
    }
    else {
        if (argv.v === undefined) {
            QUESTION.choices = uniqBy(ALL_COMMAND_V2.filter(x => (
                (argv.s === undefined || x.pack === argv.s)
                && (argv.p === undefined || x.specificTo === argv.p)
            )).map(e => { return { title: e.subject } }),"title");
            (async () => {
                const response = await prompts(QUESTION as any);
                reExecLord({ ...argv, v: response })
            })();
        }
        else {
            if (argv.p === undefined) {

                QUESTION.choices = uniqBy(ALL_COMMAND_V2.filter(x => (
                    (argv.v === undefined || x.subject === argv.v)
                    && (argv.p === undefined || x.specificTo === argv.p)
                )).map(e => { return { title: e.specificTo } }),"title");
                (async () => {
                    const response = await prompts(QUESTION as any);
                    reExecLord({ ...argv, p: response })
                })();
            }
        }
    }
    // if (validCmd(argv) === false) { searchTheCmd() }
}
function execCli(start?: string, variation?: string, process?: string) {
    if (start === undefined || variation === undefined || process === undefined) {
        console.log(`PROGRAM FINISHED: start:${start} variation:${variation} process: ${process}`)
        return
    };
    const OBJ = ALL_COMMAND_V2.find(x => x.pack === start && x.specificTo === process && x.subject === variation)
    console.log(OBJ)
    const { command, pack, specificTo, subject, form, transfoToFunc } = OBJ
    executeCmdsWhatever(command, form, transfoToFunc)

}

// <===============================  Lord_Ts_Cli  ===============================>
// -h => help

// -s <string> -v <string> -p <string> => svp for making a command !
// s for Start (pack). v for Variation (speceficTo). p for Process (command)

// <==================================    END    ==================================>
// `)
if (validCmd(argv) === false) { searchTheCmd(); }
else { execCli(argv.s as string, argv.v as string, argv.p as string) }
