# Glor's organisation
Artamir
 ├─> .git                   => git config
 ├── .gitignore             => git config
 ├─> .vscode                => vsCode config
 ├─> assets                 => image/video/pdf
 ├─> database               => .json only
 ├─> docs                   => .md only
 ├── package-lock.json      => nodejs config
 ├── package.json           => nodejs config
 ├── README.md              => Manual
 ├─> src                    => source of all code
 │   ├─> Code               => by how to do things
 │   │   ├─> api
 │   │   │   └── index.ts
 │   │   ├─> file
 │   │   │   └── index.ts
 │   │   └─> scrap
 │   │       └── index.ts
 │   ├─> Devloper_Only      => No Caty allowed
 │   │   ├─> cli
 │   │   │   └── index.ts
 │   │   └─> test
 │   │       └── import.ts
 │   ├─> Playground         => whatever
 │   │   └── index.ts
 │   └─> Story              => By documentation use case
 └── tsconfig.json          => nodejs config


So when have 
    1 "Story"    can have multiple files        in "Code"
    1 "Code"     can have multiple files        in "Devloper_Only"


## Api

move ALL_CMD, CONST, model, index, operation to @lors_ts/cli

keep folder "command" 


as folders exemple
    -api
        -...
        -...
    -file
        -...
    -scripts
        -buildRepo
        -publishRepo



## CLI

## scrap

## File: data-migration


