import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'


import { Competition, Crossover, GroupType } from '../../src/index.js'

describe('crossover', () => {
  it('testCrossover', async () => {
    const competitionJSON = await readFile(new URL(path.join('crossovers', 'complete-crossover.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const crossover = competition.getStage('C').getGroup('CO')

    assert(crossover, 'Group should be a crossover' instanceof Crossover)

    assert(crossover.isComplete(), 'Group should be found as completed')
    assert.equal(crossover.getType(), GroupType.CROSSOVER)
    assert.equal(competition.getTeam('{C:CO:CO1:winner}').getID(), 'TM3')
    assert.equal(competition.getTeam('{C:CO:CO1:loser}').getID(), 'TM1')
    assert.equal(competition.getTeam('{C:CO:CO2:winner}').getID(), 'TM4')
    assert.equal(competition.getTeam('{C:CO:CO2:loser}').getID(), 'TM2')
  })

  it('testCrossoverWithSets', async () => {
    const competitionJSON = await readFile(new URL(path.join('crossovers', 'complete-crossover-sets.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const crossover = competition.getStage('C').getGroup('CO')

    assert(crossover, 'Group should be a crossover' instanceof Crossover)

    assert(crossover.isComplete(), 'Group should be found as completed')
    assert.equal(competition.getTeam('{C:CO:CO1:winner}').getID(), 'TM3')
    assert.equal(competition.getTeam('{C:CO:CO1:loser}').getID(), 'TM1')
    assert.equal(competition.getTeam('{C:CO:CO2:winner}').getID(), 'TM4')
    assert.equal(competition.getTeam('{C:CO:CO2:loser}').getID(), 'TM2')
  })

  it('testCrossoverIncomplete', async () => {
    const competitionJSON = await readFile(new URL(path.join('crossovers', 'incomplete-crossover.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const crossover = competition.getStage('C').getGroup('CO')

    assert(crossover instanceof Crossover)

    assert(!crossover.isComplete())
  })

  it('testCrossoverDrawsNotAllowed', async () => {
    const competitionJSON = await readFile(new URL(path.join('crossovers', 'crossover-with-drawn-match.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Invalid match information (in match {C:CO:CO1}): scores show a draw but draws are not allowed'
    })
  })

  it('testCrossoverGroupsWithoutNames', async () => {
    const competitionJSON = await readFile(new URL(path.join('crossovers', 'crossover-no-names.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const crossover = competition.getStage('C')

    assert.equal(crossover.getGroup('CO0').getName(), null)
    assert.equal(crossover.getGroup('CO1').getName(), 'Crossover round')
    assert.equal(crossover.getGroup('CO2').getName(), null)
  })
})
