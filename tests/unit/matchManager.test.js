import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Competition, Crossover, GroupMatch, MatchManager, MatchType, Stage } from '../../src/index.js'

describe('matchManager', () => {
  it('testManagerNone', async () => {
    const competitionJSON = await readFile(new URL(path.join('manager', 'manager-team.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    assert.equal(competition.getStageByID('L').getGroupByID('LG').getMatchByID('LG2').getManager(), null)
  })

  it('testManagerTeam', async () => {
    const competitionJSON = await readFile(new URL(path.join('manager', 'manager-team.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const matchManager = competition.getStageByID('L').getGroupByID('LG').getMatchByID('LG1').getManager()

    assert(matchManager.isTeam())
    assert.equal(matchManager.getTeamID(), 'TM1')
    assert.equal(matchManager.getManagerName(), null)
    assert.equal(matchManager.getMatch().getID(), 'LG1')
  })

  it('testManagerPerson', async () => {
    const competitionJSON = await readFile(new URL(path.join('manager', 'manager-person.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const matchManager = competition.getStageByID('L').getGroupByID('LG').getMatchByID('LG1').getManager()

    assert(!matchManager.isTeam())
    assert.equal(matchManager.getManagerName(), 'Some Manager')
    assert.equal(matchManager.getTeamID(), null)
    assert.equal(matchManager.getMatch().getID(), 'LG1')
  })

  it('testManagerSetters', async () => {
    const competitionJSON = await readFile(new URL(path.join('manager', 'manager-team.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const matchManager = competition.getStageByID('L').getGroupByID('LG').getMatchByID('LG1').getManager()

    assert(matchManager.isTeam())
    matchManager.setManagerName('Alan Measles')
    assert.equal(matchManager.getManagerName(), 'Alan Measles')
    assert(!matchManager.isTeam())
    assert.equal(matchManager.getTeamID(), null)

    // Note that we _do_ allow a playing team to be a court manager
    matchManager.setTeamID('TM2')
    assert.equal(matchManager.getTeamID(), 'TM2')
    assert(matchManager.isTeam())
    assert.equal(matchManager.getManagerName(), null)
  })

  it('testManagerConstructor', async () => {
    const competition = new Competition('test')
    const stage = new Stage(competition, 'S')
    const group = new Crossover(stage, 'G', MatchType.CONTINUOUS)
    const match = new GroupMatch(group, 'M1')

    assert.throws(() => {
      new MatchManager(match, null, null)
    }, {
      message: 'Match Managers must be either a team or a person'
    })
  })

  it('testManagerSetName', async () => {
    const competition = new Competition('test')
    const stage = new Stage(competition, 'S')
    const group = new Crossover(stage, 'G', MatchType.CONTINUOUS)
    const match = new GroupMatch(group, 'M1')
    const manager = new MatchManager(match, null, 'Alice Alison')

    assert.throws(() => {
      manager.setManagerName('')
    }, {
      message: 'Invalid manager name: must be between 1 and 1000 characters long'
    })

    assert.throws(() => {
      let name = 'a'
      for (let i = 0; i < 100; i++) {
        name += '0123456789'
      }
      manager.setManagerName(name)
    }, {
      message: 'Invalid manager name: must be between 1 and 1000 characters long'
    })
  })
})
