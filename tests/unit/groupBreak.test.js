import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'


import { Competition, GroupBreak } from '../../src/index.js'

describe('groupBreak', () => {
  it('testGroupBreakBasicData', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'complete-group.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStageByID('L').getGroupByID('LG')
    let groupBreak = null
    group.getMatches().forEach((match) => {
      if (match instanceof GroupBreak) {
        groupBreak = match
      }
    })

    assert.notEqual(groupBreak, null)
    assert.equal(groupBreak.getStart(), '13:20')
    assert.equal(groupBreak.getDate(), '2020-02-20')
    assert.equal(groupBreak.getDuration(), '1:00')
    assert.equal(groupBreak.getName(), 'Lunch break')
    assert.equal(groupBreak.getGroup().getID(), 'LG')
  })
})
