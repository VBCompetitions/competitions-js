import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Competition, Crossover, GroupMatch, MatchOfficials, MatchType, Stage } from '../../src/index.js'

describe('matchOfficials', () => {
  it('testOfficialsNone', async () => {
    const competitionJSON = await readFile(new URL(path.join('officials', 'officials-team.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    assert.equal(competition.getStageByID('L').getGroupByID('LG').getMatchByID('LG2').getOfficials(), null)
  })

  it('testOfficialsTeam', async () => {
    const competitionJSON = await readFile(new URL(path.join('officials', 'officials-team.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const matchOfficials = competition.getStageByID('L').getGroupByID('LG').getMatchByID('LG1').getOfficials()

    assert(matchOfficials.isTeam())
    assert.equal(matchOfficials.getTeamID(), 'TM1')
    assert(!matchOfficials.hasSecondRef())
    assert(!matchOfficials.hasChallengeRef())
    assert(!matchOfficials.hasAssistantChallengeRef())
    assert(!matchOfficials.hasReserveRef())
    assert(!matchOfficials.hasScorer())
    assert(!matchOfficials.hasAssistantScorer())
    assert(!matchOfficials.hasLinespersons())
    assert(!matchOfficials.hasBallCrew())
    assert.equal(matchOfficials.getFirstRef(), null)
    assert.equal(matchOfficials.getSecondRef(), null)
    assert.equal(matchOfficials.getChallengeRef(), null)
    assert.equal(matchOfficials.getAssistantChallengeRef(), null)
    assert.equal(matchOfficials.getReserveRef(), null)
    assert.equal(matchOfficials.getScorer(), null)
    assert.equal(matchOfficials.getAssistantScorer(), null)
    assert.equal(matchOfficials.getMatch().getID(), 'LG1')
  })

  it('testOfficialsPerson', async () => {
    const competitionJSON = await readFile(new URL(path.join('officials', 'officials-persons.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const matchOfficials = competition.getStageByID('L').getGroupByID('LG').getMatchByID('LG1').getOfficials()

    assert(!matchOfficials.isTeam())
    assert.equal(matchOfficials.getTeamID(), null)
    assert.equal(matchOfficials.getFirstRef(), 'A First')
    assert.equal(matchOfficials.getSecondRef(), 'B Second')
    assert.equal(matchOfficials.getChallengeRef(), 'C Challenge')
    assert.equal(matchOfficials.getAssistantChallengeRef(), 'D Assistant')
    assert.equal(matchOfficials.getReserveRef(), 'E Reserve')
    assert.equal(matchOfficials.getScorer(), 'F Scorer')
    assert.equal(matchOfficials.getAssistantScorer(), 'G Assistant')
    assert.equal(matchOfficials.getLinespersons().length, 2)
    assert.equal(matchOfficials.getLinespersons()[0], 'H Line')
    assert.equal(matchOfficials.getBallCrew().length, 2)
    assert.equal(matchOfficials.getBallCrew()[0], 'J Ball')
  })

  it('testOfficialsSetters', async () => {
    const competitionJSON = await readFile(new URL(path.join('officials', 'officials-team.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const matchOfficials = competition.getStageByID('L').getGroupByID('LG').getMatchByID('LG1').getOfficials()

    assert(matchOfficials.isTeam())

    matchOfficials.setFirstRef('A First')
    matchOfficials.setSecondRef('B Second')
    matchOfficials.setChallengeRef('C Challenge')
    matchOfficials.setAssistantChallengeRef('D Assistant')
    matchOfficials.setReserveRef('E Reserve')
    matchOfficials.setScorer('F Scorer')
    matchOfficials.setAssistantScorer('G Assistant')
    matchOfficials.setLinespersons(['H Line', 'I Line'])
    matchOfficials.setBallCrew(['J Ball', 'K Ball'])

    assert.equal(matchOfficials.getFirstRef(), 'A First')
    assert.equal(matchOfficials.getSecondRef(), 'B Second')
    assert.equal(matchOfficials.getChallengeRef(), 'C Challenge')
    assert.equal(matchOfficials.getAssistantChallengeRef(), 'D Assistant')
    assert.equal(matchOfficials.getReserveRef(), 'E Reserve')
    assert.equal(matchOfficials.getScorer(), 'F Scorer')
    assert.equal(matchOfficials.getAssistantScorer(), 'G Assistant')
    assert.equal(matchOfficials.getLinespersons().length, 2)
    assert.equal(matchOfficials.getLinespersons()[0], 'H Line')
    assert.equal(matchOfficials.getBallCrew().length, 2)
    assert.equal(matchOfficials.getBallCrew()[0], 'J Ball')
    assert.equal(matchOfficials.getTeamID(), null)
    assert(!matchOfficials.isTeam())

    matchOfficials.setTeamID('{L:LG:LG2:winner}')

    assert(!matchOfficials.hasSecondRef())
    assert(!matchOfficials.hasChallengeRef())
    assert(!matchOfficials.hasAssistantChallengeRef())
    assert(!matchOfficials.hasReserveRef())
    assert(!matchOfficials.hasScorer())
    assert(!matchOfficials.hasAssistantScorer())
    assert(!matchOfficials.hasLinespersons())
    assert(!matchOfficials.hasBallCrew())
    assert.equal(matchOfficials.getFirstRef(), null)
    assert.equal(matchOfficials.getSecondRef(), null)
    assert.equal(matchOfficials.getChallengeRef(), null)
    assert.equal(matchOfficials.getAssistantChallengeRef(), null)
    assert.equal(matchOfficials.getReserveRef(), null)
    assert.equal(matchOfficials.getScorer(), null)
    assert.equal(matchOfficials.getAssistantScorer(), null)
    assert(matchOfficials.isTeam())
    assert.equal(matchOfficials.getTeamID(), '{L:LG:LG2:winner}')
  })

  it('testOfficialsConstructor', async () => {
    const competition = new Competition('test')
    const stage = new Stage(competition, 'S')
    const group = new Crossover(stage, 'G', MatchType.CONTINUOUS)
    const match = new GroupMatch(group, 'M1')

    assert.throws(() => {
      new MatchOfficials(match, null, null)
    }, {
      message: 'Match Officials must be either a team or a person'
    })
  })

  it('testOfficialsExceptionSettingInvalidTeam', async () => {
    const competitionJSON = await readFile(new URL(path.join('officials', 'officials-team.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const matchOfficials = competition.getStageByID('L').getGroupByID('LG').getMatchByID('LG1').getOfficials()

    assert.throws(() => {
      matchOfficials.setTeamID('{L:LG:LG2')
    }, {
      message: /Invalid team reference for officials in match with ID "LG1": "{L:LG:LG2"/
    })
  })
})
