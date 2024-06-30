import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Competition, Knockout, GroupType } from '../../src/index.js'

describe('knockoue', () => {
  it('testKnockout', async () => {
    const competitionJSON = await readFile(new URL(path.join('knockout', 'complete-knockout.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const knockout = competition.getStage('KO').getGroup('CUP')

    if (knockout instanceof Knockout) {
      assert.equal(knockout.getKnockoutConfig().getStanding()[0].position, '1st')
    } else {
      assert.fail('Group should be a knockout')
    }

    assert(knockout.isComplete())
    assert.equal(knockout.getType(), GroupType.KNOCKOUT)
    assert.equal(competition.getTeam('{KO:CUP:FIN:winner}').getID(), 'TM7')
    assert.equal(competition.getTeam('{KO:CUP:FIN:loser}').getID(), 'TM6')
    assert.equal(competition.getTeam('{KO:CUP:PO:winner}').getID(), 'TM3')
    assert.equal(competition.getTeam('{KO:CUP:PO:loser}').getID(), 'TM2')

    const knockoutConfig = knockout.getKnockoutConfig()
    assert.equal(knockoutConfig.getGroup(), knockout)
    assert.equal(competition.getTeam(knockoutConfig.getStanding()[0].id).getID(), 'TM7')
  })

  it('testKnockoutWithSets', async () => {
    const competitionJSON = await readFile(new URL(path.join('knockout', 'complete-knockout-sets.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const knockout = competition.getStage('KO').getGroup('CUP')

    assert(knockout instanceof Knockout)

    assert(knockout.isComplete(), 'Group should be found as completed')
    assert.equal(GroupType.KNOCKOUT, knockout.getType())
    assert.equal(competition.getTeam('{KO:CUP:FIN:winner}').getID(), 'TM7')
    assert.equal(competition.getTeam('{KO:CUP:FIN:loser}').getID(), 'TM6')
    assert.equal(competition.getTeam('{KO:CUP:PO:winner}').getID(), 'TM3')
    assert.equal(competition.getTeam('{KO:CUP:PO:loser}').getID(), 'TM2')
  })

  it('testKnockoutIncomplete', async () => {
    const competitionJSON = await readFile(new URL(path.join('knockout', 'incomplete-knockout.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const knockout = competition.getStage('KO').getGroup('CUP')

    assert(knockout, 'Group should be a knockout' instanceof Knockout)

    assert(!knockout.isComplete())
  })

  it('testKnockoutDrawsNotAllowed', async () => {
    const competitionJSON = await readFile(new URL(path.join('knockout', 'knockout-with-drawn-match.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Invalid match information (in match {KO:CUP:QF1}): scores show a draw but draws are not allowed'
    })
  })
})
