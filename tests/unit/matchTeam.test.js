import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Competition } from '../../src/index.js'

describe('matchTeam', () => {
  it('testMatchTeam', async () => {
    const competitionJSON = await readFile(new URL(path.join('matchteam', 'competition.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStage('L').getGroup('RL').getMatches()[0]

    const homeTeam = match.getHomeTeam()
    const awayTeam = match.getAwayTeam()

    assert.equal(homeTeam.getMVP().getName(), 'A Alice')
    assert.equal(awayTeam.getMVP().getName(), 'B Bobs')
    assert.equal(homeTeam.getNotes(), 'Some team note')
    assert.equal(homeTeam.getPlayers().length, 1)
    assert.equal(homeTeam.getPlayers()[0].getID(), 'P1')
    assert.equal(homeTeam.getMatch().getID(), 'RLM1')
  })

  it('testMatchTeamMixedPlayerTypes', async () => {
    const competitionJSON = await readFile(new URL(path.join('matchteam', 'competition-player-types.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    const competitionReloaded = await Competition.loadFromCompetitionJSON(JSON.stringify(competition.serialize()))

    assert.equal(
      competitionReloaded.getStage('S').getGroup('C').getMatch('M1').getMVP().getID(),
      competition.getStage('S').getGroup('C').getMatch('M1').getMVP().getID()
    )
    assert.equal(
      competitionReloaded.getStage('S').getGroup('C').getMatch('M1').getHomeTeam().getMVP().getID(),
      competition.getStage('S').getGroup('C').getMatch('M1').getHomeTeam().getMVP().getID()
    )
    assert.equal(
      competitionReloaded.getStage('S').getGroup('C').getMatch('M1').getAwayTeam().getMVP().getID(),
      competition.getStage('S').getGroup('C').getMatch('M1').getAwayTeam().getMVP().getID()
    )
    assert.deepEqual(
      competitionReloaded.getStage('S').getGroup('C').getMatch('M1').getHomeTeam().getPlayers()[0],
      competition.getStage('S').getGroup('C').getMatch('M1').getHomeTeam().getPlayers()[0]
    )

    assert.equal(
      competitionReloaded.getStage('S').getGroup('S').getMatch('M1').getMVP().getID(),
      competition.getStage('S').getGroup('S').getMatch('M1').getMVP().getID()
    )
    assert.equal(
      competitionReloaded.getStage('S').getGroup('S').getMatch('M1').getHomeTeam().getMVP().getID(),
      competition.getStage('S').getGroup('S').getMatch('M1').getHomeTeam().getMVP().getID()
    )
    assert.equal(
      competitionReloaded.getStage('S').getGroup('S').getMatch('M1').getAwayTeam().getMVP().getID(),
      competition.getStage('S').getGroup('S').getMatch('M1').getAwayTeam().getMVP().getID()
    )
    assert.deepEqual(
      competitionReloaded.getStage('S').getGroup('S').getMatch('M1').getHomeTeam().getPlayers()[0],
      competition.getStage('S').getGroup('S').getMatch('M1').getHomeTeam().getPlayers()[0]
    )
  })
})
