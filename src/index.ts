/**
 * Usage guide :
 * - `npm install`
 * - `npm run build`
 * - `npm start --region region --path path/to/scripts --output output/path`
 *      (example : npm start --region NA --path C:\Scripts --output C:\ScriptOutputs)
 */


import yargs from 'yargs';
import { existsSync, mkdirSync, statSync, accessSync, constants, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, basename, extname } from 'path';
import parse, { Region } from './parseScript'

const argv = yargs
    .option('region', {
        description: 'Game region. JP or NA.',
        choices: ['NA', 'JP'],
        demandOption: true,
    })
    .option('path', {
        description: 'A folder containing scripts, as files with extension .txt',
        demandOption: true,
        type: 'string'
    })
    .option('output', {
        description: 'A folder to output parsed objects',
        demandOption: true,
        type: 'string'
    })
    .check(argv => {
        let inputStat = statSync(argv.path);
        if (!inputStat.isDirectory()) throw new Error(`${argv.path} is not a directory!`);
        accessSync(argv.path, constants.R_OK);

        if (!existsSync(argv.output)) mkdirSync(argv.output);

        let outputStat = statSync(argv.output);
        if (!outputStat.isDirectory()) throw new Error(`${argv.output} is not a directory!`);
        accessSync(argv.output, constants.W_OK);

        return true;
    })
    .parseSync();

const region = argv.region.toLowerCase() === 'jp' ? Region.JP : Region.NA;

for (let entry of readdirSync(argv.path)) {
    let fullPath = join(argv.path, entry);
    if (extname(entry).toLowerCase() != '.txt') continue;

    console.log(`Reading file ${entry}`);
    let parsed = parse(region, readFileSync(fullPath, 'utf-8'));

    let filename = basename(entry) + '.json';
    console.log(`Writing file ${filename}`);
    writeFileSync(join(argv.output, filename), JSON.stringify(parsed, null, 4));
}