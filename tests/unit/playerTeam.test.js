import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Competition, CompetitionTeam, Player, PlayerTeam } from '../../src/index.js'

describe('playerTeam', () => {
  it('testPlayerTeamSetters', async () => {
    const competitionJSON = await readFile(new URL(path.join('players', 'players.json'), import.meta.url), { encoding: 'utf8' })
    let competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    const player1 = competition.getPlayer('P1')
    const player1TeamEntries = player1.getTeamEntries()

    assert.equal(player1TeamEntries[0].getPlayer(), player1)
    assert.equal(player1TeamEntries[0].getID(), 'TM2')
    assert.equal(player1TeamEntries[0].getFrom(), '2023-09-01')
    assert.equal(player1TeamEntries[0].getUntil(), '2024-01-14')
    assert.equal(player1TeamEntries[0].getNotes(), null)
    assert.equal(player1TeamEntries[1].getPlayer(), player1)
    assert.equal(player1TeamEntries[1].getID(), 'TM3')
    assert.equal(player1TeamEntries[1].getFrom(), '2024-01-14')
    assert.equal(player1TeamEntries[1].getUntil(), null)
    assert.equal(player1TeamEntries[1].getNotes(), 'some notes')

    competition = new Competition('test')
    const player = new Player(competition, 'P1', 'Alice Alison')
    const playerTeam = new PlayerTeam(player, 'T1')

    assert.throws(() => {
      playerTeam.setFrom('Today')
    }, {
      message: 'Invalid date "Today": must contain a value of the form "YYYY-MM-DD"'
    })

    assert.throws(() => {
      playerTeam.setFrom('2024-02-30')
    }, {
      message: 'Invalid date "2024-02-30": date does not exist'
    })

    assert.throws(() => {
      playerTeam.setUntil('Today')
    }, {
      message: 'Invalid date "Today": must contain a value of the form "YYYY-MM-DD"'
    })

    assert.throws(() => {
      playerTeam.setUntil('2024-02-30')
    }, {
      message: 'Invalid date "2024-02-30": date does not exist'
    })

    playerTeam.setNotes('TODO')
  })

  it('testPlayerTeamConstructor', async () => {
    const competition = new Competition('test')
    const team = new CompetitionTeam(competition, 'T1', 'Team 1')
    competition.addTeam(team)
    const player = new Player(competition, 'P1', 'Alice Alison')
    competition.addPlayer(player)

    assert.throws(() => {
      new PlayerTeam(player, '')
    }, {
      message: 'Invalid team ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new PlayerTeam(player, '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567891')
    }, {
      message: 'Invalid team ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new PlayerTeam(player, '"id1"')
    }, {
      message: 'Invalid team ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new PlayerTeam(player, 'id:1')
    }, {
      message: 'Invalid team ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new PlayerTeam(player, 'id{1')
    }, {
      message: 'Invalid team ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new PlayerTeam(player, 'id1}')
    }, {
      message: 'Invalid team ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new PlayerTeam(player, 'id1?')
    }, {
      message: 'Invalid team ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new PlayerTeam(player, 'id=1')
    }, {
      message: 'Invalid team ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    const playerTeam = new PlayerTeam(player, 'T1')
    player.appendTeamEntry(playerTeam)
    playerTeam.setFrom('2023-10-03')
    playerTeam.setFrom('2023-10-04')
    playerTeam.setUntil('2024-06-28')
    playerTeam.setUntil('2024-06-29')
    playerTeam.setNotes('non-professional contract')
    assert(competition.hasPlayerInTeam('P1', 'T1'))
    assert.equal(playerTeam.getID(), 'T1')
    assert.equal(playerTeam.getFrom(), '2023-10-04')
    assert.equal(playerTeam.getUntil(), '2024-06-29')
    assert.equal(playerTeam.getNotes(), 'non-professional contract')
  })
})
