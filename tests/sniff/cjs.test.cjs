const assert = require('node:assert/strict')
const {describe, it} = require( 'node:test' )
const { readFile } = require('node:fs/promises')
const path = require('node:path')

const competitions = require('../../src/index.cjs')
const Competition = competitions.Competition
const CompetitionTeam = competitions.CompetitionTeam

describe('as CJS', () => {
  it('testCompetitionGetTeamLookupsComplete', async () => {
    const competitionJSON = await readFile(path.resolve(path.join(__dirname, '..', 'unit', 'competitions', 'competition-complete.json')), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    assert.equal(competition.getVersion(), '1.0.0')

    assert(competition.hasTeamID('TM1'))
    assert(competition.hasTeamID('TM8'))

    assert.equal(competition.getTeamByID('{L:RL:league:1}').getID(), 'TM6')
    assert.equal(competition.getTeamByID('{L:RL:league:2}').getID(), 'TM5')
    assert.equal(competition.getTeamByID('{L:RL:league:3}').getID(), 'TM2')
    assert.equal(competition.getTeamByID('{L:RL:league:4}').getID(), 'TM4')
    assert.equal(competition.getTeamByID('{L:RL:league:5}').getID(), 'TM3')
    assert.equal(competition.getTeamByID('{L:RL:league:6}').getID(), 'TM7')
    assert.equal(competition.getTeamByID('{L:RL:league:7}').getID(), 'TM8')
    assert.equal(competition.getTeamByID('{L:RL:league:8}').getID(), 'TM1')

    assert.equal(competition.getTeamByID('{L:RL:RLM1:winner}').getID(), 'TM2')
    assert.equal(competition.getTeamByID('{L:RL:RLM1:loser}').getID(), 'TM1')

    assert(!competition.hasTeamID('NO-SUCH-TEAM'))
    assert.equal(competition.getTeamByID('NO-SUCH-TEAM').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)

    assert(!competition.hasTeamID('{NO:SUCH:TEAM:REF}'))
    assert.equal(competition.getTeamByID('{NO:SUCH:TEAM:REF}').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)
  })
})
