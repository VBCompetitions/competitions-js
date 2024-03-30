import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Competition, CompetitionTeam, Player } from '../../src/index.js'

describe('player', () => {
  it('testPlayerNone', async () => {
    const competitionJSON = await readFile(new URL(path.join('players', 'players.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    const team = competition.getTeamByID('TM1')
    assert(team instanceof CompetitionTeam)
    assert(!team.hasPlayers())
  })

  it('testPlayerDuplicateID', async () => {
    const competitionJSON = await readFile(new URL(path.join('players', 'players-duplicate-ids.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Player with ID "P1" already exists in the team'
    })
  })

  it('testPlayerGetByID', async () => {
    const competitionJSON = await readFile(new URL(path.join('players', 'players.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    let team = competition.getTeamByID('TM3')

    assert.equal(team.getPlayerByID('P1').getName(), 'Alice Alison')
    assert.equal(team.getPlayerByID('P1').getNotes(), 'junior')
    assert.equal(team.getPlayerByID('P2').getName(), 'Bobby Bobs')
    assert.equal(team.getPlayerByID('P3').getName(), 'Charlie Charleston')
    assert.equal(team.getPlayerByID('P3').getNumber(), 7)
    assert.equal(team.getPlayerByID('P4').getName(), 'Dave Davidson')
    assert.equal(team.getPlayerByID('P5').getName(), 'Emma Emerson')
    assert.equal(team.getPlayerByID('P6').getName(), 'Frankie Frank')
    assert.equal(team.getPlayerByID('P6').getTeam().getID(), team.getID())

    team = competition.getTeamByID('TM2')
    assert.equal(team.getPlayerByID('P1').getNumber(), null)
    assert.equal(team.getPlayerByID('P1').getNotes(), null)
  })

  it('testPlayerGetByIDOutOfBounds', async () => {
    const competitionJSON = await readFile(new URL(path.join('players', 'players.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    assert.throws(() => {
      competition.getTeamByID('TM1').getPlayerByID('NO-SUCH-TEAM')
    }, {
      message: 'Player with ID "NO-SUCH-TEAM" not found'
    })
  })

  it('testPlayerSetters', async () => {
    const competitionJSON = await readFile(new URL(path.join('players', 'players.json'), import.meta.url), { encoding: 'utf8' })
    let competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    let team = competition.getTeamByID('TM3')

    const player1 = team.getPlayerByID('P1')

    assert.equal(player1.getName(), 'Alice Alison')
    assert.equal(player1.getNumber(), 1)
    assert.equal(player1.getNotes(), 'junior')

    player1.setName('Alison Alison')
    player1.setNumber(10)
    player1.setNotes('no longer junior')

    assert.equal(player1.getName(), 'Alison Alison')
    assert.equal(player1.getNumber(), 10)
    assert.equal(player1.getNotes(), 'no longer junior')

    competition = new Competition('test')
    team = new CompetitionTeam(competition, 'T1', 'Team 1')
    const player = new Player(team, 'P1', 'Alice Alison')

    assert.throws(() => {
      player.setName('')
    }, {
      message: 'Invalid player name: must be between 1 and 1000 characters long'
    })

    let name = 'a'
    for (let i = 0; i < 100; i++) {
      name += '0123456789'
    }
    assert.throws(() => {
      player.setName(name)
    }, {
      message: 'Invalid player name: must be between 1 and 1000 characters long'
    })

    assert.throws(() => {
      player.setNumber(-1)
    }, {
      message: 'Invalid player number "-1": must be greater than 1'
    })
  })

  it('testPlayerConstructor', async () => {
    const competition = new Competition('test')
    const team = new CompetitionTeam(competition, 'T1', 'Team 1')

    assert.throws(() => {
      new Player(team, '', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new Player(team, '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567891', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new Player(team, '"id1"', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Player(team, 'id:1', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Player(team, 'id{1', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Player(team, 'id1}', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Player(team, 'id1?', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Player(team, 'id=1', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    const player1 = new Player(team, 'P1', 'Alice Alison')
    team.addPlayer(player1)

    assert.throws(() => {
      new Player(team, 'P1', 'Bobby Bobs')
    }, {
      message: 'Player with ID "P1" already exists in the team'
    })
  })
})
