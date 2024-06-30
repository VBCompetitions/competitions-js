import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Competition, CompetitionTeam, GroupMatch, GroupType, League, LeagueConfig, LeagueConfigPoints, LeagueTable, LeagueTableEntry, MatchOfficials, MatchTeam, MatchType, Stage } from '../../src/index.js'

describe('league', () => {
  it('testLeague1', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('L').getGroup('LG')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(3)
    tm1.setWins(0)
    tm1.setLosses(3)
    tm1.setPF(72)
    tm1.setPA(84)
    tm1.setPD(-12)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(0)
    tm1.getH2H().TM2 = -1
    tm1.getH2H().TM3 = -1
    tm1.getH2H().TM4 = -1
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(3)
    tm2.setWins(1)
    tm2.setLosses(2)
    tm2.setPF(76)
    tm2.setPA(74)
    tm2.setPD(2)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(3)
    tm2.getH2H().TM1 = 1
    tm2.getH2H().TM3 = -1
    tm2.getH2H().TM4 = -1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(3)
    tm3.setWins(2)
    tm3.setLosses(1)
    tm3.setPF(75)
    tm3.setPA(75)
    tm3.setPD(0)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(6)
    tm3.getH2H().TM1 = 1
    tm3.getH2H().TM2 = 1
    tm3.getH2H().TM4 = -1
    const tm4 = new LeagueTableEntry(league, 'TM4', 'Team 4')
    tm4.setPlayed(3)
    tm4.setWins(3)
    tm4.setLosses(0)
    tm4.setPF(80)
    tm4.setPA(70)
    tm4.setPD(10)
    tm4.setBP(0)
    tm4.setPP(0)
    tm4.setPTS(9)
    tm4.getH2H().TM1 = 1
    tm4.getH2H().TM2 = 1
    tm4.getH2H().TM3 = 1

    expectedTable.entries.push(tm4)
    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm2)
    expectedTable.entries.push(tm1)

    const table = league.getLeagueTable()

    assert(league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
    assert.deepEqual(table.entries[3].serialize(), expectedTable.entries[3].serialize())
    assert.equal(league.getType(), GroupType.LEAGUE)
    assert.equal(table.getGroupID(), 'LG')
    assert.deepEqual(table.entries[0].getGroupID(), 'LG')
    assert(!table.hasDraws())

    assert.throws(() => {
      league.getTeam('league', '5')
    }, {
      message: 'Invalid League position: position is bigger than the number of teams'
    })
  })

  it('testLeagueByPD', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league-pd.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('L').getGroup('LG')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(3)
    tm1.setWins(0)
    tm1.setLosses(3)
    tm1.setSF(0)
    tm1.setSA(9)
    tm1.setSD(-9)
    tm1.setPF(194)
    tm1.setPA(235)
    tm1.setPD(-41)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(0)
    tm1.getH2H().TM2 = -1
    tm1.getH2H().TM3 = -1
    tm1.getH2H().TM4 = -1
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(3)
    tm2.setWins(2)
    tm2.setLosses(1)
    tm2.setSF(6)
    tm2.setSA(3)
    tm2.setSD(3)
    tm2.setPF(215)
    tm2.setPA(203)
    tm2.setPD(12)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(6)
    tm2.getH2H().TM1 = 1
    tm2.getH2H().TM3 = -1
    tm2.getH2H().TM4 = 1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(3)
    tm3.setWins(2)
    tm3.setLosses(1)
    tm3.setSF(6)
    tm3.setSA(3)
    tm3.setSD(3)
    tm3.setPF(219)
    tm3.setPA(204)
    tm3.setPD(15)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(6)
    tm3.getH2H().TM1 = 1
    tm3.getH2H().TM2 = 1
    tm3.getH2H().TM4 = -1
    const tm4 = new LeagueTableEntry(league, 'TM4', 'Team 4')
    tm4.setPlayed(3)
    tm4.setWins(2)
    tm4.setLosses(1)
    tm4.setSF(6)
    tm4.setSA(3)
    tm4.setSD(3)
    tm4.setPF(224)
    tm4.setPA(210)
    tm4.setPD(14)
    tm4.setBP(0)
    tm4.setPP(0)
    tm4.setPTS(6)
    tm4.getH2H().TM1 = 1
    tm4.getH2H().TM2 = -1
    tm4.getH2H().TM3 = 1

    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm4)
    expectedTable.entries.push(tm2)
    expectedTable.entries.push(tm1)

    const table = league.getLeagueTable()

    assert(league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
    assert.deepEqual(table.entries[3].serialize(), expectedTable.entries[3].serialize())
  })

  it('testLeagueBySD', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league-sd.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('L').getGroup('LG')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(3)
    tm1.setWins(0)
    tm1.setLosses(3)
    tm1.setSF(0)
    tm1.setSA(9)
    tm1.setSD(-9)
    tm1.setPF(184)
    tm1.setPA(235)
    tm1.setPD(-51)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(0)
    tm1.getH2H().TM2 = -1
    tm1.getH2H().TM3 = -1
    tm1.getH2H().TM4 = -1
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(3)
    tm2.setWins(2)
    tm2.setLosses(1)
    tm2.setSF(6)
    tm2.setSA(4)
    tm2.setSD(2)
    tm2.setPF(236)
    tm2.setPA(219)
    tm2.setPD(17)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(6)
    tm2.getH2H().TM1 = 1
    tm2.getH2H().TM3 = -1
    tm2.getH2H().TM4 = 1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(3)
    tm3.setWins(2)
    tm3.setLosses(1)
    tm3.setSF(6)
    tm3.setSA(3)
    tm3.setSD(3)
    tm3.setPF(220)
    tm3.setPA(203)
    tm3.setPD(17)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(6)
    tm3.getH2H().TM1 = 1
    tm3.getH2H().TM2 = 1
    tm3.getH2H().TM4 = -1
    const tm4 = new LeagueTableEntry(league, 'TM4', 'Team 4')
    tm4.setPlayed(3)
    tm4.setWins(2)
    tm4.setLosses(1)
    tm4.setSF(7)
    tm4.setSA(3)
    tm4.setSD(4)
    tm4.setPF(249)
    tm4.setPA(232)
    tm4.setPD(17)
    tm4.setBP(0)
    tm4.setPP(0)
    tm4.setPTS(6)
    tm4.getH2H().TM1 = 1
    tm4.getH2H().TM2 = -1
    tm4.getH2H().TM3 = 1

    expectedTable.entries.push(tm4)
    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm2)
    expectedTable.entries.push(tm1)

    const table = league.getLeagueTable()

    assert(league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
    assert.deepEqual(table.entries[3].serialize(), expectedTable.entries[3].serialize())
  })

  it('testLeagueByH2HA', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league-h2h.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('L').getGroup('LG1')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(3)
    tm1.setWins(1)
    tm1.setLosses(2)
    tm1.setSF(3)
    tm1.setSA(6)
    tm1.setSD(-3)
    tm1.setPF(202)
    tm1.setPA(226)
    tm1.setPD(-24)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(3)
    tm1.getH2H().TM2 = -1
    tm1.getH2H().TM3 = 1
    tm1.getH2H().TM4 = -1
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(3)
    tm2.setWins(2)
    tm2.setLosses(1)
    tm2.setSF(6)
    tm2.setSA(3)
    tm2.setSD(3)
    tm2.setPF(216)
    tm2.setPA(202)
    tm2.setPD(14)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(6)
    tm2.getH2H().TM1 = 1
    tm2.getH2H().TM3 = -1
    tm2.getH2H().TM4 = 1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(3)
    tm3.setWins(1)
    tm3.setLosses(2)
    tm3.setSF(3)
    tm3.setSA(6)
    tm3.setSD(-3)
    tm3.setPF(210)
    tm3.setPA(214)
    tm3.setPD(-4)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(3)
    tm3.getH2H().TM1 = -1
    tm3.getH2H().TM2 = 1
    tm3.getH2H().TM4 = -1
    const tm4 = new LeagueTableEntry(league, 'TM4', 'Team 4')
    tm4.setPlayed(3)
    tm4.setWins(2)
    tm4.setLosses(1)
    tm4.setSF(6)
    tm4.setSA(3)
    tm4.setSD(3)
    tm4.setPF(224)
    tm4.setPA(210)
    tm4.setPD(14)
    tm4.setBP(0)
    tm4.setPP(0)
    tm4.setPTS(6)
    tm4.getH2H().TM1 = 1
    tm4.getH2H().TM2 = -1
    tm4.getH2H().TM3 = 1

    expectedTable.entries.push(tm2)
    expectedTable.entries.push(tm4)
    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm1)

    const table = league.getLeagueTable()

    assert(league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
    assert.deepEqual(table.entries[3].serialize(), expectedTable.entries[3].serialize())
  })

  it('testLeagueByH2HB', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league-h2h.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('L2').getGroup('LG2')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(3)
    tm1.setWins(1)
    tm1.setLosses(2)
    tm1.setSF(3)
    tm1.setSA(6)
    tm1.setSD(-3)
    tm1.setPF(202)
    tm1.setPA(226)
    tm1.setPD(-24)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(3)
    tm1.getH2H().TM2 = -1
    tm1.getH2H().TM3 = 1
    tm1.getH2H().TM4 = -1
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(3)
    tm2.setWins(2)
    tm2.setLosses(1)
    tm2.setSF(6)
    tm2.setSA(3)
    tm2.setSD(3)
    tm2.setPF(208)
    tm2.setPA(194)
    tm2.setPD(14)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(6)
    tm2.getH2H().TM1 = 1
    tm2.getH2H().TM3 = 1
    tm2.getH2H().TM4 = -1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(3)
    tm3.setWins(1)
    tm3.setLosses(2)
    tm3.setSF(3)
    tm3.setSA(6)
    tm3.setSD(-3)
    tm3.setPF(205)
    tm3.setPA(209)
    tm3.setPD(-4)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(3)
    tm3.getH2H().TM1 = -1
    tm3.getH2H().TM2 = -1
    tm3.getH2H().TM4 = 1
    const tm4 = new LeagueTableEntry(league, 'TM4', 'Team 4')
    tm4.setPlayed(3)
    tm4.setWins(2)
    tm4.setLosses(1)
    tm4.setSF(6)
    tm4.setSA(3)
    tm4.setSD(3)
    tm4.setPF(211)
    tm4.setPA(197)
    tm4.setPD(14)
    tm4.setBP(0)
    tm4.setPP(0)
    tm4.setPTS(6)
    tm4.getH2H().TM1 = 1
    tm4.getH2H().TM2 = 1
    tm4.getH2H().TM3 = -1

    expectedTable.entries.push(tm4)
    expectedTable.entries.push(tm2)
    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm1)

    const table = league.getLeagueTable()

    assert(league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
    assert.deepEqual(table.entries[3].serialize(), expectedTable.entries[3].serialize())
  })

  it('testLeagueByH2HPlayTwice', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league-h2h-twice.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('L').getGroup('LG1')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(6)
    tm1.setWins(2)
    tm1.setLosses(4)
    tm1.setSF(6)
    tm1.setSA(12)
    tm1.setSD(-6)
    tm1.setPF(404)
    tm1.setPA(452)
    tm1.setPD(-48)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(6)
    tm1.getH2H().TM2 = -2
    tm1.getH2H().TM3 = 2
    tm1.getH2H().TM4 = -2
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(6)
    tm2.setWins(4)
    tm2.setLosses(2)
    tm2.setSF(12)
    tm2.setSA(6)
    tm2.setSD(6)
    tm2.setPF(432)
    tm2.setPA(404)
    tm2.setPD(28)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(12)
    tm2.getH2H().TM1 = 2
    tm2.getH2H().TM3 = -2
    tm2.getH2H().TM4 = 2
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(6)
    tm3.setWins(2)
    tm3.setLosses(4)
    tm3.setSF(6)
    tm3.setSA(12)
    tm3.setSD(-6)
    tm3.setPF(420)
    tm3.setPA(428)
    tm3.setPD(-8)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(6)
    tm3.getH2H().TM1 = -2
    tm3.getH2H().TM2 = 2
    tm3.getH2H().TM4 = -2
    const tm4 = new LeagueTableEntry(league, 'TM4', 'Team 4')
    tm4.setPlayed(6)
    tm4.setWins(4)
    tm4.setLosses(2)
    tm4.setSF(12)
    tm4.setSA(6)
    tm4.setSD(6)
    tm4.setPF(448)
    tm4.setPA(420)
    tm4.setPD(28)
    tm4.setBP(0)
    tm4.setPP(0)
    tm4.setPTS(12)
    tm4.getH2H().TM1 = 2
    tm4.getH2H().TM2 = -2
    tm4.getH2H().TM3 = 2

    expectedTable.entries.push(tm2)
    expectedTable.entries.push(tm4)
    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm1)

    const table = league.getLeagueTable()

    assert(league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
    assert.deepEqual(table.entries[3].serialize(), expectedTable.entries[3].serialize())
  })

  it('testLeagueByPTS', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league-comparisons.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('PTS').getGroup('PTS')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(2)
    tm1.setWins(1)
    tm1.setLosses(1)
    tm1.setSF(3)
    tm1.setSA(2)
    tm1.setSD(1)
    tm1.setPF(120)
    tm1.setPA(117)
    tm1.setPD(3)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(4)
    tm1.getH2H().TM2 = 1
    tm1.getH2H().TM3 = -1
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(2)
    tm2.setWins(0)
    tm2.setLosses(2)
    tm2.setSF(0)
    tm2.setSA(4)
    tm2.setSD(-4)
    tm2.setPF(88)
    tm2.setPA(100)
    tm2.setPD(-12)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(0)
    tm2.getH2H().TM1 = -1
    tm2.getH2H().TM3 = -1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(2)
    tm3.setWins(2)
    tm3.setLosses(0)
    tm3.setSF(4)
    tm3.setSA(1)
    tm3.setSD(3)
    tm3.setPF(123)
    tm3.setPA(114)
    tm3.setPD(9)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(6)
    tm3.getH2H().TM1 = 1
    tm3.getH2H().TM2 = 1

    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm1)
    expectedTable.entries.push(tm2)

    const table = league.getLeagueTable()

    assert(league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
  })

  it('testLeagueByPF', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league-comparisons.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('PF').getGroup('PF')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(2)
    tm1.setWins(1)
    tm1.setLosses(1)
    tm1.setSF(3)
    tm1.setSA(2)
    tm1.setSD(1)
    tm1.setPF(120)
    tm1.setPA(117)
    tm1.setPD(3)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(4)
    tm1.getH2H().TM2 = 1
    tm1.getH2H().TM3 = -1
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(2)
    tm2.setWins(0)
    tm2.setLosses(2)
    tm2.setSF(0)
    tm2.setSA(4)
    tm2.setSD(-4)
    tm2.setPF(88)
    tm2.setPA(100)
    tm2.setPD(-12)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(0)
    tm2.getH2H().TM1 = -1
    tm2.getH2H().TM3 = -1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(2)
    tm3.setWins(2)
    tm3.setLosses(0)
    tm3.setSF(4)
    tm3.setSA(1)
    tm3.setSD(3)
    tm3.setPF(123)
    tm3.setPA(114)
    tm3.setPD(9)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(6)
    tm3.getH2H().TM1 = 1
    tm3.getH2H().TM2 = 1

    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm1)
    expectedTable.entries.push(tm2)

    const table = league.getLeagueTable()

    assert(league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
  })

  it('testLeagueByPA', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league-comparisons.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('PA').getGroup('PA')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(2)
    tm1.setWins(1)
    tm1.setLosses(1)
    tm1.setSF(3)
    tm1.setSA(2)
    tm1.setSD(1)
    tm1.setPF(120)
    tm1.setPA(117)
    tm1.setPD(3)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(4)
    tm1.getH2H().TM2 = 1
    tm1.getH2H().TM3 = -1
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(2)
    tm2.setWins(0)
    tm2.setLosses(2)
    tm2.setSF(0)
    tm2.setSA(4)
    tm2.setSD(-4)
    tm2.setPF(88)
    tm2.setPA(100)
    tm2.setPD(-12)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(0)
    tm2.getH2H().TM1 = -1
    tm2.getH2H().TM3 = -1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(2)
    tm3.setWins(2)
    tm3.setLosses(0)
    tm3.setSF(4)
    tm3.setSA(1)
    tm3.setSD(3)
    tm3.setPF(123)
    tm3.setPA(114)
    tm3.setPD(9)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(6)
    tm3.getH2H().TM1 = 1
    tm3.getH2H().TM2 = 1

    expectedTable.entries.push(tm2)
    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm1)

    const table = league.getLeagueTable()

    assert(league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
  })

  it('testLeagueBySF', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league-comparisons.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('SF').getGroup('SF')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(2)
    tm1.setWins(1)
    tm1.setLosses(1)
    tm1.setSF(3)
    tm1.setSA(2)
    tm1.setSD(1)
    tm1.setPF(120)
    tm1.setPA(117)
    tm1.setPD(3)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(4)
    tm1.getH2H().TM2 = 1
    tm1.getH2H().TM3 = -1
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(2)
    tm2.setWins(0)
    tm2.setLosses(2)
    tm2.setSF(0)
    tm2.setSA(4)
    tm2.setSD(-4)
    tm2.setPF(88)
    tm2.setPA(100)
    tm2.setPD(-12)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(0)
    tm2.getH2H().TM1 = -1
    tm2.getH2H().TM3 = -1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(2)
    tm3.setWins(2)
    tm3.setLosses(0)
    tm3.setSF(4)
    tm3.setSA(1)
    tm3.setSD(3)
    tm3.setPF(123)
    tm3.setPA(114)
    tm3.setPD(9)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(6)
    tm3.getH2H().TM1 = 1
    tm3.getH2H().TM2 = 1

    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm1)
    expectedTable.entries.push(tm2)

    const table = league.getLeagueTable()

    assert(league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
  })

  it('testLeagueBySA', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league-comparisons.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('SA').getGroup('SA')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(2)
    tm1.setWins(1)
    tm1.setLosses(1)
    tm1.setSF(3)
    tm1.setSA(2)
    tm1.setSD(1)
    tm1.setPF(120)
    tm1.setPA(117)
    tm1.setPD(3)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(4)
    tm1.getH2H().TM2 = 1
    tm1.getH2H().TM3 = -1
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(2)
    tm2.setWins(0)
    tm2.setLosses(2)
    tm2.setSF(0)
    tm2.setSA(4)
    tm2.setSD(-4)
    tm2.setPF(88)
    tm2.setPA(100)
    tm2.setPD(-12)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(0)
    tm2.getH2H().TM1 = -1
    tm2.getH2H().TM3 = -1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(2)
    tm3.setWins(2)
    tm3.setLosses(0)
    tm3.setSF(4)
    tm3.setSA(1)
    tm3.setSD(3)
    tm3.setPF(123)
    tm3.setPA(114)
    tm3.setPD(9)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(6)
    tm3.getH2H().TM1 = 1
    tm3.getH2H().TM2 = 1

    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm1)
    expectedTable.entries.push(tm2)

    const table = league.getLeagueTable()

    assert(league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
  })

  it('testLeagueIncomplete', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'incomplete-league.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('L').getGroup('LG')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(1)
    tm1.setWins(1)
    tm1.setLosses(0)
    tm1.setSF(0)
    tm1.setSA(0)
    tm1.setSD(0)
    tm1.setPF(22)
    tm1.setPA(14)
    tm1.setPD(8)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(3)
    tm1.getH2H().TM3 = 1
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(1)
    tm2.setWins(1)
    tm2.setLosses(0)
    tm2.setSF(0)
    tm2.setSA(0)
    tm2.setSD(0)
    tm2.setPF(20)
    tm2.setPA(15)
    tm2.setPD(5)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(3)
    tm2.getH2H().TM4 = 1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(1)
    tm3.setWins(0)
    tm3.setLosses(1)
    tm3.setSF(0)
    tm3.setSA(0)
    tm3.setSD(0)
    tm3.setPF(14)
    tm3.setPA(22)
    tm3.setPD(-8)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(0)
    tm3.getH2H().TM1 = -1
    const tm4 = new LeagueTableEntry(league, 'TM4', 'Team 4')
    tm4.setPlayed(1)
    tm4.setWins(0)
    tm4.setLosses(1)
    tm4.setSF(0)
    tm4.setSA(0)
    tm4.setSD(0)
    tm4.setPF(15)
    tm4.setPA(20)
    tm4.setPD(-5)
    tm4.setBP(0)
    tm4.setPP(0)
    tm4.setPTS(0)
    tm4.getH2H().TM2 = -1

    expectedTable.entries.push(tm1)
    expectedTable.entries.push(tm2)
    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm4)

    const table = league.getLeagueTable()

    assert(!league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
    assert.deepEqual(table.entries[3].serialize(), expectedTable.entries[3].serialize())
  })

  it('testLeagueIncompleteDraws', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'incomplete-league.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('LD').getGroup('LG')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(1)
    tm1.setWins(0)
    tm1.setLosses(0)
    tm1.setDraws(1)
    tm1.setSF(0)
    tm1.setSA(0)
    tm1.setSD(0)
    tm1.setPF(22)
    tm1.setPA(22)
    tm1.setPD(0)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(0)
    tm1.getH2H().TM3 = 0
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(1)
    tm2.setWins(1)
    tm2.setLosses(0)
    tm2.setSF(0)
    tm2.setSA(0)
    tm2.setSD(0)
    tm2.setPF(35)
    tm2.setPA(30)
    tm2.setPD(5)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(3)
    tm2.getH2H().TM4 = 1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(1)
    tm3.setWins(0)
    tm3.setLosses(0)
    tm3.setDraws(1)
    tm3.setSF(0)
    tm3.setSA(0)
    tm3.setSD(0)
    tm3.setPF(22)
    tm3.setPA(22)
    tm3.setPD(0)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(0)
    tm3.getH2H().TM1 = 0
    const tm4 = new LeagueTableEntry(league, 'TM4', 'Team 4')
    tm4.setPlayed(1)
    tm4.setWins(0)
    tm4.setLosses(1)
    tm4.setSF(0)
    tm4.setSA(0)
    tm4.setSD(0)
    tm4.setPF(30)
    tm4.setPA(35)
    tm4.setPD(-5)
    tm4.setBP(0)
    tm4.setPP(0)
    tm4.setPTS(0)
    tm4.getH2H().TM2 = -1

    expectedTable.entries.push(tm2)
    expectedTable.entries.push(tm4)
    expectedTable.entries.push(tm1)
    expectedTable.entries.push(tm3)

    const table = league.getLeagueTable()

    assert(!league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
    assert.deepEqual(table.entries[3].serialize(), expectedTable.entries[3].serialize())
  })

  it('testLeagueIncompleteSets', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'incomplete-league.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('LS').getGroup('LG')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(1)
    tm1.setWins(0)
    tm1.setLosses(0)
    tm1.setDraws(1)
    tm1.setSF(1)
    tm1.setSA(1)
    tm1.setSD(0)
    tm1.setPF(40)
    tm1.setPA(39)
    tm1.setPD(1)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(0)
    tm1.getH2H().TM3 = 0
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(1)
    tm2.setWins(1)
    tm2.setLosses(0)
    tm2.setSF(2)
    tm2.setSA(0)
    tm2.setSD(2)
    tm2.setPF(50)
    tm2.setPA(38)
    tm2.setPD(12)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(3)
    tm2.getH2H().TM4 = 1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(1)
    tm3.setWins(0)
    tm3.setLosses(0)
    tm3.setDraws(1)
    tm3.setSF(1)
    tm3.setSA(1)
    tm3.setSD(0)
    tm3.setPF(39)
    tm3.setPA(40)
    tm3.setPD(-1)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(0)
    tm3.getH2H().TM1 = 0
    const tm4 = new LeagueTableEntry(league, 'TM4', 'Team 4')
    tm4.setPlayed(1)
    tm4.setWins(0)
    tm4.setLosses(1)
    tm4.setSF(0)
    tm4.setSA(2)
    tm4.setSD(-2)
    tm4.setPF(38)
    tm4.setPA(50)
    tm4.setPD(-12)
    tm4.setBP(0)
    tm4.setPP(0)
    tm4.setPTS(0)
    tm4.getH2H().TM2 = -1

    expectedTable.entries.push(tm2)
    expectedTable.entries.push(tm1)
    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm4)

    const table = league.getLeagueTable()

    assert(!league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
    assert.deepEqual(table.entries[3].serialize(), expectedTable.entries[3].serialize())
  })

  it('testLeagueWithForfeits', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league-forfeit.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('L').getGroup('LG')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(3)
    tm1.setWins(1)
    tm1.setLosses(2)
    tm1.setPF(72)
    tm1.setPA(56)
    tm1.setPD(16)
    tm1.setBP(0)
    tm1.setPP(0)
    tm1.setPTS(3)
    tm1.getH2H().TM2 = -1
    tm1.getH2H().TM3 = -1
    tm1.getH2H().TM4 = 1
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(3)
    tm2.setWins(1)
    tm2.setLosses(2)
    tm2.setPF(53)
    tm2.setPA(74)
    tm2.setPD(-21)
    tm2.setBP(0)
    tm2.setPP(0)
    tm2.setPTS(1)
    tm2.getH2H().TM1 = 1
    tm2.getH2H().TM3 = -1
    tm2.getH2H().TM4 = -1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(3)
    tm3.setWins(2)
    tm3.setLosses(1)
    tm3.setPF(75)
    tm3.setPA(52)
    tm3.setPD(23)
    tm3.setBP(0)
    tm3.setPP(0)
    tm3.setPTS(6)
    tm3.getH2H().TM1 = 1
    tm3.getH2H().TM2 = 1
    tm3.getH2H().TM4 = -1
    const tm4 = new LeagueTableEntry(league, 'TM4', 'Team 4')
    tm4.setPlayed(3)
    tm4.setWins(2)
    tm4.setLosses(1)
    tm4.setPF(52)
    tm4.setPA(70)
    tm4.setPD(-18)
    tm4.setBP(0)
    tm4.setPP(0)
    tm4.setPTS(4)
    tm4.getH2H().TM1 = -1
    tm4.getH2H().TM2 = 1
    tm4.getH2H().TM3 = 1

    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm4)
    expectedTable.entries.push(tm1)
    expectedTable.entries.push(tm2)

    const table = league.getLeagueTable()

    assert(league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
    assert.deepEqual(table.entries[3].serialize(), expectedTable.entries[3].serialize())
    assert.equal(league.getType(), GroupType.LEAGUE)
  })

  it('testLeagueWithBonusPenalties', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league-bonuses-penalties.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('L').getGroup('LG')
    assert(league instanceof League)

    const expectedTable = new LeagueTable(league)
    const tm1 = new LeagueTableEntry(league, 'TM1', 'Team 1')
    tm1.setPlayed(3)
    tm1.setWins(1)
    tm1.setLosses(2)
    tm1.setPF(72)
    tm1.setPA(56)
    tm1.setPD(16)
    tm1.setBP(2)
    tm1.setPP(2)
    tm1.setPTS(3)
    tm1.getH2H().TM2 = -1
    tm1.getH2H().TM3 = -1
    tm1.getH2H().TM4 = 1
    const tm2 = new LeagueTableEntry(league, 'TM2', 'Team 2')
    tm2.setPlayed(3)
    tm2.setWins(1)
    tm2.setLosses(2)
    tm2.setPF(53)
    tm2.setPA(74)
    tm2.setPD(-21)
    tm2.setBP(0)
    tm2.setPP(5)
    tm2.setPTS(-2)
    tm2.getH2H().TM1 = 1
    tm2.getH2H().TM3 = -1
    tm2.getH2H().TM4 = -1
    const tm3 = new LeagueTableEntry(league, 'TM3', 'Team 3')
    tm3.setPlayed(3)
    tm3.setWins(2)
    tm3.setLosses(1)
    tm3.setPF(75)
    tm3.setPA(52)
    tm3.setPD(23)
    tm3.setBP(8)
    tm3.setPP(0)
    tm3.setPTS(14)
    tm3.getH2H().TM1 = 1
    tm3.getH2H().TM2 = 1
    tm3.getH2H().TM4 = -1
    const tm4 = new LeagueTableEntry(league, 'TM4', 'Team 4')
    tm4.setPlayed(3)
    tm4.setWins(2)
    tm4.setLosses(1)
    tm4.setPF(52)
    tm4.setPA(70)
    tm4.setPD(-18)
    tm4.setBP(2)
    tm4.setPP(2)
    tm4.setPTS(6)
    tm4.getH2H().TM1 = -1
    tm4.getH2H().TM2 = 1
    tm4.getH2H().TM3 = 1

    expectedTable.entries.push(tm3)
    expectedTable.entries.push(tm4)
    expectedTable.entries.push(tm1)
    expectedTable.entries.push(tm2)

    const table = league.getLeagueTable()

    assert(league.isComplete())
    assert.deepEqual(table.entries[0].serialize(), expectedTable.entries[0].serialize())
    assert.deepEqual(table.entries[1].serialize(), expectedTable.entries[1].serialize())
    assert.deepEqual(table.entries[2].serialize(), expectedTable.entries[2].serialize())
    assert.deepEqual(table.entries[3].serialize(), expectedTable.entries[3].serialize())
    assert.equal(league.getType(), GroupType.LEAGUE)
  })

  it('testLeagueWithEveryOrderAndPoints', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league-everything.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('L').getGroup('LG')

    assert(league instanceof League)
    const table = league.getLeagueTable()

    assert.equal(table.getOrderingText(), 'Position is decided by points, then wins, then losses, then head-to-head, then points for, then points against, then points difference, then sets for, then sets against, then sets difference, then bonus points, then penalty points')

    assert.equal(table.getScoringText(), 'Teams win 1 point per played, 2 points per win, 3 points per set, 4 points per win by one set, 5 points per loss, 6 points per loss by one set and 7 points per forfeited match')
  })

  it('testLeagueWithNoScoring', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league-no-scoring.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('L').getGroup('LG')

    assert(league instanceof League)
    const table = league.getLeagueTable()

    assert.equal(table.getScoringText(), '')
  })

  it('testLeagueGroupsWithoutNames', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'league-no-names.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const league = competition.getStage('L')

    assert.equal(league.getGroup('LG0').getName(), null)
    assert.equal(league.getGroup('LG1').getName(), 'League')
    assert.equal(league.getGroup('LG2').getName(), null)
  })

  it('testLeagueWithFriendliesJSON', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'league-with-friendlies.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    const league = competition.getStage('S').getGroup('L')
    const table = league.getLeagueTable()
    assert.deepEqual(table.entries.length, 3)
    assert.deepEqual(table.entries[0].getTeamID(), 'TA')
    assert.deepEqual(table.entries[0].getWins(), 2)
    assert.deepEqual(table.entries[1].getTeamID(), 'TB')
    assert.deepEqual(table.entries[1].getWins(), 1)
    assert.deepEqual(table.entries[2].getTeamID(), 'TC')
    assert.deepEqual(table.entries[2].getWins(), 0)
  })

  it('testLeagueWithFriendliesCode', async () => {
    const competition = new Competition('league with friendlies')
    const teamA = new CompetitionTeam(competition, 'TA', 'Team A')
    const teamB = new CompetitionTeam(competition, 'TB', 'Team B')
    const teamC = new CompetitionTeam(competition, 'TC', 'Team C')
    const teamD = new CompetitionTeam(competition, 'TD', 'Team D')
    competition.addTeam(teamA).addTeam(teamB).addTeam(teamC).addTeam(teamD)
    const stage = new Stage(competition, 'S')
    competition.addStage(stage)
    const league = new League(stage, 'L', MatchType.CONTINUOUS, false)
    stage.addGroup(league)
    const leagueConfig = new LeagueConfig(league)
    league.setLeagueConfig(leagueConfig)
    leagueConfig.setOrdering(['PTS', 'H2H'])
    const configPoints = new LeagueConfigPoints(leagueConfig)
    leagueConfig.setPoints(configPoints)
    const match1 = new GroupMatch(league, 'M1')
    match1.setHomeTeam(new MatchTeam(match1, teamA.getID())).setAwayTeam(new MatchTeam(match1, teamB.getID())).setOfficials(new MatchOfficials(match1, teamC.getID())).setScores([23], [19], true)
    const match2 = new GroupMatch(league, 'M2')
    match2.setHomeTeam(new MatchTeam(match2, teamB.getID())).setAwayTeam(new MatchTeam(match2, teamC.getID())).setOfficials(new MatchOfficials(match2, teamD.getID())).setScores([23], [19], true)
    const match3 = new GroupMatch(league, 'M3')
    match3.setHomeTeam(new MatchTeam(match3, teamC.getID())).setAwayTeam(new MatchTeam(match3, teamD.getID())).setOfficials(new MatchOfficials(match3, teamA.getID())).setScores([23], [19], true).setFriendly(true)
    const match4 = new GroupMatch(league, 'M4')
    match4.setHomeTeam(new MatchTeam(match4, teamD.getID())).setAwayTeam(new MatchTeam(match4, teamB.getID())).setOfficials(new MatchOfficials(match4, teamC.getID())).setScores([19], [123], true).setFriendly(true)
    const match5 = new GroupMatch(league, 'M5')
    match5.setHomeTeam(new MatchTeam(match5, teamA.getID())).setAwayTeam(new MatchTeam(match5, teamC.getID())).setOfficials(new MatchOfficials(match5, teamD.getID())).setScores([23], [19], true)
    const match6 = new GroupMatch(league, 'M6')
    match6.setHomeTeam(new MatchTeam(match6, teamA.getID())).setAwayTeam(new MatchTeam(match6, teamD.getID())).setOfficials(new MatchOfficials(match6, teamC.getID())).setScores([23], [19], true).setFriendly(true)
    league.addMatch(match1).addMatch(match2).addMatch(match3).addMatch(match4).addMatch(match5).addMatch(match6)

    const table = league.getLeagueTable()
    assert.deepEqual(table.entries.length, 3)
    assert.deepEqual(table.entries[0].getTeamID(), 'TA')
    assert.deepEqual(table.entries[0].getWins(), 2)
    assert.deepEqual(table.entries[1].getTeamID(), 'TB')
    assert.deepEqual(table.entries[1].getWins(), 1)
    assert.deepEqual(table.entries[2].getTeamID(), 'TC')
    assert.deepEqual(table.entries[2].getWins(), 0)

    assert.equal(leagueConfig.getLeague(), league)
    assert.equal(configPoints.getLeagueConfig(), leagueConfig)
    assert.equal(table.getLeague(), league)
  })

  it('testLeagueGetTeamLookupsInvalid', async () => {
    const competitionJSON = await readFile(new URL(path.join('leagues', 'complete-league.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    assert.equal(competition.getTeam('{L:LG:LG1:foo}').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)
  })
})
