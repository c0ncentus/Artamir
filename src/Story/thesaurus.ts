const THEME= "Musique"

interface Tag {
    title: string,
    def: string,
    linksTo: string[]
}

interface HierarchThesaurus {
    title: string,
    children: (string[]) | HierarchThesaurus[]
}


const question = `liste les mots clef et ensuite la définition de `;