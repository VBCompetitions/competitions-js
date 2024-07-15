import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Competition, CompetitionTeam, Crossover, GroupBreak, GroupMatch, League, MatchOfficials, MatchTeam, MatchType, Stage } from '../../src/index.js'

describe('stage', () => {
  it('testStageGetters', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'competition.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stage = competition.getStage('L')
    const groups = stage.getGroups()

    assert.equal(groups[0].getName(), 'Recreational League')
    assert.equal(stage.getNotes(), 'Some stage notes')
    assert.equal(stage.getDescription()[0], 'This is a description')
  })

  it('testStageMatchesWithAllOptionalFields', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'stage-matches-with-everything.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stage = competition.getStage('L')

    assert.equal(stage.getCompetition().getName(), 'Matches with Everything')
    assert.equal(stage.getName(), 'League')
    assert.equal(stage.getNotes(), 'These are notes on the stage')
    assert(Array.isArray(stage.getDescription()))
    assert.equal(stage.getDescription().length, 2)
    assert.equal(stage.getDescription()[0], 'This is a description about the stage')
    assert.equal(stage.getDescription()[1], 'This is some more words')
    assert(stage.matchesHaveCourts())
    assert(stage.matchesHaveDates())
    assert(stage.matchesHaveDurations())
    assert(stage.matchesHaveMVPs())
    assert(stage.matchesHaveManagers())
    assert(stage.matchesHaveNotes())
    assert(stage.matchesHaveOfficials())
    assert(stage.matchesHaveStarts())
    assert(stage.matchesHaveVenues())
    assert(stage.matchesHaveWarmups())
  })

  it('testStageSetters', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'stage-matches-with-everything.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stage = competition.getStage('L')

    assert.equal(stage.getName(), 'League')
    stage.setName('New League')
    assert.equal(stage.getName(), 'New League')
    stage.setName(null)
    assert.equal(stage.getName(), null)

    assert.equal(stage.getNotes(), 'These are notes on the stage')
    stage.setNotes('Now there are notes')
    assert.equal(stage.getNotes(), 'Now there are notes')
    stage.setNotes(null)
    assert.equal(stage.getNotes(), null)

    assert(Array.isArray(stage.getDescription()))
    assert.equal(stage.getDescription().length, 2)
    assert.equal(stage.getDescription()[0], 'This is a description about the stage')
    assert.equal(stage.getDescription()[1], 'This is some more words')
    stage.setDescription(['A new description'])
    assert(Array.isArray(stage.getDescription()))
    assert.equal(stage.getDescription().length, 1)
    assert.equal(stage.getDescription()[0], 'A new description')
    stage.setDescription(null)
    assert(!Array.isArray(stage.getDescription()))
    assert.equal(stage.getDescription(), null)
  })

  it('testStageDeleteGroup', () => {
    const competition = new Competition('test competition')
    const team1 = new CompetitionTeam(competition, 'T1', 'Team 1')
    const team2 = new CompetitionTeam(competition, 'T2', 'Team 2')
    const team3 = new CompetitionTeam(competition, 'T3', 'Team 3')
    competition.addTeam(team1).addTeam(team2).addTeam(team3)
    const stage1 = new Stage(competition, 'S1')
    competition.addStage(stage1)
    const stage2 = new Stage(competition, 'S2')
    competition.addStage(stage2)

    const league1 = new League(stage2, 'G1', MatchType.CONTINUOUS, false)
    stage2.addGroup(league1)
    const match1 = new GroupMatch(league1, 'M1')
    match1.setHomeTeam(new MatchTeam(match1, team1.getID())).setAwayTeam(new MatchTeam(match1, team2.getID())).setOfficials(new MatchOfficials(match1, team3.getID()))
    league1.addMatch(match1)

    const league2 = new League(stage2, 'G2', MatchType.CONTINUOUS, false)
    stage2.addGroup(league2)
    const match2 = new GroupMatch(league2, 'M1')
    match2.setHomeTeam(new MatchTeam(match2, '{S2:G1:M1:winner}=={S2:G1:M1:winner}?{S2:G1:M1:winner}:{S2:G1:M1:winner}')).setAwayTeam(new MatchTeam(match2, team3.getID())).setOfficials(new MatchOfficials(match2, '{S2:G1:M1:loser}'))
    league2.addMatch(match2)

    assert.throws(() => {
      stage2.deleteGroup(league1.getID())
    }, {
      message: 'Cannot delete group with id "G1" as it is referenced in match {S2:G2:M1}'
    })

    stage2.deleteGroup(league2.getID())
    assert.equal(stage2.getGroup('G1').getID(), 'G1')
    assert.equal(stage2.getGroups()[0].getID(), 'G1')
    assert.throws(() => {
      stage2.getGroup('G2')
    }, {
      message: 'Group with ID G2 not found in stage with ID S2'
    })

    stage2.deleteGroup(league2.getID())
    stage2.deleteGroup(league1.getID())
    assert.equal(stage2.getGroups().length, 0)
  })

  it('testStageMatchesWithNoOptionalFields', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'stage-matches-with-nothing.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stage = competition.getStage('L')

    assert.equal(stage.getName(), null)
    assert.equal(stage.getNotes(), null)
    assert.equal(stage.getDescription(), null)
    assert(!stage.matchesHaveCourts())
    assert(!stage.matchesHaveDates())
    assert(!stage.matchesHaveDurations())
    assert(!stage.matchesHaveMVPs())
    assert(!stage.matchesHaveManagers())
    assert(!stage.matchesHaveNotes())
    assert(!stage.matchesHaveOfficials())
    assert(!stage.matchesHaveStarts())
    assert(!stage.matchesHaveVenues())
    assert(!stage.matchesHaveWarmups())
  })

  it('testStageBlockTeamsInTwoGroups', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'stage-teams-in-multiple-groups.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Groups in the same stage cannot contain the same team. Groups {L:L1} and {L:L2} both contain the following team IDs: "TM2", "TM4"'
    })
  })

  it('testStageGetTeamIDsFixed', async () => {
    const incompleteCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete.json'), import.meta.url), { encoding: 'utf8' })
    const incompleteCompetition = await Competition.loadFromCompetitionJSON(incompleteCompetitionJSON)
    const incompletePoolTeamIDs = incompleteCompetition.getStage('P').getTeamIDs()
    const incompleteDivisionTeamIDs = incompleteCompetition.getStage('D').getTeamIDs()

    assert.equal(incompletePoolTeamIDs.length, 8)
    assert.equal(incompleteDivisionTeamIDs.length, 0)

    const completeCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-complete.json'), import.meta.url), { encoding: 'utf8' })
    const completeCompetition = await Competition.loadFromCompetitionJSON(completeCompetitionJSON)
    const completePoolTeamIDs = completeCompetition.getStage('P').getTeamIDs()
    const completeDivisionTeamIDs = completeCompetition.getStage('D').getTeamIDs()

    assert.equal(completePoolTeamIDs.length, 8)
    assert.equal(completeDivisionTeamIDs.length, 0)
  })

  it('testStageGetTeamIDsKnown', async () => {
    const incompleteCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete.json'), import.meta.url), { encoding: 'utf8' })
    const incompleteCompetition = await Competition.loadFromCompetitionJSON(incompleteCompetitionJSON)
    const incompletePoolTeamIDs = incompleteCompetition.getStage('P').getTeamIDs(Competition.VBC_TEAMS_KNOWN)
    const incompleteDivisionTeamIDs = incompleteCompetition.getStage('D').getTeamIDs(Competition.VBC_TEAMS_KNOWN)

    assert.equal(incompletePoolTeamIDs.length, 8)
    assert.equal(incompleteDivisionTeamIDs.length, 0)

    const completeCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-complete.json'), import.meta.url), { encoding: 'utf8' })
    const completeCompetition = await Competition.loadFromCompetitionJSON(completeCompetitionJSON)
    const completePoolTeamIDs = completeCompetition.getStage('P').getTeamIDs(Competition.VBC_TEAMS_KNOWN)
    const completeDivisionTeamIDs = completeCompetition.getStage('D').getTeamIDs(Competition.VBC_TEAMS_KNOWN)

    assert.equal(completePoolTeamIDs.length, 8)
    assert.equal(completeDivisionTeamIDs.length, 18)
  })

  it('testStageGetTeamIDsMaybe', async () => {
    const incompleteCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete.json'), import.meta.url), { encoding: 'utf8' })
    const incompleteCompetition = await Competition.loadFromCompetitionJSON(incompleteCompetitionJSON)
    const incompletePoolTeamIDs = incompleteCompetition.getStage('P').getTeamIDs(Competition.VBC_TEAMS_MAYBE)
    const incompleteDivisionTeamIDs = incompleteCompetition.getStage('D').getTeamIDs(Competition.VBC_TEAMS_MAYBE)

    assert.equal(incompletePoolTeamIDs.length, 0)
    assert.equal(incompleteDivisionTeamIDs.length, 8)

    const completeCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-complete.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(completeCompetitionJSON)
    const completePoolTeamIDs = competition.getStage('P').getTeamIDs(Competition.VBC_TEAMS_MAYBE)
    const completeDivisionTeamIDs = competition.getStage('D').getTeamIDs(Competition.VBC_TEAMS_MAYBE)

    assert.equal(completePoolTeamIDs.length, 0)
    assert.equal(completeDivisionTeamIDs.length, 0)
  })

  it('testStageGetTeamIDsAll', async () => {
    const incompleteCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete.json'), import.meta.url), { encoding: 'utf8' })
    const incompleteCompetition = await Competition.loadFromCompetitionJSON(incompleteCompetitionJSON)
    const incompletePoolTeamIDs = incompleteCompetition.getStage('P').getTeamIDs(Competition.VBC_TEAMS_ALL)
    const incompleteDivisionTeamIDs = incompleteCompetition.getStage('D').getTeamIDs(Competition.VBC_TEAMS_ALL)

    assert.equal(incompletePoolTeamIDs.length, 8)
    assert.equal(incompleteDivisionTeamIDs.length, 18)

    const completeCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-complete.json'), import.meta.url), { encoding: 'utf8' })
    const completeCompetition = await Competition.loadFromCompetitionJSON(completeCompetitionJSON)
    const completePoolTeamIDs = completeCompetition.getStage('P').getTeamIDs(Competition.VBC_TEAMS_ALL)
    const completeDivisionTeamIDs = completeCompetition.getStage('D').getTeamIDs(Competition.VBC_TEAMS_ALL)

    assert.equal(completePoolTeamIDs.length, 8)
    assert.equal(completeDivisionTeamIDs.length, 18)
  })

  it('testStageGetTeamIDsPlaying', async () => {
    const incompleteCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete.json'), import.meta.url), { encoding: 'utf8' })
    const incompleteCompetition = await Competition.loadFromCompetitionJSON(incompleteCompetitionJSON)
    const incompletePoolTeamIDs = incompleteCompetition.getStage('P').getTeamIDs(Competition.VBC_TEAMS_PLAYING)
    const incompleteDivisionTeamIDs = incompleteCompetition.getStage('D').getTeamIDs(Competition.VBC_TEAMS_PLAYING)

    assert.equal(incompletePoolTeamIDs.length, 8)
    assert.equal(incompleteDivisionTeamIDs.length, 16)

    const completeCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-complete.json'), import.meta.url), { encoding: 'utf8' })
    const completeCompetition = await Competition.loadFromCompetitionJSON(completeCompetitionJSON)
    const completePoolTeamIDs = completeCompetition.getStage('P').getTeamIDs(Competition.VBC_TEAMS_PLAYING)
    const completeDivisionTeamIDs = completeCompetition.getStage('D').getTeamIDs(Competition.VBC_TEAMS_PLAYING)

    assert.equal(completePoolTeamIDs.length, 8)
    assert.equal(completeDivisionTeamIDs.length, 16)
  })

  it('testStageGetTeamIDsOfficiating', async () => {
    const incompleteCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete.json'), import.meta.url), { encoding: 'utf8' })
    const incompleteCompetition = await Competition.loadFromCompetitionJSON(incompleteCompetitionJSON)
    const incompletePoolTeamIDs = incompleteCompetition.getStage('P').getTeamIDs(Competition.VBC_TEAMS_OFFICIATING)
    const incompleteDivisionTeamIDs = incompleteCompetition.getStage('D').getTeamIDs(Competition.VBC_TEAMS_OFFICIATING)

    assert.equal(incompletePoolTeamIDs.length, 8)
    assert.equal(incompleteDivisionTeamIDs.length, 8)

    const completeCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-complete.json'), import.meta.url), { encoding: 'utf8' })
    const completeCompetition = await Competition.loadFromCompetitionJSON(completeCompetitionJSON)
    const completePoolTeamIDs = completeCompetition.getStage('P').getTeamIDs(Competition.VBC_TEAMS_OFFICIATING)
    const completeDivisionTeamIDs = completeCompetition.getStage('D').getTeamIDs(Competition.VBC_TEAMS_OFFICIATING)

    assert.equal(completePoolTeamIDs.length, 8)
    assert.equal(completeDivisionTeamIDs.length, 8)
  })

  it('testStageTeamHasMatches', async () => {
    const incompleteCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete.json'), import.meta.url), { encoding: 'utf8' })
    const incompleteCompetition = await Competition.loadFromCompetitionJSON(incompleteCompetitionJSON)
    const completeCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-complete.json'), import.meta.url), { encoding: 'utf8' })
    const completeCompetition = await Competition.loadFromCompetitionJSON(completeCompetitionJSON)

    assert(incompleteCompetition.getStage('P').teamHasMatches('TM1'))
    assert(completeCompetition.getStage('P').teamHasMatches('TM1'))

    assert(!incompleteCompetition.getStage('D').teamHasMatches('TM1'))
    assert(completeCompetition.getStage('D').teamHasMatches('TM1'))
  })

  it('testStageTeamHasOfficiating', async () => {
    const incompleteCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete.json'), import.meta.url), { encoding: 'utf8' })
    const incompleteCompetition = await Competition.loadFromCompetitionJSON(incompleteCompetitionJSON)
    const completeCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-complete.json'), import.meta.url), { encoding: 'utf8' })
    const completeCompetition = await Competition.loadFromCompetitionJSON(completeCompetitionJSON)

    assert(incompleteCompetition.getStage('P').teamHasOfficiating('TM1'))
    assert(completeCompetition.getStage('P').teamHasOfficiating('TM1'))

    assert(!incompleteCompetition.getStage('D').teamHasOfficiating('TM1'))
    assert(completeCompetition.getStage('D').teamHasOfficiating('TM1'))
  })

  it('testStageTeamMayHaveMatches', async () => {
    const incompleteCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete.json'), import.meta.url), { encoding: 'utf8' })
    const incompleteCompetition = await Competition.loadFromCompetitionJSON(incompleteCompetitionJSON)
    const completeCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-complete.json'), import.meta.url), { encoding: 'utf8' })
    const completeCompetition = await Competition.loadFromCompetitionJSON(completeCompetitionJSON)
    const reffingRefCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete-reffing-reference.json'), import.meta.url), { encoding: 'utf8' })
    const reffingRefCompetition = await Competition.loadFromCompetitionJSON(reffingRefCompetitionJSON)

    assert(!incompleteCompetition.getStage('P').teamMayHaveMatches('TM1'))
    assert(!completeCompetition.getStage('P').teamMayHaveMatches('TM1'))
    assert(!reffingRefCompetition.getStage('P').teamMayHaveMatches('TM1'))

    assert(incompleteCompetition.getStage('D').teamMayHaveMatches('TM1'))
    assert(!completeCompetition.getStage('D').teamMayHaveMatches('TM1'))
    assert(reffingRefCompetition.getStage('D').teamMayHaveMatches('TM1'))
  })

  it('testStageGetMatchesAllInStage', async () => {
    const incompleteCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete.json'), import.meta.url), { encoding: 'utf8' })
    const incompleteCompetition = await Competition.loadFromCompetitionJSON(incompleteCompetitionJSON)

    assert.equal(incompleteCompetition.getStage('P').getMatches().length, 12)
    // Check cached answer
    assert.equal(incompleteCompetition.getStage('P').getMatches().length, 12)
    assert.equal(incompleteCompetition.getStage('D').getMatches().length, 8)
  })

  it('testStageGetMatchesAllInGroup', async () => {
    const incompleteCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete.json'), import.meta.url), { encoding: 'utf8' })
    const incompleteCompetition = await Competition.loadFromCompetitionJSON(incompleteCompetitionJSON)
    const completeCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-complete.json'), import.meta.url), { encoding: 'utf8' })
    const completeCompetition = await Competition.loadFromCompetitionJSON(completeCompetitionJSON)

    assert.equal(incompleteCompetition.getStage('P').getMatches('TM1', Competition.VBC_MATCH_ALL_IN_GROUP).length, 6)
    assert.equal(incompleteCompetition.getStage('D').getMatches('TM1', Competition.VBC_MATCH_ALL_IN_GROUP).length, 0)

    assert.equal(completeCompetition.getStage('P').getMatches('TM1', Competition.VBC_MATCH_ALL_IN_GROUP).length, 6)
    assert.equal(completeCompetition.getStage('D').getMatches('TM1', Competition.VBC_MATCH_ALL_IN_GROUP).length, 4)
  })

  it('testStageGetMatchesPlaying', async () => {
    const incompleteCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete.json'), import.meta.url), { encoding: 'utf8' })
    const incompleteCompetition = await Competition.loadFromCompetitionJSON(incompleteCompetitionJSON)
    const completeCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-complete.json'), import.meta.url), { encoding: 'utf8' })
    const completeCompetition = await Competition.loadFromCompetitionJSON(completeCompetitionJSON)

    assert.equal(incompleteCompetition.getStage('P').getMatches('TM1', Competition.VBC_MATCH_PLAYING).length, 3)
    assert.equal(incompleteCompetition.getStage('D').getMatches('TM1', Competition.VBC_MATCH_PLAYING).length, 0)

    assert.equal(completeCompetition.getStage('P').getMatches('TM1', Competition.VBC_MATCH_PLAYING).length, 3)
    assert.equal(completeCompetition.getStage('D').getMatches('TM1', Competition.VBC_MATCH_PLAYING).length, 2)
  })

  it('testStageGetMatchesOfficiating', async () => {
    const incompleteCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete.json'), import.meta.url), { encoding: 'utf8' })
    const incompleteCompetition = await Competition.loadFromCompetitionJSON(incompleteCompetitionJSON)
    const completeCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-complete.json'), import.meta.url), { encoding: 'utf8' })
    const completeCompetition = await Competition.loadFromCompetitionJSON(completeCompetitionJSON)
    const crossGroupCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-cross-group-reffing.json'), import.meta.url), { encoding: 'utf8' })
    const crossGroupCompetition = await Competition.loadFromCompetitionJSON(crossGroupCompetitionJSON)

    assert.equal(incompleteCompetition.getStage('P').getMatches('TM1', Competition.VBC_MATCH_OFFICIATING).length, 1)
    assert.equal(incompleteCompetition.getStage('D').getMatches('TM1', Competition.VBC_MATCH_OFFICIATING).length, 0)

    assert.equal(completeCompetition.getStage('P').getMatches('TM1', Competition.VBC_MATCH_OFFICIATING).length, 1)
    assert.equal(completeCompetition.getStage('D').getMatches('TM1', Competition.VBC_MATCH_OFFICIATING).length, 1)

    assert.equal(crossGroupCompetition.getStage('P').getMatches('TM1', Competition.VBC_MATCH_OFFICIATING).length, 2)
    assert.equal(crossGroupCompetition.getStage('D').getMatches('TM1', Competition.VBC_MATCH_OFFICIATING).length, 0)
  })

  it('testStageGetMatchesPlayingAndOfficiating', async () => {
    const incompleteCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-incomplete.json'), import.meta.url), { encoding: 'utf8' })
    const incompleteCompetition = await Competition.loadFromCompetitionJSON(incompleteCompetitionJSON)
    const completeCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-complete.json'), import.meta.url), { encoding: 'utf8' })
    const completeCompetition = await Competition.loadFromCompetitionJSON(completeCompetitionJSON)
    const crossGroupCompetitionJSON = await readFile(new URL(path.join('stage', 'pools-knockout-cross-group-reffing.json'), import.meta.url), { encoding: 'utf8' })
    const crossGroupCompetition = await Competition.loadFromCompetitionJSON(crossGroupCompetitionJSON)

    assert.equal(incompleteCompetition.getStage('P').getMatches('TM1', Competition.VBC_MATCH_PLAYING | Competition.VBC_MATCH_OFFICIATING).length, 4)
    assert.equal(incompleteCompetition.getStage('D').getMatches('TM1', Competition.VBC_MATCH_PLAYING | Competition.VBC_MATCH_OFFICIATING).length, 0)

    assert.equal(completeCompetition.getStage('P').getMatches('TM1', Competition.VBC_MATCH_PLAYING | Competition.VBC_MATCH_OFFICIATING).length, 4)
    assert.equal(completeCompetition.getStage('D').getMatches('TM1', Competition.VBC_MATCH_PLAYING | Competition.VBC_MATCH_OFFICIATING).length, 3)

    assert.equal(crossGroupCompetition.getStage('P').getMatches('TM1', Competition.VBC_MATCH_PLAYING | Competition.VBC_MATCH_OFFICIATING).length, 5)
    assert.equal(crossGroupCompetition.getStage('D').getMatches('TM1', Competition.VBC_MATCH_PLAYING | Competition.VBC_MATCH_OFFICIATING).length, 0)
  })

  it('testStageGetMatchDates', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stageA = competition.getStage('HVAGP')
    const stageB = competition.getStage('HVAGP2')
    const datesA = stageA.getMatchDates()
    const datesB = stageB.getMatchDates()

    assert.equal(datesA.length, 7)
    assert.deepEqual(datesA, ['2023-10-22', '2023-11-26', '2024-01-21', '2024-02-11', '2024-02-25', '2024-03-24', '2024-04-21'])
    assert.equal(datesB.length, 3)
    assert.deepEqual(datesB, ['2023-11-26', '2024-02-25', '2024-04-21'])
  })

  it('testStageGetMatchDatesForTeam', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stageA = competition.getStage('HVAGP')
    const stageB = competition.getStage('HVAGP2')
    const datesTMKA = stageA.getMatchDates('TMK')
    const datesTMKB = stageB.getMatchDates('TMK')

    assert.equal(datesTMKA.length, 2)
    assert.deepEqual(datesTMKA, ['2023-11-26', '2024-02-25'])
    assert.equal(datesTMKB.length, 2)
    assert.deepEqual(datesTMKB, ['2023-11-26', '2024-02-25'])
  })

  it('testStageGetMatchDatesForTeamPlaying', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stageA = competition.getStage('HVAGP')
    const stageB = competition.getStage('HVAGP2')
    const datesTMKA = stageA.getMatchDates('TMK', Competition.VBC_MATCH_PLAYING)
    const datesTMKB = stageB.getMatchDates('TMK', Competition.VBC_MATCH_PLAYING)

    assert.equal(datesTMKA.length, 2)
    assert.deepEqual(datesTMKA, ['2023-11-26', '2024-02-25'])
    assert.equal(datesTMKB.length, 2)
    assert.deepEqual(datesTMKB, ['2023-11-26', '2024-02-25'])
  })

  it('testStageGetMatchDatesForTeamOfficiating', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stageA = competition.getStage('HVAGP')
    const stageB = competition.getStage('HVAGP2')
    const datesTMMA = stageA.getMatchDates('TMM', Competition.VBC_MATCH_OFFICIATING)
    const datesTMMB = stageB.getMatchDates('TMM', Competition.VBC_MATCH_OFFICIATING)

    assert.equal(datesTMMA.length, 3)
    assert.deepEqual(datesTMMA, ['2023-11-26', '2024-02-25', '2024-04-21'])
    assert.equal(datesTMMB.length, 2)
    assert.deepEqual(datesTMMB, ['2023-11-26', '2024-02-25'])
  })

  it('testStageGetMatchesOnDate', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stageA = competition.getStage('HVAGP')
    const matchesA = stageA.getMatchesOnDate('2023-10-22')
    const matchesB = stageA.getMatchesOnDate('2023-11-26')

    assert.equal(matchesA.length, 13)
    assert.equal(matchesA[5].getID(), 'GP1AM5')
    assert.equal(matchesB.length, 12)
    assert.equal(matchesB[5].getID(), 'GP1BM6')
  })

  it('testStageGetMatchesOnDateForTeam', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stageA = competition.getStage('HVAGP')

    const matchesTMC = stageA.getMatchesOnDate('2024-01-21', 'TMC')
    assert.equal(matchesTMC.length, 12)
    assert.equal(matchesTMC[8].getID(), 'GP2AM9')
  })

  it('testStageGetMatchesOnDateForTeamPlaying', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stageA = competition.getStage('HVAGP')
    const matchesTMC = stageA.getMatchesOnDate('2023-10-22', 'TMC', Competition.VBC_MATCH_PLAYING | Competition.VBC_MATCH_OFFICIATING)
    assert.equal(matchesTMC.length, 1)
    assert(matchesTMC[0] instanceof GroupBreak)

    const stageB = competition.getStage('HVAGP2')
    const matchesTMK = stageB.getMatchesOnDate('2023-11-26', 'TMK', Competition.VBC_MATCH_PLAYING)
    assert.equal(matchesTMK.length, 3)
    assert.equal(matchesTMK[1].getID(), 'GP1CM7')
  })

  it('testStageGetMatchesOnDateForTeamOfficiating', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'group-with-dates.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stageB = competition.getStage('HVAGP2')
    const matchesTMM = stageB.getMatchesOnDate('2024-02-25', 'TMM', Competition.VBC_MATCH_OFFICIATING)
    assert.equal(matchesTMM.length, 1)
    assert.equal(matchesTMM[0].getID(), 'GP2CM9')
  })

  it('testStageConstructor', async () => {
    const competition = new Competition('test')

    assert.throws(() => {
      new Stage(competition, '')
    }, {
      message: 'Invalid stage ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new Stage(competition, '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567891')
    }, {
      message: 'Invalid stage ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new Stage(competition, '"id1"')
    }, {
      message: 'Invalid stage ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Stage(competition, 'id:1')
    }, {
      message: 'Invalid stage ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Stage(competition, 'id{1')
    }, {
      message: 'Invalid stage ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Stage(competition, 'id1}')
    }, {
      message: 'Invalid stage ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Stage(competition, 'id1?')
    }, {
      message: 'Invalid stage ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Stage(competition, 'id=1')
    }, {
      message: 'Invalid stage ID: must contain only ASCII printable characters excluding " : { } ? ='
    })
  })

  it('testStageAddGroup', async () => {
    const competition = new Competition('test')
    const stage1 = new Stage(competition, 'S1')
    const stage2 = new Stage(competition, 'S2')
    stage1.addGroup(new Crossover(stage1, 'G1', MatchType.CONTINUOUS))

    assert.throws(() => {
      stage1.addGroup(new Crossover(stage2, 'G2', MatchType.CONTINUOUS))
    }, {
      message: 'Group was initialised with a different Stage'
    })
  })

  it('testStageGetMatchesNoTimeNoDate', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'stage-matches-with-nothing.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stage = competition.getStage('L')
    const matches = stage.getMatches()

    assert.deepEqual(matches.filter(match => match instanceof GroupMatch).map(match => match.getID()), ['LG1', 'LG2', 'LG3', 'LG4', 'LG5', 'LG6', 'LG1', 'LG2', 'LG3', 'LG4', 'LG5', 'LG6'])
  })

  it('testStageGetMatchesTimeDate', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'stage-matches-with-everything.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stage = competition.getStage('L')
    const matches = stage.getMatches()

    assert.deepEqual(matches.filter(match => match instanceof GroupMatch).map(match => match.getID()), ['LG1', 'LG2', 'LG3', 'LG4', 'LG5', 'LG6', 'LG1', 'LG2', 'LG3', 'LG4', 'LG5', 'LG6'])
  })

  it('testStageGetMatchesForTeamNoTimeNoDate', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'stage-matches-with-nothing.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stage = competition.getStage('L')
    const matches = stage.getMatches('TM1', Competition.VBC_MATCH_PLAYING)

    assert.deepEqual(matches.filter(match => match instanceof GroupMatch).map(match => match.getID()), ['LG2', 'LG4', 'LG6'])
  })

  it('testStageGetMatchesForTeamTimeDate', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'stage-matches-with-everything.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stage = competition.getStage('L')
    const matches = stage.getMatches('TM5', Competition.VBC_MATCH_PLAYING)

    assert.deepEqual(matches.filter(match => match instanceof GroupMatch).map(match => match.getID()), ['LG2', 'LG4', 'LG6'])
  })

  it('testStageGetMatchesForTeamOnDate', async () => {
    const competitionJSON = await readFile(new URL(path.join('stage', 'stage-matches-with-everything.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const stage = competition.getStage('L')
    const matches = stage.getMatchesOnDate('2023-11-05', 'TM5', Competition.VBC_MATCH_PLAYING)

    assert.deepEqual(matches.filter(match => match instanceof GroupMatch).map(match => match.getID()), ['LG2', 'LG4', 'LG6'])
  })
})
