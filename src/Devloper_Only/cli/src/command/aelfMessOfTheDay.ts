import { DateTime } from "luxon";
import { aelfApi, discordPostMssg } from "@lord_ts/api";
import { URL_DISCORD } from "../CONST";

const waitDiscordPost = (text: string, millisec: number) => { setTimeout(() => { discordPostMssg(URL_DISCORD, text) }, millisec); }
export function aelfMassInDiscord() {
    aelfApi(undefined, (messe) => {
        console.log(messe)

        const lecture = (i, lect) => {
            return ` 
    ${String(lect.type).toUpperCase()} ==>${lect.titre}<==
    ${lect.contenu}
    REFERENCE ==> ${lect.ref}
    
    
    <========     FIN     ========>
    `.replace(/\<\/?\w+\s*\/?\>/gm, "")
        }
        waitDiscordPost(`La messe de ce Jour !  ${DateTime.now().toLocal().locale} :)`, 100);


        waitDiscordPost(`Année lithurgique: ${messe.informations.jour_liturgique_nom}
couleur: ${messe.informations.couleur}
fête: ${messe.informations.fete} `, 6000);
        messe.messes[0].lectures.forEach((element, i) => {
            waitDiscordPost(lecture(i, element), 8000 + (2000 * i))
        });
        waitDiscordPost(`Prions le seigneur`, 60000)
    })
}