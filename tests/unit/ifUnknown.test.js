import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'


import { Competition, CompetitionTeam, IfUnknown, IfUnknownBreak, IfUnknownMatch, MatchType, MatchOfficials, Player, Stage } from '../../src/index.js'

describe('ifUnkonwn', () => {
  it('testIfUnknownLoad', async () => {
    const competitionJSON = await readFile(new URL(path.join('ifunknown', 'incomplete-group-multi-stage.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    const ifUnknown = competition.getStage('F').getIfUnknown()

    assert.equal(ifUnknown.getMatchType(), MatchType.CONTINUOUS)
    assert.equal(ifUnknown.getID(), 'unknown')
    assert.equal(ifUnknown.getCompetition().getName(), 'Test Knockout')
    assert.deepEqual(ifUnknown.getTeamIDs(), [])
    assert(ifUnknown.matchesHaveCourts())
    assert(ifUnknown.matchesHaveDates())
    assert(ifUnknown.matchesHaveDurations())
    assert(ifUnknown.matchesHaveManagers())
    assert(ifUnknown.matchesHaveMVPs())
    assert(ifUnknown.matchesHaveNotes())
    assert(ifUnknown.matchesHaveOfficials())
    assert(ifUnknown.matchesHaveStarts())
    assert(ifUnknown.matchesHaveVenues())
    assert(ifUnknown.matchesHaveWarmups())

    const secondMatch = ifUnknown.getMatches()[1]
    assert.equal(secondMatch.getID(), 'SF2')
    assert(secondMatch.getGroup() instanceof IfUnknown)
    assert(!secondMatch.isComplete())
    assert(!secondMatch.isDraw())
    assert.equal(secondMatch.getWinnerTeamID(), CompetitionTeam.UNKNOWN_TEAM_ID)
    assert.equal(secondMatch.getLoserTeamID(), CompetitionTeam.UNKNOWN_TEAM_ID)
    assert.equal(secondMatch.getHomeTeamSets(), 0)
    assert.equal(secondMatch.getAwayTeamSets(), 0)
    assert.equal(secondMatch.getHomeTeam().getID(), '1st Group B')
    assert.equal(secondMatch.getAwayTeam().getID(), '2nd Group A')
    assert.equal(secondMatch.getCourt(), '1')
    assert.equal(secondMatch.getVenue(), 'City Stadium')
    assert.equal(secondMatch.getDate(), '2020-06-06')
    assert.equal(secondMatch.getWarmup(), '10:00')
    assert.equal(secondMatch.getDuration(), '0:50')
    assert.equal(secondMatch.getStart(), '10:10')
    assert.equal(secondMatch.getNotes(), null)
    assert.equal(secondMatch.getOfficials().getTeamID(), 'SF1 loser')

    assert.equal(ifUnknown.getMatch('FIN').getManager().getManagerName(), 'A Bobs')
    assert.equal(ifUnknown.getMatch('FIN').getMVP().getName(), 'J Doe')

    const groupBreak = ifUnknown.getMatches()[2]
    if (groupBreak instanceof IfUnknownBreak) {
      assert.equal(groupBreak.getStart(), '11:30')
      assert.equal(groupBreak.getDate(), '2020-06-06')
      assert.equal(groupBreak.getDuration(), '1:20')
      assert.equal(groupBreak.getName(), 'Lunch break')
      assert.equal(groupBreak.getIfUnknown(), ifUnknown)
    } else {
      assert.fail('Match 3 in the IfUnknown block should have been represented as a IfUnknownBreak')
    }
  })

  it('testIfUnknownLoadSparse', async () => {
    const competitionJSON = await readFile(new URL(path.join('ifunknown', 'incomplete-group-multi-stage-sparse.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    const ifUnknown = competition.getStage('F').getIfUnknown()

    assert.equal(ifUnknown.getMatchType(), MatchType.CONTINUOUS)
    assert.equal(ifUnknown.getID(), 'unknown')
    assert.equal(ifUnknown.getMatchType(), MatchType.CONTINUOUS)
    assert.equal(ifUnknown.getCompetition().getName(), 'Test Knockout')
    assert.deepEqual(ifUnknown.getTeamIDs(), [])
    assert(!ifUnknown.matchesHaveCourts())
    assert(!ifUnknown.matchesHaveDates())
    assert(!ifUnknown.matchesHaveDurations())
    assert(!ifUnknown.matchesHaveManagers())
    assert(!ifUnknown.matchesHaveMVPs())
    assert(!ifUnknown.matchesHaveNotes())
    assert(!ifUnknown.matchesHaveOfficials())
    assert(!ifUnknown.matchesHaveStarts())
    assert(!ifUnknown.matchesHaveVenues())
    assert(!ifUnknown.matchesHaveWarmups())

    const secondMatch = ifUnknown.getMatches()[1]
    assert.equal(secondMatch.getID(), 'SF2')
    assert(secondMatch.getGroup() instanceof IfUnknown)
    assert(!secondMatch.isComplete())
    assert(!secondMatch.isDraw())
    assert.equal(secondMatch.getWinnerTeamID(), CompetitionTeam.UNKNOWN_TEAM_ID)
    assert.equal(secondMatch.getLoserTeamID(), CompetitionTeam.UNKNOWN_TEAM_ID)
    assert.equal(secondMatch.getHomeTeamSets(), 0)
    assert.equal(secondMatch.getAwayTeamSets(), 0)
    assert.equal(secondMatch.getHomeTeam().getID(), '1st Group B')
    assert.equal(secondMatch.getAwayTeam().getID(), '2nd Group A')
    assert.equal(secondMatch.getCourt(), null)
    assert.equal(secondMatch.getVenue(), null)
    assert.equal(secondMatch.getDate(), null)
    assert.equal(secondMatch.getWarmup(), null)
    assert.equal(secondMatch.getDuration(), null)
    assert.equal(secondMatch.getStart(), null)
    assert.equal(secondMatch.getNotes(), null)
    assert.equal(secondMatch.getOfficials(), null)

    let groupBreak = ifUnknown.getMatches()[2]
    groupBreak = ifUnknown.getMatches()[2]
    if (groupBreak instanceof IfUnknownBreak) {
      assert.equal(groupBreak.getStart(), null)
      assert.equal(groupBreak.getDate(), null)
      assert.equal(groupBreak.getDuration(), null)
      assert.equal(groupBreak.getName(), 'Lunch break')
      assert.equal(groupBreak.getIfUnknown(), ifUnknown)
    } else {
      assert.fail('Match 3 in the IfUnknown block should have been represented as a IfUnknownBreak')
    }
  })

  it('testIfUnknownMatchSaveScoresIsIgnored', async () => {
    const competitionJSON = await readFile(new URL(path.join('matches', 'save-scores.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    const ifUnknown = competition.getStage('L').getIfUnknown()
    const match = ifUnknown.getMatches()[0]

    match.setScores([23], [25])
    assert.equal(match.getHomeTeamScores().length, 0)
    assert.equal(match.getAwayTeamScores().length, 0)
  })

  it('testIfUnknownNoDuplicateMatchIDs', async () => {
    const competitionJSON = await readFile(new URL(path.join('ifunknown', 'duplicate-match-ids.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'stage ID {F}, ifUnknown: matches with duplicate IDs {FIN} not allowed'
    })
  })

  it('testIfUnknownNoSuchMatch', async () => {
    const competitionJSON = await readFile(new URL(path.join('ifunknown', 'incomplete-group-multi-stage-sparse.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    assert.throws(() => {
      competition.getStage('F').getIfUnknown().getMatch('NO_SUCH_MATCH')
    }, {
      message: 'Match with ID NO_SUCH_MATCH not found'
    })
  })

  it('testIfUnknownBreakSetters', async () => {
    const stage = new Stage(new Competition('test'), 'S')
    const ifUnknown = new IfUnknown(stage, ['test unknown'])
    const ifUnknownBreak = new IfUnknownBreak(ifUnknown)

    assert.throws(() => {
      ifUnknownBreak.setStart('abc')
    }, {
      message: 'Invalid start time "abc": must contain a value of the form "HH:mm" using a 24 hour clock'
    })

    assert.throws(() => {
      ifUnknownBreak.setStart('10:60')
    }, {
      message: 'Invalid start time "10:60": must contain a value of the form "HH:mm" using a 24 hour clock'
    })

    assert.throws(() => {
      ifUnknownBreak.setDate('24AD-10-21')
    }, {
      message: 'Invalid date "24AD-10-21": must contain a value of the form "YYYY-MM-DD"'
    })

    assert.throws(() => {
      ifUnknownBreak.setDate('2024-21-10')
    }, {
      message: 'Invalid date "2024-21-10": must contain a value of the form "YYYY-MM-DD"'
    })

    assert.throws(() => {
      ifUnknownBreak.setDate('2024-02-30')
    }, {
      message: 'Invalid date "2024-02-30": date does not exist'
    })

    assert.throws(() => {
      ifUnknownBreak.setDuration('1:61')
    }, {
      message: 'Invalid duration "1:61": must contain a value of the form "HH:mm"'
    })

    assert.throws(() => {
      ifUnknownBreak.setName('')
    }, {
      message: 'Invalid break name: must be between 1 and 1000 characters long'
    })

    assert.throws(() => {
      let name = 'a'
      for (let i = 0; i < 100; i++) {
        name += '0123456789'
      }
      ifUnknownBreak.setName(name)
    }, {
      message: 'Invalid break name: must be between 1 and 1000 characters long'
    })

    ifUnknownBreak.setStart('10:00')
    ifUnknownBreak.setDate('2024-02-29')
    ifUnknownBreak.setDuration('0:55')
    ifUnknownBreak.setName('Morning tea break')
  })

  it('testIfUnknownMatchSetters', async () => {
    const competition = new Competition('test')
    const stage = new Stage(competition, 'S')
    const ifUnknown = new IfUnknown(stage, ['test unknown'])
    const ifUnknownMatch = new IfUnknownMatch(ifUnknown, 'M1')

    assert.equal(ifUnknownMatch.getIfUnknown(), ifUnknown)

    assert.throws(() => {
      ifUnknownMatch.setCourt('')
    }, {
      message: 'Invalid court: must be between 1 and 1000 characters long'
    })

    assert.throws(() => {
      let court = '1'
      for (let i = 0; i < 100; i++) {
        court += '0123456789'
      }
      ifUnknownMatch.setCourt(court)
    }, {
      message: 'Invalid court: must be between 1 and 1000 characters long'
    })

    assert.throws(() => {
      ifUnknownMatch.setVenue('')
    }, {
      message: 'Invalid venue: must be between 1 and 10000 characters long'
    })

    assert.throws(() => {
      let venue = '1'
      for (let i = 0; i < 100; i++) {
        venue += '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789'
      }
      ifUnknownMatch.setVenue(venue)
    }, {
      message: 'Invalid venue: must be between 1 and 10000 characters long'
    })

    assert.throws(() => {
      ifUnknownMatch.setDate('24AD-10-21')
    }, {
      message: 'Invalid date "24AD-10-21": must contain a value of the form "YYYY-MM-DD"'
    })

    assert.throws(() => {
      ifUnknownMatch.setDate('2024-21-10')
    }, {
      message: 'Invalid date "2024-21-10": must contain a value of the form "YYYY-MM-DD"'
    })

    assert.throws(() => {
      ifUnknownMatch.setDate('2024-02-30')
    }, {
      message: 'Invalid date "2024-02-30": date does not exist'
    })

    assert.throws(() => {
      ifUnknownMatch.setWarmup('abc')
    }, {
      message: 'Invalid warmup time "abc": must contain a value of the form "HH:mm" using a 24 hour clock'
    })

    assert.throws(() => {
      ifUnknownMatch.setWarmup('10:60')
    }, {
      message: 'Invalid warmup time "10:60": must contain a value of the form "HH:mm" using a 24 hour clock'
    })

    assert.throws(() => {
      ifUnknownMatch.setStart('abc')
    }, {
      message: 'Invalid start time "abc": must contain a value of the form "HH:mm" using a 24 hour clock'
    })

    assert.throws(() => {
      ifUnknownMatch.setStart('10:60')
    }, {
      message: 'Invalid start time "10:60": must contain a value of the form "HH:mm" using a 24 hour clock'
    })

    assert.throws(() => {
      ifUnknownMatch.setDuration('1:61')
    }, {
      message: 'Invalid duration "1:61": must contain a value of the form "HH:mm"'
    })

    ifUnknownMatch.setCourt('court 1')
    ifUnknownMatch.setVenue('City Stadium')
    ifUnknownMatch.setDate('2024-02-29')
    ifUnknownMatch.setWarmup('10:00')
    ifUnknownMatch.setStart('10:20')
    ifUnknownMatch.setDuration('0:40')
    ifUnknownMatch.setMVP(new Player(competition, Player.UNREGISTERED_PLAYER_ID, 'Alan Measles'))
    ifUnknownMatch.setFriendly(false)

    assert(!ifUnknownMatch.isFriendly())
    ifUnknownMatch.setFriendly(true)
    assert(ifUnknownMatch.isFriendly())

    assert(!ifUnknownMatch.hasOfficials())
    ifUnknownMatch.setOfficials(new MatchOfficials(ifUnknownMatch, null, 'Alan Measles'))
    assert(ifUnknownMatch.hasOfficials())
  })
})
