import { StatsReport } from "../../../model";

export const INIT_STATS: StatsReport = {
    coverage: { doc: 0, test: 0 },
    cyclo: { interval: [0, 0], mean: 0 },
    line: { blank: 0, code: 0, comment: 0 },
    tests: { pass: 0, total: 0, mean: 0 },
    tsEntities: { class: 0, func: 0, other: 0, type: 0, var: 0 }
};
