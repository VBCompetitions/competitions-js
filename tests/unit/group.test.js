import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'


import { Competition, CompetitionTeam, GroupBreak, GroupMatch, GroupType, Knockout, MatchType, Stage } from '../../src/index.js'

describe('group', () => {
  it('testGroupGetMatch', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'complete-group.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('L').getGroup('LG')

    assert.equal(group.getID(), 'LG')
    assert.equal(group.getMatch('LG1').getHomeTeam().getID(), 'TM2')
  })

  it('testGroupGetMatchSkipBreak', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'complete-group.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('L').getGroup('LG')

    assert.equal(group.getMatch('LG6').getHomeTeam().getID(), 'TM1')
  })

  it('testGroupGetMatchOutOfBounds', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'complete-group.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('L').getGroup('LG')

    assert.throws(() => {
      group.getMatch('FOO')
    }, {
      message: 'Match with ID FOO not found'
    })
  })

  it('testGroupGetTeamIDsSimple', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'complete-group.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('L').getGroup('LG')

    const expectedTeamsSorted = ['TM1', 'TM2', 'TM3', 'TM4']
    const expectedTeamsByName = ['TM2', 'TM1', 'TM4', 'TM3']

    let foundTeams = group.getTeamIDs()
    assert.deepEqual(foundTeams, expectedTeamsByName)

    foundTeams = group.getTeamIDs(Competition.VBC_TEAMS_FIXED_ID)
    assert.deepEqual(foundTeams, expectedTeamsByName)

    foundTeams = group.getTeamIDs(Competition.VBC_TEAMS_KNOWN)
    assert.deepEqual(foundTeams, expectedTeamsByName)

    foundTeams = group.getTeamIDs(Competition.VBC_TEAMS_MAYBE)
    foundTeams.sort((a, b) => a.localeCompare(b))
    assert.deepEqual(foundTeams, [])

    foundTeams = group.getTeamIDs(Competition.VBC_TEAMS_ALL)
    foundTeams.sort((a, b) => a.localeCompare(b))
    assert.deepEqual(foundTeams, expectedTeamsSorted)
  })

  it('testGroupGetTeamIDsMaybes', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'group-maybes.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    let finaTeams = competition.getStage('S4').getGroup('FINA').getTeamIDs(Competition.VBC_TEAMS_MAYBE)
    assert.equal(finaTeams.length, 6)
    assert(finaTeams.includes('TM1'))
    assert(finaTeams.includes('TM2'))
    assert(finaTeams.includes('TM3'))
    assert(finaTeams.includes('TM4'))
    assert(finaTeams.includes('TM5'))
    assert(finaTeams.includes('TM6'))

    finaTeams = competition.getStage('S4').getGroup('FINB').getTeamIDs(Competition.VBC_TEAMS_MAYBE)
    assert.equal(finaTeams.length, 7)
    assert(finaTeams.includes('TM3'))
    assert(finaTeams.includes('TM4'))
    assert(finaTeams.includes('TM5'))
    assert(finaTeams.includes('TM6'))
    assert(finaTeams.includes('TM7'))
    assert(finaTeams.includes('TM8'))
    assert(finaTeams.includes('TM9'))

    const sfbTeams = competition.getStage('S3').getGroup('SFB').getTeamIDs(Competition.VBC_TEAMS_MAYBE)
    assert.equal(sfbTeams.length, 2)
    assert(sfbTeams.includes('TM5'))
    assert(sfbTeams.includes('TM6'))
  })

  it('testGroupMatchesWithMatchingIDs', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'group-same-match-id.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Group {L:LG}: matches with duplicate IDs {LG1} not allowed'
    })
  })

  it('testGroupContinuousMatchesWithoutComplete', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'group-continuous-missing-complete.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Group {L:LG}, match ID {LG3}, missing field "complete"'
    })
  })

  it('testGroupGroupMatchesWithAllOptionalFields', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'group-matches-with-everything.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('L').getGroup('LG')

    assert.equal(group.getCompetition().getName(), 'Test League Table by PD')
    assert.equal(group.getStage().getName(), 'League')
    assert.equal(group.getName(), 'League 1')
    assert.equal(group.getNotes(), 'These are notes on the group')
    assert(Array.isArray(group.getDescription()))
    assert.equal(group.getDescription().length, 2)
    assert.equal(group.getDescription()[0], 'This is a description about the group')
    assert.equal(group.getDescription()[1], 'This is some more words')
    assert(group.matchesHaveCourts())
    assert(group.matchesHaveDates())
    assert(group.matchesHaveDurations())
    assert(group.matchesHaveMVPs())
    assert(group.matchesHaveManagers())
    assert(group.matchesHaveNotes())
    assert(group.matchesHaveOfficials())
    assert(group.matchesHaveStarts())
    assert(group.matchesHaveVenues())
    assert(group.matchesHaveWarmups())

    assert(group.allTeamsKnown())
  })

  it('testGroupGroupMatchesWithNoOptionalFields', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'group-matches-with-nothing.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('L').getGroup('LG')

    assert.equal(group.getName(), null)
    assert.equal(group.getNotes(), null)
    assert.equal(group.getDescription(), null)
    assert(!group.matchesHaveCourts())
    assert(!group.matchesHaveDates())
    assert(!group.matchesHaveDurations())
    assert(!group.matchesHaveMVPs())
    assert(!group.matchesHaveManagers())
    assert(!group.matchesHaveNotes())
    assert(!group.matchesHaveOfficials())
    assert(!group.matchesHaveStarts())
    assert(!group.matchesHaveVenues())
    assert(!group.matchesHaveWarmups())

    assert(group.allTeamsKnown())
  })

  it('testGroupGetMatchesAllInGroup', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'complete-group.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('L').getGroup('LG')

    const matches = group.getMatches('TM1', Competition.VBC_MATCH_ALL_IN_GROUP)
    assert.equal(matches.length, 7)
    const matchThree = matches[2]
    assert(matchThree instanceof GroupMatch)
    assert.equal(matchThree.getHomeTeam().getID(), 'TM2')
    assert.equal(matchThree.getAwayTeam().getID(), 'TM3')
    if (matchThree instanceof GroupMatch) {
      assert.equal(matchThree.getCourt(), '1')
    }
  })

  it('testGroupGetMatchesUnknownTeam', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'complete-group.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('L').getGroup('LG')

    const matches = group.getMatches(CompetitionTeam.UNKNOWN_TEAM_ID)
    assert.equal(matches.length, 7)
    const matchThree = matches[2]
    assert(matchThree instanceof GroupMatch)
    assert.equal(matchThree.getHomeTeam().getID(), 'TM2')
    assert.equal(matchThree.getAwayTeam().getID(), 'TM3')
    if (matchThree instanceof GroupMatch) {
      assert.equal(matchThree.getCourt(), '1')
    }
  })

  it('testGroupGetMatchesKnownTeamPlaying', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'complete-group.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('L').getGroup('LG')

    const matches = group.getMatches('TM2', Competition.VBC_MATCH_PLAYING)
    assert.equal(matches.length, 3)
    const matchThree = matches[2]
    assert(matchThree instanceof GroupMatch)
    assert.equal(matchThree.getHomeTeam().getID(), 'TM1')
    assert.equal(matchThree.getAwayTeam().getID(), 'TM2')
  })

  it('testGroupGetMatchesKnownTeamOfficiating', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'complete-group.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('L').getGroup('LG')

    const matches = group.getMatches('TM2', Competition.VBC_MATCH_OFFICIATING)
    assert.equal(matches.length, 2)
    const matchTwo = matches[1]
    assert(matchTwo instanceof GroupMatch)
    assert.equal(matchTwo.getHomeTeam().getID(), 'TM3')
    assert.equal(matchTwo.getAwayTeam().getID(), 'TM4')
  })

  it('testGroupGetMatchesKnownTeamAll', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'complete-group.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('L').getGroup('LG')

    const matches = group.getMatches('TM2', Competition.VBC_MATCH_PLAYING | Competition.VBC_MATCH_OFFICIATING)
    assert.equal(matches.length, 5)
    const matchFour = matches[3]
    assert(matchFour instanceof GroupMatch)
    assert.equal(matchFour.getHomeTeam().getID(), 'TM3')
    assert.equal(matchFour.getAwayTeam().getID(), 'TM4')
  })

  it('testGroupGetMatchesWithReferencesKnownTeamPlaying', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'complete-group-knockout.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('C').getGroup('CP')

    const matches = group.getMatches('TM2', Competition.VBC_MATCH_PLAYING)
    assert.equal(matches.length, 3)
    const matchTwo = matches[1]
    assert(matchTwo instanceof GroupMatch)
    assert.equal(competition.getTeam(matchTwo.getHomeTeam().getID()).getID(), 'TM2')
    assert.equal(competition.getTeam(matchTwo.getAwayTeam().getID()).getID(), 'TM6')
    const matchThree = matches[2]
    assert(matchTwo instanceof GroupMatch)
    assert.equal(competition.getTeam(matchThree.getHomeTeam().getID()).getID(), 'TM2')
    assert.equal(competition.getTeam(matchThree.getAwayTeam().getID()).getID(), 'TM3')
  })

  it('testGroupGetMatchesWithReferencesKnownTeamOfficiating', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'complete-group-knockout.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('C').getGroup('CP')

    const matches = group.getMatches('TM2', Competition.VBC_MATCH_OFFICIATING)
    assert.equal(matches.length, 1)
    const matchOne = matches[0]
    assert(matchOne instanceof GroupMatch)
    assert.equal(competition.getTeam(matchOne.getOfficials().getTeamID()).getID(), 'TM2')
  })

  it('testGroupGetMatchesWithReferencesKnownTeamAll', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'complete-group-knockout.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('C').getGroup('CP')

    const matches = group.getMatches('TM2', Competition.VBC_MATCH_PLAYING | Competition.VBC_MATCH_OFFICIATING)
    assert.equal(matches.length, 4)
    const matchFour = matches[3]
    assert(matchFour instanceof GroupMatch)
    assert.equal(competition.getTeam(matchFour.getHomeTeam().getID()).getID(), 'TM6')
    assert.equal(competition.getTeam(matchFour.getAwayTeam().getID()).getID(), 'TM7')
  })

  it('testGroupGetMatchDatesFromGroup', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const groupA = competition.getStage('HVAGP').getGroup('A')
    const groupB = competition.getStage('HVAGP').getGroup('B')
    const datesA = groupA.getMatchDates()
    const datesB = groupB.getMatchDates()

    assert.equal(datesA.length, 4)
    assert.deepEqual(datesA, ['2023-10-22', '2024-01-21', '2024-02-11', '2024-03-24'])
    assert.equal(datesB.length, 3)
    assert.deepEqual(datesB, ['2023-11-26', '2024-02-25', '2024-04-21'])
  })

  it('testGroupGetMatchDatesForTeamFromGroup', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const groupA = competition.getStage('HVAGP').getGroup('A')
    const datesTMC = groupA.getMatchDates('TMC')

    assert.equal(datesTMC.length, 3)
    assert.deepEqual(datesTMC, ['2024-01-21', '2024-02-11', '2024-03-24'])
  })

  it('testGroupGetMatchDatesForTeamPlaying', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const groupC = competition.getStage('HVAGP2').getGroup('C')
    const datesTMK = groupC.getMatchDates('TMK', Competition.VBC_MATCH_PLAYING)

    assert.equal(datesTMK.length, 2)
    assert.deepEqual(datesTMK, ['2023-11-26', '2024-02-25'])
  })

  it('testGroupGetMatchDatesForTeamOfficiating', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const groupC = competition.getStage('HVAGP2').getGroup('C')
    const datesTMM = groupC.getMatchDates('TMM', Competition.VBC_MATCH_OFFICIATING)

    assert.equal(datesTMM.length, 2)
    assert.deepEqual(datesTMM, ['2023-11-26', '2024-02-25'])
  })

  it('testGroupGetMatchesOnDate', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const groupA = competition.getStage('HVAGP').getGroup('A')
    const matches = groupA.getMatchesOnDate('2023-10-22')

    assert.equal(matches.length, 13)
    assert.equal(matches[5].getID(), 'GP1AM5')
  })

  it('testGroupGetMatchesOnDateForTeam', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const groupA = competition.getStage('HVAGP').getGroup('A')
    const matchesTMC = groupA.getMatchesOnDate('2024-01-21', 'TMC')
    assert.equal(matchesTMC.length, 12)
    assert.equal(matchesTMC[8].getID(), 'GP2AM9')
  })

  it('testGroupGetMatchesOnDateForTeamPlaying', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const groupA = competition.getStage('HVAGP').getGroup('A')
    const matchesTMC = groupA.getMatchesOnDate('2023-10-22', 'TMC', Competition.VBC_MATCH_PLAYING | Competition.VBC_MATCH_OFFICIATING)
    assert.equal(matchesTMC.length, 1)
    assert(matchesTMC[0] instanceof GroupBreak)

    const groupC = competition.getStage('HVAGP2').getGroup('C')
    const matchesTMK = groupC.getMatchesOnDate('2023-11-26', 'TMK', Competition.VBC_MATCH_PLAYING)
    assert.equal(matchesTMK.length, 3)
    assert.equal(matchesTMK[1].getID(), 'GP1CM7')
  })

  it('testGroupGetMatchesOnDateForTeamOfficiating', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const groupC = competition.getStage('HVAGP2').getGroup('C')
    const matchesTMM = groupC.getMatchesOnDate('2024-02-25', 'TMM', Competition.VBC_MATCH_OFFICIATING)
    assert.equal(matchesTMM.length, 1)
    assert.equal(matchesTMM[0].getID(), 'GP2CM9')
  })

  it('testGroupAllTeamsKnown', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'incomplete-group-multi-stage.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const poolA = competition.getStage('P').getGroup('A')
    const poolB = competition.getStage('P').getGroup('B')
    const finals = competition.getStage('F').getGroup('F')

    assert(poolA.allTeamsKnown())
    assert(poolB.allTeamsKnown())
    assert(!finals.allTeamsKnown())
  })

  it('testGroupTeamHasMatches', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'incomplete-group-multi-stage.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const poolA = competition.getStage('P').getGroup('A')
    const finals = competition.getStage('F').getGroup('F')

    assert(poolA.teamHasMatches('TM1'))
    assert(!poolA.teamHasMatches('TM5'))
    assert(finals.teamHasMatches('TM2'))
    assert(finals.teamHasMatches('TM3')) // here
    assert(!finals.teamHasMatches('TM6'))
  })

  it('testGroupTeamHasOfficiating', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'incomplete-group-multi-stage.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const poolA = competition.getStage('P').getGroup('A')
    const finals = competition.getStage('F').getGroup('F')

    assert(poolA.teamHasOfficiating('TM1'))
    assert(!poolA.teamHasOfficiating('TM5'))
    assert(finals.teamHasOfficiating('TM3'))
    assert(!finals.teamHasOfficiating('TM2'))
  })

  it('testGroupTeamMayHaveMatches', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'incomplete-group-multi-stage.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const poolA = competition.getStage('P').getGroup('A')
    const finals = competition.getStage('F').getGroup('F')

    assert(!poolA.teamMayHaveMatches('TM1'))
    assert(finals.teamMayHaveMatches('TM2'))
    assert(finals.teamMayHaveMatches('TM6'))
    assert(finals.teamMayHaveMatches('TM7'))
    assert(!finals.teamMayHaveMatches('unknown-team-reference'))
  })

  it('testGroupSettersGetters', async () => {
    const competitionJSON = await readFile(new URL(path.join('groups', 'group-matches-with-everything.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStage('L').getGroup('LG')

    assert.equal(group.getName(), 'League 1')
    group.setName('League One')
    assert.equal(group.getName(), 'League One')
    group.setName(null)
    assert.equal(group.getName(), null)

    assert.equal(group.getNotes(), 'These are notes on the group')
    group.setNotes('These are notes on the best group')
    assert.equal(group.getNotes(), 'These are notes on the best group')
    group.setNotes(null)
    assert.equal(group.getNotes(), null)

    assert.equal(group.getDescription()[0], 'This is a description about the group')
    group.setDescription(['This is line one of the description', 'This is some more words'])
    assert.equal(group.getDescription()[0], 'This is line one of the description')
    group.setDescription(null)
    assert.equal(group.getDescription(), null)

    assert(!group.getDrawsAllowed())
    group.setDrawsAllowed(true)
    assert(group.getDrawsAllowed())

    assert.equal(group.getType(), GroupType.LEAGUE)
  })

  it('testGroupGetTeamByIDBlocksBadType', async () => {
    const competition = new Competition('test')
    const stage = new Stage(competition, 'S')
    const group = new Knockout(stage, 'Finals', MatchType.CONTINUOUS)

    assert.throws(() => {
      group.getTeam('league', '1')
    }, {
      message: 'Invalid type "league" in team reference.  Cannot get league position from a non-league group'
    })
  })
})
