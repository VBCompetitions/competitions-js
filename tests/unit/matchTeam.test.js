import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Competition } from '../../src/index.js'

describe('matchTeam', () => {
  it('testMatchTeam', async () => {
    const competitionJSON = await readFile(new URL(path.join('matchteam', 'competition.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('L').getGroupByID('RL').getMatches()[0]

    const homeTeam = match.getHomeTeam()
    const awayTeam = match.getAwayTeam()

    assert.equal(homeTeam.getMVP(), 'A Alice')
    assert.equal(awayTeam.getMVP(), 'B Bobs')
    assert.equal(homeTeam.getNotes(), 'Some team note')
    assert.equal(homeTeam.getPlayers().length, 1)
    assert.equal(homeTeam.getPlayers()[0], 'P1')
    assert.equal(homeTeam.getMatch().getID(), 'RLM1')
  })
})
