import { writeJson, readFile } from "@lord_ts/directory_local";
import { CsvData, CsvDataObj } from "@lord_ts/file";

export function csvWriten(writePath: string, readPath: string) { writeJson(writePath, readFile(readPath) as any); }
export function csvCustomToJson(writePath: string, readPath: string, custom: (csv: CsvData) => CsvDataObj) { writeJson(writePath, readFile(readPath) as any); }
