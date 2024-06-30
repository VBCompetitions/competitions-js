import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {describe, it} from 'node:test'
import path from 'node:path'

import Competition from '../../src/competition.js'
import CompetitionTeam from '../../src/competitionTeam.js'

describe('as ESM', () => {
  it('testCompetitionGetTeamLookupsComplete', async () => {
    const competitionJSON = await readFile(new URL(path.join( '..', 'unit', 'competitions', 'competition-complete.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    assert.equal(competition.getVersion(), '1.0.0')

    assert(competition.hasTeam('TM1'))
    assert(competition.hasTeam('TM8'))

    assert.equal(competition.getTeam('{L:RL:league:1}').getID(), 'TM6')
    assert.equal(competition.getTeam('{L:RL:league:2}').getID(), 'TM5')
    assert.equal(competition.getTeam('{L:RL:league:3}').getID(), 'TM2')
    assert.equal(competition.getTeam('{L:RL:league:4}').getID(), 'TM4')
    assert.equal(competition.getTeam('{L:RL:league:5}').getID(), 'TM3')
    assert.equal(competition.getTeam('{L:RL:league:6}').getID(), 'TM7')
    assert.equal(competition.getTeam('{L:RL:league:7}').getID(), 'TM8')
    assert.equal(competition.getTeam('{L:RL:league:8}').getID(), 'TM1')

    assert.equal(competition.getTeam('{L:RL:RLM1:winner}').getID(), 'TM2')
    assert.equal(competition.getTeam('{L:RL:RLM1:loser}').getID(), 'TM1')

    assert(!competition.hasTeam('NO-SUCH-TEAM'))
    assert.equal(competition.getTeam('NO-SUCH-TEAM').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)

    assert(!competition.hasTeam('{NO:SUCH:TEAM:REF}'))
    assert.equal(competition.getTeam('{NO:SUCH:TEAM:REF}').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)
  })
})
