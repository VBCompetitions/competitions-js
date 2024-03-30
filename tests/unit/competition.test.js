import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Club, Competition, CompetitionTeam, GroupMatch, League, LeagueConfig, LeagueConfigPoints, MatchOfficials, MatchTeam, MatchType, Stage } from '../../src/index.js'

describe('competition', () => {
  it('testCompetitionInvalidData', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'invalid-competition.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    },
    e => {
      assert.match(e.message, /Competition data failed schema validation.*\[#\/required\] \[\] must have required property 'name'/s)
      return true
    })
  })

  it('testCompetitionInvalidVersion', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'bad-version-competition.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    },
    {
      message: 'Document version 0.0.1 not supported'
    })
  })

  it('testCompetitionInvalidJSON', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-not-json.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    },
    {
      message: 'Document does not contain valid JSON'
    })
  })

  it('testCompetitionDuplicateTeamIDs', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-duplicate-team-ids.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    },
    {
      message: 'Team with ID "TM1" already exists in the competition'
    })
  })

  it('testCompetitionDuplicateStageIDs', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-duplicate-stage-ids.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    },
    {
      message: 'Stage with ID "L" already exists in the competition'
    })
  })

  it('testCompetitionDuplicateGroupIDs', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-duplicate-group-ids.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    },
    {
      message: 'Groups in a Stage with duplicate IDs not allowed: {L:RL}'
    })
  })

  it('testCompetitionGetTeamByIDTernaries', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-with-references.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const matchF1 = competition.getStageByID('F').getGroupByID('F').getMatchByID('F1')
    const matchF2 = competition.getStageByID('F').getGroupByID('F').getMatchByID('F2')

    const truthyTeam = competition.getTeamByID(matchF1.getHomeTeam().getID())
    const falsyTeam = competition.getTeamByID(matchF1.getAwayTeam().getID())

    const truthyTeamRef = competition.getTeamByID(matchF2.getHomeTeam().getID())
    const falsyTeamRef = competition.getTeamByID(matchF2.getAwayTeam().getID())

    assert.equal(truthyTeam.getID(), 'TM1')
    assert.equal(falsyTeam.getID(), 'TM2')
    assert.equal(truthyTeamRef.getID(), 'TM6')
    assert.equal(falsyTeamRef.getID(), 'TM7')
  })

  it('testCompetitionGetStageLookups', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    assert.equal(competition.getStages().length, 1)
    assert.equal(competition.getStages()[0].getID(), 'L')
    const stage = competition.getStageByID('L')
    assert.equal(stage.getName(), 'league')
  })

  it('testCompetitionGetStageLookupFails', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    assert.throws(() => {
      competition.getStageByID('NO-STAGE')
    }, {
      message: 'Stage with ID NO-STAGE not found'
    })
  })

  it('testCompetitionGetTeamLookupsIncomplete', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    assert(!competition.isComplete())
    assert(competition.hasTeamID('TM1'))
    assert(competition.hasTeamID('TM8'))

    assert.equal(competition.getTeamByID('{L:RL:league:1}').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)
    assert.equal(competition.getTeamByID('{L:RL:league:2}').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)
    assert.equal(competition.getTeamByID('{L:RL:league:3}').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)
    assert.equal(competition.getTeamByID('{L:RL:league:4}').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)
    assert.equal(competition.getTeamByID('{L:RL:league:5}').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)
    assert.equal(competition.getTeamByID('{L:RL:league:6}').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)
    assert.equal(competition.getTeamByID('{L:RL:league:7}').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)
    assert.equal(competition.getTeamByID('{L:RL:league:8}').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)

    assert.equal(competition.getTeamByID('{L:RL:RLM1:winner}').getID(), 'TM2')
    assert.equal(competition.getTeamByID('{L:RL:RLM1:loser}').getID(), 'TM1')

    assert(!competition.hasTeamID('NO-SUCH-TEAM'))
    assert.equal(competition.getTeamByID('NO-SUCH-TEAM').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)

    assert(!competition.hasTeamID('{NO:SUCH:TEAM:REF}'))
    assert.equal(competition.getTeamByID('{NO:SUCH:TEAM:REF}').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)
  })

  it('testCompetitionGetTeamLookupsInvalid', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-knockout-sets.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    assert.equal(competition.getTeamByID('{KO:CUP:QF1:foo}').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)
  })

  it('testCompetitionGetTeamLookupsComplete', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-complete.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    assert.equal(competition.getVersion(), '1.0.0')

    assert(competition.isComplete())
    assert(competition.hasTeamID('TM1'))
    assert(competition.hasTeamID('TM8'))

    assert.equal(competition.getTeamByID('{L:RL:league:1}').getID(), 'TM6')
    assert.equal(competition.getTeamByID('{L:RL:league:2}').getID(), 'TM5')
    assert.equal(competition.getTeamByID('{L:RL:league:3}').getID(), 'TM2')
    assert.equal(competition.getTeamByID('{L:RL:league:4}').getID(), 'TM4')
    assert.equal(competition.getTeamByID('{L:RL:league:5}').getID(), 'TM3')
    assert.equal(competition.getTeamByID('{L:RL:league:6}').getID(), 'TM7')
    assert.equal(competition.getTeamByID('{L:RL:league:7}').getID(), 'TM8')
    assert.equal(competition.getTeamByID('{L:RL:league:8}').getID(), 'TM1')

    assert.equal(competition.getTeamByID('{L:RL:RLM1:winner}').getID(), 'TM2')
    assert.equal(competition.getTeamByID('{L:RL:RLM1:loser}').getID(), 'TM1')

    assert(!competition.hasTeamID('NO-SUCH-TEAM'))
    assert.equal(competition.getTeamByID('NO-SUCH-TEAM').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)

    assert(!competition.hasTeamID('{NO:SUCH:TEAM:REF}'))
    assert.equal(competition.getTeamByID('{NO:SUCH:TEAM:REF}').getID(), CompetitionTeam.UNKNOWN_TEAM_ID)
  })

  it('testCompetitionStageWithNoName', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-stages-no-name.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    assert.equal(competition.getStageByID('L0').getName(), null)
    assert.equal(competition.getStageByID('L1').getName(), 'league')
    assert.equal(competition.getStageByID('L2').getName(), null)
  })

  it('testCompetitionIncompleteWithTeamReferences', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-half-done-with-references.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    assert(!competition.getStageByID('Divisions').getGroupByID('Division 1').getMatchByID('D1M1').isComplete())
  })

  it('testCompetitionValidHomeTeamRef', async () => {
    // An earlier version only checked for a starting '{'. Under certain structures, if a team reference was missing a closing '}'
    // in a second stage, the code would go into an infinite loop on calling teamMayHaveMatches, thinking there was a team
    // reference but unable to resolve that reference
    const competitionJSON = await readFile(new URL(path.join('competitions', 'bad-home-team-ref.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    },
    {
      message: 'Invalid team reference for homeTeam in match with ID "SF1": "{P:A:league:1"'
    })
  })

  it('testCompetitionValidAwayTeamRef', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'bad-away-team-ref.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    },
    {
      message: 'Invalid team reference for awayTeam in match with ID "SF1": "{P:A:league:3"'
    })
  })

  it('testCompetitionValidOfficialTeamRef', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'bad-officials-team-ref.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    },
    {
      message: 'Invalid team reference for officials in match with ID "SF1": "{P:A:league:2"'
    })
  })

  it('testCompetitionValidHomeTeamID', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'bad-home-team-id.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    },
    {
      message: 'Invalid team ID for homeTeam in match with ID "PA1"'
    })
  })

  it('testCompetitionValidAwayTeamID', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'bad-away-team-id.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Invalid team ID for awayTeam in match with ID "PA1"'
    })
  })

  it('testCompetitionValidOfficialTeamID', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'bad-officials-team-id.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Invalid team ID for officials in match with ID "PA3"'
    })
  })

  it('testCompetitionValidateTeamID', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-complete.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    competition.validateTeamID('{L:RL:league:1}', 'match_id', 'field')
    competition.validateTeamID('TM1', 'match_id', 'field')
    competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?TM1:{L:RL:league:2}', 'match_id', 'field')
    competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{L:RL:league:1}:TM2', 'match_id', 'field')
    competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?TM1:TM2', 'match_id', 'field')

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:0}', 'match_id', 'field')
    }, {
      message: 'Invalid League position: reference must be a positive integer'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:a}', 'match_id', 'field')
    }, {
      message: 'Invalid League position: reference must be an integer'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:9}', 'match_id', 'field')
    }, {
      message: 'Invalid League position: position is bigger than the number of teams'
    })
  })

  it('testCompetitionValidateTeamIDBadTernaryLeftPart', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-complete.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1=={L:RL:RLM1:winner}?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary left part reference for field in match with ID "match_id": "{L:RL:league:1"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:RLM1:winer}=={L:RL:RLM1:winner}?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary left part reference for field in match with ID "match_id": "{L:RL:RLM1:winer}"'
    })

    assert.throws(() => {
      competition.validateTeamID('L:RL:league:1}=={L:RL:RLM1:winner}?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid team ID for field in match with ID "match_id"'
    })

    assert.throws(() => {
      competition.validateTeamID('{S:league:2}=={L:RL:RLM1:winner}?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary left part reference for field in match with ID "match_id": "{S:league:2}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{NAN:RL:league:1}=={L:RL:RLM1:winner}?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary left part reference for field in match with ID "match_id": "{NAN:RL:league:1}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:NAN:league:1}=={L:RL:RLM1:winner}?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary left part reference for field in match with ID "match_id": "{L:NAN:league:1}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:NAN:winner}=={L:RL:RLM1:winner}?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary left part reference for field in match with ID "match_id": "{L:RL:NAN:winner}"'
    })
  })

  it('testCompetitionValidateTeamIDBadTernaryRightPart', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-complete.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary right part reference for field in match with ID "match_id": "{L:RL:RLM1:winner"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winer}?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary right part reference for field in match with ID "match_id": "{L:RL:RLM1:winer}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}==L:RL:RLM1:winner}?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary right part reference for field in match with ID "match_id": "L:RL:RLM1:winner}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={S:league:2}?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary right part reference for field in match with ID "match_id": "{S:league:2}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={NAN:RL:RLM1:winner}?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary right part reference for field in match with ID "match_id": "{NAN:RL:RLM1:winner}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:NAN:RLM1:winner}?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary right part reference for field in match with ID "match_id": "{L:NAN:RLM1:winner}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:NAN:winner}?{L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary right part reference for field in match with ID "match_id": "{L:RL:NAN:winner}"'
    })
  })

  it('testCompetitionValidateTeamIDBadTernaryTrueTeam', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-complete.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{L:RL:league:1:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary true team reference for field in match with ID "match_id": "{L"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{L:RL:RLM1:winer}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary true team reference for field in match with ID "match_id": "{L:RL:RLM1:winer}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?L:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary true team reference for field in match with ID "match_id": "L"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{S:league:2}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary true team reference for field in match with ID "match_id": "{S:league:2}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{NAN:RL:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary true team reference for field in match with ID "match_id": "{NAN:RL:league:1}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{L:NAN:league:1}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary true team reference for field in match with ID "match_id": "{L:NAN:league:1}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{L:RL:NAN:winner}:{L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary true team reference for field in match with ID "match_id": "{L:RL:NAN:winner}"'
    })
  })

  it('testCompetitionValidateTeamIDBadTernaryFalseTeam', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-complete.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{L:RL:league:1}:{L:RL:league:2', 'match_id', 'field')
    }, {
      message: 'Invalid ternary false team reference for field in match with ID "match_id": "{L:RL:league:2"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{L:RL:league:1}:{L:RL:RLM1:winer}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary false team reference for field in match with ID "match_id": "{L:RL:RLM1:winer}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{L:RL:league:1}:L:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary false team reference for field in match with ID "match_id": "L:RL:league:2}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{L:RL:league:1}:{S:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary false team reference for field in match with ID "match_id": "{S:league:2}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{L:RL:league:1}:{NAN:RL:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary false team reference for field in match with ID "match_id": "{NAN:RL:league:2}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{L:RL:league:1}:{L:NAN:league:2}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary false team reference for field in match with ID "match_id": "{L:NAN:league:2}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?{L:RL:league:1}:{L:RL:NAN:winner}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary false team reference for field in match with ID "match_id": "{L:RL:NAN:winner}"'
    })

    assert.throws(() => {
      competition.validateTeamID('{L:RL:league:1}=={L:RL:RLM1:winner}?TM1:{L:RL:NAN:winner}', 'match_id', 'field')
    }, {
      message: 'Invalid ternary false team reference for field in match with ID "match_id": "{L:RL:NAN:winner}"'
    })
  })

  it('testCompetitionTernaryReferenceToThisStageGroup', async () => {
    // We should be able to load a competition including ternaries that refer the group those ternary references are in
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-ternary-refers-to-this-stage-group.json'), import.meta.url), { encoding: 'utf8' })
    await Competition.loadFromCompetitionJSON(competitionJSON)
    assert(true)
  })

  it('testCompetitionWithNotes', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-with-notes.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    assert.equal(competition.getNotes(), 'This is a note')
    competition.setNotes('This is a new note')
    assert.equal(competition.getNotes(), 'This is a new note')
  })

  it('testCompetitionWithoutNotes', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-without-notes.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    assert.equal(competition.getNotes(), null)
  })

  it('testCompetitionConstructorBadName', () => {
    assert.throws(() => {
      new Competition('')
    }, {
      message: 'Invalid competition name: must be between 1 and 1000 characters long'
    })

    let name = 'a'
    for (let i = 0; i < 100; i++) {
      name += '0123456789'
    }

    assert.throws(() => {
      new Competition(name)
    }, {
      message: 'Invalid competition name: must be between 1 and 1000 characters long'
    })
  })

  it('testCompetitionAddTeam', () => {
    const competition1 = new Competition('test competition 1')
    const competition2 = new Competition('test competition 1')
    assert.equal(competition1.getTeams().length, 0)
    assert.equal(competition2.getTeams().length, 0)

    const team = new CompetitionTeam(competition1, 'TM1', 'Team 1')
    assert.equal(competition1.getTeams().length, 0)
    assert.equal(competition2.getTeams().length, 0)

    assert.throws(() => {
      competition2.addTeam(team)
    }, {
      message: 'Team was initialised with a different Competition'
    })

    competition1.addTeam(team)
    assert.equal(competition1.getTeams().length, 1)
    assert.equal(competition2.getTeams().length, 0)

    competition1.addTeam(team)
    assert.equal(competition1.getTeams().length, 1)
  })

  it('testCompetitionDeleteTeam', () => {
    const competition = new Competition('test competition')
    const team1 = new CompetitionTeam(competition, 'T1', 'Team 1')
    const team2 = new CompetitionTeam(competition, 'T2', 'Team 2')
    const team3 = new CompetitionTeam(competition, 'T3', 'Team 3')
    const team4 = new CompetitionTeam(competition, 'T4', 'Team 4')
    competition.addTeam(team1).addTeam(team2).addTeam(team3).addTeam(team4)
    const stage = new Stage(competition, 'S')
    competition.addStage(stage)
    const league = new League(stage, 'G', MatchType.CONTINUOUS, false)
    stage.addGroup(league)
    const match1 = new GroupMatch(league, 'M1')
    match1.setHomeTeam(new MatchTeam(match1, team1.getID())).setAwayTeam(new MatchTeam(match1, team2.getID())).setOfficials(new MatchOfficials(match1, team3.getID()))
    const match2 = new GroupMatch(league, 'M2')
    match2.setHomeTeam(new MatchTeam(match2, team2.getID())).setAwayTeam(new MatchTeam(match2, team1.getID())).setOfficials(new MatchOfficials(match2, team3.getID()))
    league.addMatch(match1).addMatch(match2)
    const leagueConfig = new LeagueConfig(league)
    league.setLeagueConfig(leagueConfig)
    leagueConfig.setOrdering(['PTS', 'PD'])
    const leagueConfigPoints = new LeagueConfigPoints(leagueConfig)
    leagueConfig.setPoints(leagueConfigPoints)

    // Team with known matches cannot be deleted
    assert.throws(() => {
      competition.deleteTeam(team1.getID())
    }, {
      message: 'Team still has matches with IDs: {S:G:M1}, {S:G:M2}'
    })

    assert.throws(() => {
      competition.deleteTeam(team2.getID())
    }, {
      message: 'Team still has matches with IDs: {S:G:M1}, {S:G:M2}'
    })

    assert.throws(() => {
      competition.deleteTeam(team3.getID())
    }, {
      message: 'Team still has matches with IDs: {S:G:M1}, {S:G:M2}'
    })

    competition.deleteTeam(team4.getID())
    competition.deleteTeam('undefined-team-id')
  })

  it('testCompetitionSetters', () => {
    const competition = new Competition('test competition')

    assert.throws(() => {
      competition.setName('')
    }, {
      message: 'Invalid competition name: must be between 1 and 1000 characters long'
    })

    let name = 'a'
    for (let i = 0; i < 100; i++) {
      name += '0123456789'
    }
    assert.throws(() => {
      competition.setName(name)
    }, {
      message: 'Invalid competition name: must be between 1 and 1000 characters long'
    })

    assert.throws(() => {
      competition.setNotes('')
    }, {
      message: 'Invalid competition notes: must be at least 1 character long'
    })
  })

  it('testCompetitionAddStage', () => {
    const competition1 = new Competition('test competition 1')
    const competition2 = new Competition('test competition 1')
    assert.equal(competition1.getStages().length, 0)
    assert.equal(competition2.getStages().length, 0)

    const stage = new Stage(competition1, 'STG')
    assert.equal(competition1.getStages().length, 0)
    assert.equal(competition2.getStages().length, 0)

    assert.throws(() => {
      competition2.addStage(stage)
    }, {
      message: 'Stage was initialised with a different Competition'
    })

    competition1.addStage(stage)
    assert.equal(competition1.getStages().length, 1)
    assert.equal(competition2.getStages().length, 0)
  })

  it('testCompetitionDeleteStage', () => {
    const competition = new Competition('test competition')
    const team1 = new CompetitionTeam(competition, 'T1', 'Team 1')
    const team2 = new CompetitionTeam(competition, 'T2', 'Team 2')
    const team3 = new CompetitionTeam(competition, 'T3', 'Team 3')
    competition.addTeam(team1).addTeam(team2).addTeam(team3)
    const stage1 = new Stage(competition, 'S1')
    competition.addStage(stage1)
    const league1 = new League(stage1, 'G1', MatchType.CONTINUOUS, false)
    stage1.addGroup(league1)
    const match1 = new GroupMatch(league1, 'M1')
    match1.setHomeTeam(new MatchTeam(match1, team1.getID())).setAwayTeam(new MatchTeam(match1, team2.getID())).setOfficials(new MatchOfficials(match1, team3.getID()))
    league1.addMatch(match1)

    const stage2 = new Stage(competition, 'S2')
    competition.addStage(stage2)
    const league2 = new League(stage2, 'G2', MatchType.CONTINUOUS, false)
    stage2.addGroup(league2)
    const match2 = new GroupMatch(league1, 'M2')
    match2.setHomeTeam(new MatchTeam(match2, team3.getID())).setAwayTeam(new MatchTeam(match2, '{S1:G1:M1:winner}')).setOfficials(new MatchOfficials(match2, '{S1:G1:M1:winner}=={S1:G1:M1:winner}?{S1:G1:M1:winner}:{S1:G1:M1:loser}'))
    league2.addMatch(match2)

    assert.throws(() => {
      competition.deleteStage(stage1.getID())
    }, {
      message: 'Cannot delete stage with id "S1" as it is referenced in match {S2:G2:M2}'
    })

    competition.deleteStage(stage2.getID())
    competition.deleteStage(stage1.getID())
  })

  it('testCompetitionAddClub', () => {
    const competition1 = new Competition('test competition 1')
    const competition2 = new Competition('test competition 1')
    assert.equal(competition1.getClubs().length, 0)
    assert.equal(competition2.getClubs().length, 0)

    const stage = new Club(competition1, 'CLB1', 'Club 1')
    assert.equal(competition1.getClubs().length, 0)
    assert.equal(competition2.getClubs().length, 0)

    assert.throws(() => {
      competition2.addClub(stage)
    }, {
      message: 'Club was initialised with a different Competition'
    })

    competition1.addClub(stage)
    assert.equal(competition1.getClubs().length, 1)
    assert.equal(competition2.getClubs().length, 0)
  })

  it('testCompetitionDeleteClub', () => {
    // Create a competition with a club containing two teams, and a second club with no teams
    const competition = new Competition('test competition')
    const team1 = new CompetitionTeam(competition, 'T1', 'Team 1')
    const team2 = new CompetitionTeam(competition, 'T2', 'Team 2')
    const team3 = new CompetitionTeam(competition, 'T3', 'Team 3')
    const club1 = new Club(competition, 'C1', 'Club 1')
    const club2 = new Club(competition, 'C2', 'Club 2')
    competition.addClub(club1).addClub(club2)
    competition.addTeam(team1).addTeam(team2).addTeam(team3)
    team1.setClubID(club1.getID())
    team2.setClubID(club1.getID())

    assert.equal(team1.getClub().getID(), 'C1')
    assert.equal(team2.getClub().getID(), 'C1')
    assert.equal(team3.getClub(), null)

    assert.throws(() => {
      competition.deleteClub(club1.getID())
    }, {
      message: 'Club still contains teams with IDs: {T1}, {T2}'
    })

    competition.deleteClub(club2.getID())
    club1.deleteTeam(team1.getID())
    club1.deleteTeam(team2.getID())
    competition.deleteClub(club1.getID())

    competition.deleteClub('non-existent-team-id')
  })


  it('testCompetitionMetadataFunctions', () => {
    const competition = new Competition('test')
    assert(!competition.hasMetadata())
    assert.equal(competition.getMetadata(), null)
    assert(!competition.hasMetadataByKey('foo'))
    assert.equal(competition.getMetadataByKey('foo'), null)
    assert(!competition.hasMetadataByKey('bar'))
    assert.equal(competition.getMetadataByKey('bar'), null)

    competition.setMetadataByID('foo', 'bar')
    assert(competition.hasMetadata())
    assert.equal(competition.getMetadata().length, 1)
    assert(competition.hasMetadataByKey('foo'))
    assert.equal(competition.getMetadataByKey('foo'), 'bar')
    assert(!competition.hasMetadataByKey('bar'))
    assert.equal(competition.getMetadataByKey('bar'), null)

    competition.setMetadataByID('bar', 'baz')
    assert(competition.hasMetadata())
    assert.equal(competition.getMetadata().length, 2)
    assert(competition.hasMetadataByKey('foo'))
    assert.equal(competition.getMetadataByKey('foo'), 'bar')
    assert(competition.hasMetadataByKey('bar'))
    assert.equal(competition.getMetadataByKey('bar'), 'baz')

    competition.setMetadataByID('foo', 'bar')
    assert(competition.hasMetadata())
    assert.equal(competition.getMetadata().length, 2)
    assert(competition.hasMetadataByKey('foo'))
    assert.equal(competition.getMetadataByKey('foo'), 'bar')
    assert(competition.hasMetadataByKey('bar'))
    assert.equal(competition.getMetadataByKey('bar'), 'baz')

    competition.deleteMetadataByKey('foo')
    assert(competition.hasMetadata())
    assert.equal(competition.getMetadata().length, 1)
    assert(!competition.hasMetadataByKey('foo'))
    assert.equal(competition.getMetadataByKey('foo'), null)
    assert(competition.hasMetadataByKey('bar'))
    assert.equal(competition.getMetadataByKey('bar'), 'baz')

    competition.deleteMetadataByKey('bar')
    assert(!competition.hasMetadata())
    assert.equal(competition.getMetadata(), null)
    assert(!competition.hasMetadataByKey('foo'))
    assert.equal(competition.getMetadataByKey('foo'), null)
    assert(!competition.hasMetadataByKey('bar'))
    assert.equal(competition.getMetadataByKey('bar'), null)

    competition.deleteMetadataByKey('foo')
    assert(!competition.hasMetadata())
    assert.equal(competition.getMetadata(), null)
    assert(!competition.hasMetadataByKey('foo'))
    assert.equal(competition.getMetadataByKey('foo'), null)
    assert(!competition.hasMetadataByKey('bar'))
    assert.equal(competition.getMetadataByKey('bar'), null)

    assert.throws(() => {
      competition.setMetadataByID('', 'bar')
    }, {
      message: 'Invalid metadata key: must be between 1 and 100 characters long'
    })

    let longKey = 'a'
    for (let i = 0; i < 100; i++) {
      longKey += '0123456789'
    }
    assert.throws(() => {
      competition.setMetadataByID(longKey, 'bar')
    }, {
      message: 'Invalid metadata key: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      competition.setMetadataByID('foo', '')
    }, {
      message: 'Invalid metadata value: must be between 1 and 1000 characters long'
    })

    let longValue = 'a'
    for (let i = 0; i < 1000; i++) {
      longValue += '0123456789'
    }
    assert.throws(() => {
      competition.setMetadataByID('foo', longValue)
    }, {
      message: 'Invalid metadata value: must be between 1 and 1000 characters long'
    })
  })
})
