import { Competition } from '../src/index.js'
import { readFile } from 'node:fs/promises'
import { sep as pathSep} from 'node:path'
import { pathToFileURL } from 'node:url'

if (process.argv.length !== 3) {
  console.log('Usage: vbc-validate [competition JSON file]')
  process.exit(1)
}

async function main (filename) {
  const filePath = new URL(filename, pathToFileURL(process.cwd() + pathSep));
  const competitionJson = await readFile(filePath, { encoding: 'utf8' })
  try {
    const competition = Competition.loadFromCompetitionJSON(competitionJson)
  } catch (error) {
    console.error('Errors found in file:')
    console.error(error.toString())
  }
}

main(process.argv[2]).then(
  console.log('File is valid')
)
