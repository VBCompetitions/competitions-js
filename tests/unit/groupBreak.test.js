import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Competition, Crossover, GroupBreak, MatchType, Stage } from '../../src/index.js'

describe('groupBreak', () => {
  it('testGroupBreakBasicData', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'complete-group.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('L').getGroup('LG')
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

  it('testGroupBreakSetters', () => {
    const competition = new Competition('test competition')
    const stage = new Stage(competition, 'S')
    competition.addStage(stage)
    const group = new Crossover(stage, 'C', MatchType.SETS)
    stage.addGroup(group)

    const lunchBreak = new GroupBreak(group)

    assert.throws(
      () => {
        lunchBreak.setDate('Today')
      }, {
        message: 'Invalid date "Today": must contain a value of the form "YYYY-MM-DD"'
      }
    )

    assert.throws(
      () => {
        lunchBreak.setDate('2024-02-30')
      }, {
        message: 'Invalid date "2024-02-30": date does not exist'
      }
    )

    assert.throws(
      () => {
        lunchBreak.setStart('This afternoon')
      }, {
        message: 'Invalid start time "This afternoon": must contain a value of the form "HH:mm" using a 24 hour clock'
      }
    )

    assert.throws(
      () => {
        lunchBreak.setDuration('20 minutes')
      }, {
        message: 'Invalid duration "20 minutes": must contain a value of the form "HH:mm"'
      }
    )

    assert.throws(
      () => {
        lunchBreak.setName('')
      }, {
        message: 'Invalid break name: must be between 1 and 1000 characters long'
      }
    )

    let name = 'a'
    for (let i = 0; i < 100; i++) {
      name += '0123456789'
    }
    assert.throws(() => {
      lunchBreak.setName(name)
    }, {
      message: 'Invalid break name: must be between 1 and 1000 characters long'
    })
    assert.equal(lunchBreak.getName(), null)
  })
})
