import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Competition, CompetitionTeam, Crossover, GroupMatch, MatchTeam, MatchType, SetConfig, Stage } from '../../src/index.js'

describe('groupMatch', () => {
  it('testGroupMatchContinuousHomeWin', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'continuous-home-win.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')

    assert(match.isComplete(), 'Match should be found as completed')
    assert(!match.isDraw())
    assert.equal(match.getWinnerTeamID(), 'TM1')
    assert.equal(match.getLoserTeamID(), 'TM2')
    assert.equal(match.getGroup().getID(), 'SG')
    assert.equal(match.getHomeTeam().getID(), 'TM1')
    assert.equal(match.getAwayTeam().getID(), 'TM2')

    assert.equal(match.getID(), 'SG1')
    assert.equal(match.getCourt(), '1')
    assert.equal(match.getVenue(), 'Home Stadium')
    assert.equal(match.getDate(), '2020-06-06')
    assert.equal(match.getWarmup(), '09:10')
    assert.equal(match.getStart(), '09:20')
    assert.equal(match.getDuration(), '0:20')
    assert(match.getComplete())
    assert.equal(match.getOfficials().getFirstRef(), 'Dave')
    assert.equal(match.getMVP(), 'A Bobs')
    assert.equal(match.getManager().getManagerName(), 'Dave')
    assert.equal(match.getNotes(), 'Local derby')
  })

  it('testGroupMatchContinuousAwayWin', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'continuous-away-win.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')

    assert(match.isComplete(), 'Match should be found as completed')
    assert(!match.isDraw())
    assert.equal(match.getWinnerTeamID(), 'TM2')
    assert.equal(match.getLoserTeamID(), 'TM1')
  })

  it('testGroupMatchContinuousDrawThrowsWinner', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'continuous-draw.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')

    assert(match.isComplete())
    assert(match.isDraw())

    assert.throws(() => {
      match.getWinnerTeamID()
    }, {
      message: 'Match drawn, there is no winner'
    })
  })

  it('testGroupMatchContinuousDrawThrowsLoser', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'continuous-draw.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')

    assert(match.isComplete())
    assert(match.isDraw())

    assert.throws(() => {
      match.getLoserTeamID()
    }, {
      message: 'Match drawn, there is no loser'
    })
  })

  it('testGroupMatchContinuousDrawDisallowed', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'continuous-draw-disallowed.json'), import.meta.url), { encoding: 'utf8' })

    await assert.rejects(async () => {
      const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Invalid match information (in match {S:SG:SG1}): scores show a draw but draws are not allowed'
    })
  })

  it('testGroupMatchContinuousThrowsGettingHomeSets', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'continuous-away-win.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')

    assert.throws(() => {
      match.getHomeTeamSets()
    }, {
      message: 'Match has no sets because the match type is continuous'
    })
  })

  it('testGroupMatchContinuousThrowsGettingAwaySets', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'continuous-away-win.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')

    assert.throws(() => {
      match.getAwayTeamSets()
    }, {
      message: 'Match has no sets because the match type is continuous'
    })
  })

  it('testGroupMatchSetsLengthMismatch', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'sets-scores-length-mismatch.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Invalid match information for match SG1: team scores have different length'
    })
    // competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')
  })

  it('testGroupMatchSetsHomeWin', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'sets-home-win.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')

    assert(match.isComplete())
    assert.equal(match.getWinnerTeamID(), 'TM1')
    assert.equal(match.getLoserTeamID(), 'TM2')
  })

  it('testGroupMatchSetsAwayWin', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'sets-away-win.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')

    assert(match.isComplete())
    assert.equal(match.getWinnerTeamID(), 'TM2')
    assert.equal(match.getLoserTeamID(), 'TM1')
  })

  it('testGroupMatchSetsGetSets', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'sets-home-win.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')

    assert(match.isComplete())
    assert.equal(match.getHomeTeamSets(), 2)
    assert.equal(match.getAwayTeamSets(), 0)
  })

  it('testGroupMatchSetsIncompleteBestOfGetWinnerThrows', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'sets-incomplete-maxsets.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')

    assert(!match.isComplete())

    assert.throws(() => {
      match.getWinnerTeamID()
    }, {
      message: 'Match incomplete, there is no winner'
    })
  })

  it('testGroupMatchSetsIncompleteBestOfGetLoserThrows', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'sets-incomplete-maxsets.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')

    assert(!match.isComplete())

    assert.throws(() => {
      match.getLoserTeamID()
    }, {
      message: 'Match incomplete, there is no loser'
    })
  })

  it('testGroupMatchSetsIncompleteMinPointsGetWinnerThrows', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'sets-incomplete-maxsets.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')

    assert(!match.isComplete())

    assert.throws(() => {
      match.getWinnerTeamID()
    }, {
      message: 'Match incomplete, there is no winner'
    })
  })

  it('testGroupMatchSetsIncompleteMinPointsGetLoserThrows', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'sets-incomplete-maxsets.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')

    assert(!match.isComplete())

    assert.throws(() => {
      match.getLoserTeamID()
    }, {
      message: 'Match incomplete, there is no loser'
    })
  })

  it('testGroupMatchSetsIncompleteFirstSetMatchDeclaredCompleteHasResult', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'sets-incomplete-first-set.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')

    assert(match.isComplete())
  })

  it('testGroupMatchSetsInsufficientPoints', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'sets-insufficient-points.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')
    assert(!match.isComplete())
  })

  it('testGroupMatchSetsDawnGame', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'sets-draw.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')
    assert(match.isDraw())
  })

  it('testGroupMatchSetsDrawsDisallowed', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'sets-draw-disallowed.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Invalid match information (in match {S:SG:SG1}): scores show a draw but draws are not allowed'
    })
  })

  it('testGroupMatchSetsTooManySets', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'sets-too-many-sets.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Invalid match information (in match {S:SG:SG1}): team scores have more sets than the maximum allowed length'
    })
  })

  // it('testGroupMatchSetsMatchDifferentScoreLengths', async () => {
  //     copy(
  //         realpath(join(DIRECTORY_SEPARATOR, array(__DIR__, 'competitions', 'competition-sets-duration.json'))),
  //         join(DIRECTORY_SEPARATOR, array(__DIR__, 'competitions', 'update', 'competition-sets-duration.json'))
  //     )

  //     $this.expectExceptionMessage('Invalid set scores: score arrays are different lengths')
  //     const dummyCompetition = new Competition('dummy for score update')
  //     const dummyStage = new Stage(dummyCompetition, 'S')
  //     const dummyGroup = new Crossover(dummyStage, 'G', MatchType.SETS)
  //     const config = new SetConfig(dummyGroup)
  //     config.loadFromData(json_decode('{"maxSets": 3, "setsToWin": 1, "clearPoints": 2, "minPoints": 1, "pointsToWin": 25, "lastSetPointsToWin": 15, "maxPoints": 50, "lastSetMaxPoints": 30}'))
  //     GroupMatch::assertSetScoresValid(
  //         [25],
  //         [19, 19],
  //         config
  //     )
  // })

  it('testGroupMatchSetsMatchTooManyScores', async () => {
    const dummyCompetition = new Competition('dummy for score update')
    const dummyStage = new Stage(dummyCompetition, 'S')
    const dummyGroup = new Crossover(dummyStage, 'G', MatchType.SETS)
    const config = new SetConfig(dummyGroup)
    config.loadFromData(JSON.parse('{"maxSets": 3, "setsToWin": 1, "clearPoints": 2, "minPoints": 1, "pointsToWin": 25, "lastSetPointsToWin": 15, "maxPoints": 50, "lastSetMaxPoints": 30}'))

    assert.throws(() => {
      GroupMatch.assertSetScoresValid(
        [25, 25, 25, 25, 25, 25],
        [19, 19, 19, 19, 19, 19],
        config
      )
    }, {
      message: 'Invalid set scores: score arrays are longer than the maximum number of sets allowed'
    })
  })

  it('testGroupMatchSetsMatchHomeTeamTooManyInDecider', async () => {
    const dummyCompetition = new Competition('dummy for score update')
    const dummyStage = new Stage(dummyCompetition, 'S')
    const dummyGroup = new Crossover(dummyStage, 'G', MatchType.SETS)
    const config = new SetConfig(dummyGroup)
    config.loadFromData(JSON.parse('{"maxSets": 3, "setsToWin": 1, "clearPoints": 2, "minPoints": 1, "pointsToWin": 25, "lastSetPointsToWin": 15, "maxPoints": 50, "lastSetMaxPoints": 30}'))

    assert.throws(() => {
      GroupMatch.assertSetScoresValid(
        [25, 19, 25],
        [19, 25, 19],
        config
      )
    }, {
      message: 'Invalid set scores: value for set score at index 2 shows home team scoring more points than necessary to win the set'
    })
  })

  it('testGroupMatchSetsMatchAwayTeamTooManyInDecider', async () => {
    const dummyCompetition = new Competition('dummy for score update')
    const dummyStage = new Stage(dummyCompetition, 'S')
    const dummyGroup = new Crossover(dummyStage, 'G', MatchType.SETS)
    const config = new SetConfig(dummyGroup)
    config.loadFromData(JSON.parse('{"maxSets": 3, "setsToWin": 1, "clearPoints": 2, "minPoints": 1, "pointsToWin": 25, "lastSetPointsToWin": 15, "maxPoints": 50, "lastSetMaxPoints": 30}'))

    assert.throws(() => {
      GroupMatch.assertSetScoresValid(
        [25, 19, 19],
        [19, 25, 25],
        config
      )
    }, {
      message: 'Invalid set scores: value for set score at index 2 shows away team scoring more points than necessary to win the set'
    })
  })

  it('testGroupMatchGetScoreReadOnly', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'continuous-home-win.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')
    const homeScore = match.getHomeTeam().getScores()
    homeScore[0] = 19
    assert.equal(match.getHomeTeam().getScores()[0], 21)
    assert.equal(homeScore[0], 19)
  })

  it('testGroupMatchGetCompleteReadOnly', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'continuous-home-win.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')
    assert(match.getComplete())
    assert(match.isComplete())
    match.setComplete(false)
    assert(!match.getComplete())
    assert(!match.isComplete())
  })

  it('testGroupMatchHomeTeamCannotOfficiateSelf', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'home-team-officiates-self.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Refereeing team (in match {S:SG:SG1}) cannot be the same as one of the playing teams'
    })
  })

  it('testGroupMatchAwayTeamCannotOfficiateSelf', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'away-team-officiates-self.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Refereeing team (in match {S:SG:SG1}) cannot be the same as one of the playing teams'
    })
  })

  it('testGroupMatchNoScores', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'continuous-no-result.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('S').getGroupByID('SG').getMatchByID('SG1')
    assert.equal(match.getHomeTeam().getScores().length, 0)
    assert.throws(() => {
      match.getWinnerTeamID()
    }, {
      message: 'Match incomplete, there is no winner'
    })
  })

  it('testGroupMatchSaveScoresContinuous', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'save-scores.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStageByID('L').getGroupByID('RL')
    const match = group.getMatches()[0]
    const homeTeam = match.getHomeTeam()
    const awayTeam = match.getAwayTeam()

    assert(match instanceof GroupMatch)
    match.setScores([23], awayTeam.getScores(), false)
    assert(!match.isComplete())
    match.setScores(homeTeam.getScores(), [19], true)
    assert(match.isComplete())
    assert.equal(homeTeam.getScores()[0], 23)
    assert.equal(awayTeam.getScores()[0], 19)
  })

  it('testGroupMatchSaveScoresContinuousCatchBannedDraws', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'save-scores.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('L').getGroupByID('RL').getMatches()[0]

    assert.throws(() => {
      match.setScores([22], [22], true)
    }, {
      message: 'Invalid score: draws not allowed in this group'
    })
  })

  it('testGroupMatchSaveScoresContinuousWantsCompleteness', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'save-scores.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStageByID('L').getGroupByID('RL')
    const match = group.getMatches()[0]

    assert.throws(() => {
      match.setScores([23], [22])
    }, {
      message: 'Invalid score: match type is continuous, but the match completeness is not set'
    })
  })

  it('testGroupMatchSaveScoresSets', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'save-scores.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('L').getGroupByID('RS').getMatches()[0]

    match.setScores([25, 25, 25], [17, 19, 12], false)
    assert(!match.isComplete())
    match.setScores(match.getHomeTeamScores(), match.getAwayTeamScores(), true)
    assert(match.isComplete())
    assert.equal(match.getHomeTeamScores()[0], 25)
    assert.equal(match.getAwayTeamScores()[0], 17)
  })

  it('testGroupMatchSaveScoresSetsCatchBannedDraws', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'save-scores.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const match = competition.getStageByID('L').getGroupByID('RS').getMatches()[0]

    assert.throws(() => {
      match.setScores([25, 25, 25], [25, 25, 25], false)
    }, {
      message: 'Invalid set scores: data contains non-zero scores for a set after an incomplete set'
    })
  })

  it('testGroupMatchMatchSaveScoresSetsWantsCompleteness', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'save-scores.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const group = competition.getStageByID('L').getGroupByID('RS')
    const match = group.getMatches()[0]

    assert.throws(() => {
      match.setScores([25, 25, 25], [20, 22, 19])
    }, {
      message: 'Invalid results: match type is sets and match has a duration, but the match completeness is not set'
    })
  })

  it('testGroupMatchSavesFriendlyInfo', async () => {
    let competition = new Competition('test competition')
    const stage = new Stage(competition, 'S')
    competition.addStage(stage)
    const group = new Crossover(stage, 'C', MatchType.SETS)
    stage.addGroup(group)
    const config = new SetConfig(group)
    group.setSetConfig(config)

    const team1 = new CompetitionTeam(competition, 'TM1', 'Team 1')
    competition.addTeam(team1)
    const team2 = new CompetitionTeam(competition, 'TM2', 'Team 2')
    competition.addTeam(team2)

    const match = new GroupMatch(group, 'M1')
    const homeTeam = new MatchTeam(match, 'TM1')
    const awayTeam = new MatchTeam(match, 'TM2')
    match.setHomeTeam(homeTeam)
    match.setAwayTeam(awayTeam)
    match.setFriendly(true)
    group.addMatch(match)

    competition = await Competition.loadFromCompetitionJSON(JSON.stringify(competition.serialize()))
    assert(competition.getStageByID('S').getGroupByID('C').getMatchByID('M1').isFriendly())
  })

  it('testGroupMatchContinuousScoresLengthMismatch', () => {
    assert.throws(() => {
      GroupMatch.assertContinuousScoresValid([10, 10], [20])
    }, {
      message: 'Invalid results: match type is continuous, but score length is greater than one'
    })
  })

  it('testGroupMatchContinuousScoresDrawAndConfigObject', () => {
    GroupMatch.assertContinuousScoresValid([10], [20], { drawsAllowed: true })

    assert.throws(() => {
      GroupMatch.assertContinuousScoresValid([10], [10], { drawsAllowed: false })
    }, {
      message: 'Invalid score: draws not allowed in this group'
    })
  })

  it('testGroupMatchSetsScoresLengthMismatch', () => {
    const competition = new Competition('test competition')
    const stage = new Stage(competition, 'S')
    competition.addStage(stage)
    const group = new Crossover(stage, 'C', MatchType.CONTINUOUS)
    const config = new SetConfig(group)

    assert.throws(() => {
      GroupMatch.assertSetScoresValid([10, 10], [20], config)
    }, {
      message: 'Invalid set scores: score arrays are different lengths'
    })
  })

  it('testGroupMatchSetsScoresAwayHasExtraInfo', () => {
    const competition = new Competition('test competition')
    const stage = new Stage(competition, 'S')
    competition.addStage(stage)
    const group = new Crossover(stage, 'C', MatchType.CONTINUOUS)
    const config = new SetConfig(group)

    assert.throws(() => {
      GroupMatch.assertSetScoresValid([10, 10, 0], [25, 15, 1], config)
    }, {
      message: 'Invalid set scores: data contains non-zero scores for a set after an incomplete set'
    })
  })

  it('testGroupMatchSetsScoresDeciderMaxedOut', () => {
    const competition = new Competition('test competition')
    const stage = new Stage(competition, 'S')
    competition.addStage(stage)
    const group = new Crossover(stage, 'C', MatchType.SETS)
    stage.addGroup(group)
    const config = new SetConfig(group)
    group.setSetConfig(config)

    const team1 = new CompetitionTeam(competition, 'TM1', 'Team 1')
    competition.addTeam(team1)
    const team2 = new CompetitionTeam(competition, 'TM2', 'Team 2')
    competition.addTeam(team2)

    const match = new GroupMatch(group, 'M1')
    const homeTeam = new MatchTeam(match, 'TM1')
    const awayTeam = new MatchTeam(match, 'TM2')
    match.setHomeTeam(homeTeam)
    match.setAwayTeam(awayTeam)
    group.addMatch(match)

    config.setLastSetMaxPoints(20)
    match.setScores([10, 10, 25, 25, 19], [25, 25, 10, 10, 20])
  })
})
