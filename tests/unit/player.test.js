import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Competition, CompetitionTeam, Player } from '../../src/index.js'

describe('player', () => {
  it('testPlayerNone', async () => {
    const competitionJSON = await readFile(new URL(path.join('players', 'players.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    const team = competition.getTeam('TM1')
    assert(team instanceof CompetitionTeam)
    assert(!team.hasPlayers())
  })

  it('testPlayerGetByID', async () => {
    const competitionJSON = await readFile(new URL(path.join('players', 'players.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    let team = competition.getTeam('TM3')

    assert.equal(competition.getPlayer('P1').getCompetition(), competition)
    assert.equal(competition.getPlayer('P1').getName(), 'Alice Alison')
    assert.equal(competition.getPlayer('P1').getNotes(), 'junior')
    assert.equal(competition.getPlayer('P2').getName(), 'Bobby Bobs')
    assert.equal(competition.getPlayer('P3').getName(), 'Charlie Charleston')
    assert.equal(competition.getPlayer('P3').getNumber(), 7)
    assert.equal(competition.getPlayer('P4').getName(), 'Dave Davidson')
    assert.equal(competition.getPlayer('P5').getName(), 'Emma Emerson')
    assert.equal(competition.getPlayer('P6').getName(), 'Frankie Frank')
    assert.equal(competition.getPlayer('P6').getCurrentTeam().getID(), team.getID())
    assert.equal(competition.getPlayer('P7').getNumber(), null)
    assert.equal(competition.getPlayer('P7').getNotes(), null)
    assert.equal(competition.getPlayer('P8').getCurrentTeam().getID(), CompetitionTeam.UNKNOWN_TEAM_ID)
  })

  it('testPlayerGetByIDOutOfBounds', async () => {
    const competitionJSON = await readFile(new URL(path.join('players', 'players.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    assert.throws(() => {
      competition.getPlayer('NO-SUCH-PLAYER')
    }, {
      message: 'Player with ID "NO-SUCH-PLAYER" not found'
    })
  })

  it('testPlayerSettersGetters', async () => {
    const competitionJSON = await readFile(new URL(path.join('players', 'players.json'), import.meta.url), { encoding: 'utf8' })
    let competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    const player1 = competition.getPlayer('P1')

    assert.equal(player1.getName(), 'Alice Alison')
    assert.equal(player1.getNumber(), 1)
    assert.equal(player1.getNotes(), 'junior')
    assert(!player1.hasTeamEntry('TM1'))
    assert(player1.hasTeamEntry('TM2'))
    assert(player1.hasTeamEntry('TM3'))

    assert.equal(competition.getPlayer('P8').getLatestTeamEntry(), null)

    player1.setName('Alison Alison')
    assert.equal(player1.getName(), 'Alison Alison')

    player1.setNumber(10)
    assert.equal(player1.getNumber(), 10)

    player1.setNotes('no longer junior')
    assert.equal(player1.getNotes(), 'no longer junior')

    player1.spliceTeamEntries(0, 1)
    assert(!player1.hasTeamEntry('TM1'))
    assert(!player1.hasTeamEntry('TM2'))
    assert(player1.hasTeamEntry('TM3'))

    competition = new Competition('test')
    const player = new Player(competition, 'P1', 'Alice Alison')

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

    assert.throws(() => {
      new Player(competition, '', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new Player(competition, '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567891', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new Player(competition, '"id1"', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Player(competition, 'id:1', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Player(competition, 'id{1', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Player(competition, 'id1}', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Player(competition, 'id1?', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Player(competition, 'id=1', 'Alice Alison')
    }, {
      message: 'Invalid player ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    const player1 = new Player(competition, 'P1', 'Alice Alison')
    competition.addPlayer(player1)

    assert.throws(() => {
      new Player(competition, 'P1', 'Bobby Bobs')
    }, {
      message: 'Player with ID "P1" already exists in the competition'
    })
  })
})
