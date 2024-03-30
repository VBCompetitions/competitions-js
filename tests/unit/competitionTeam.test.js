import assert from 'node:assert/strict'
import { describe, it } from 'node:test'


import { Club, Competition, CompetitionTeam, Contact, ContactRole, Player } from '../../src/index.js'

describe('competitionTeam', () => {
  it('testCompetitionTeamDuplicateID', async () => {
    const competition = new Competition('test competition')
    const team1 = new CompetitionTeam(competition, 'T1', 'team 1')
    competition.addTeam(team1)
    assert.throws(() => {
      new CompetitionTeam(competition, 'T1', 'team 2')
    }, {
      message: 'Team with ID "T1" already exists in the competition'
    })
  })

  it('testCompetitionTeamName', async () => {
    const competition = new Competition('test competition')
    const team = new CompetitionTeam(competition, 'T1', 'Team 1')

    assert.throws(() => {
      team.setName('')
    }, {
      message: 'Invalid team name: must be between 1 and 1000 characters long'
    })

    let name = 'a'
    for (let i = 0; i < 100; i++) {
      name += '0123456789'
    }
    assert.throws(() => {
      team.setName(name)
    }, {
      message: 'Invalid team name: must be between 1 and 1000 characters long'
    })

    assert.equal(team.getName(), 'Team 1')
    assert(team.setName('Team A') instanceof CompetitionTeam)
    assert.equal(team.getName(), 'Team A')
  })

  it('testCompetitionTeamSetClub', async () => {
    const competition = new Competition('test competition')
    const team = new CompetitionTeam(competition, 'T1', 'Team 1')
    const club = new Club(competition, 'C1', 'Club 1')
    competition.addTeam(team).addClub(club)

    assert.throws(() => {
      team.setClubID('C2')
    }, {
      message: 'No club with ID "C2" exists'
    })

    assert(!team.hasClub())
    team.setClubID('C1')
    assert.equal(team.getClub().getID(), 'C1')
    assert(team.hasClub())
    team.setClubID(null)
    assert(!team.hasClub())
  })

  it('testCompetitionTeamNotes', async () => {
    const competition = new Competition('test competition')
    const team = new CompetitionTeam(competition, 'T1', 'Team 1')

    assert.equal(team.getNotes(), null)
    assert(!team.hasNotes())
    assert(team.setNotes('Some notes on the team') instanceof CompetitionTeam)
    assert.equal(team.getNotes(), 'Some notes on the team')
    assert(team.hasNotes())
    assert(team.setNotes(null) instanceof CompetitionTeam)
    assert.equal(team.getNotes(), null)
    assert(!team.hasNotes())
  })

  it('testCompetitionTeamContacts', async () => {
    const competition = new Competition('test competition')
    const team = new CompetitionTeam(competition, 'T1', 'Team 1')
    const contact = new Contact(team, 'C1', [ContactRole.SECRETARY])

    assert.equal(team.getContacts().length, 0)
    assert(!team.hasContacts())
    assert(!team.hasContactWithID('C1'))

    team.addContact(contact)
    assert.equal(team.getContacts().length, 1)
    assert(team.hasContacts())
    assert(team.hasContactWithID('C1'))
    assert.equal(team.getContactByID('C1').getRoles()[0], ContactRole.SECRETARY)

    assert.throws(() => {
      team.addContact(contact)
    }, {
      message: 'team contacts with duplicate IDs within a team not allowed'
    })
    assert.equal(team.getContacts().length, 1)
    assert(team.hasContacts())
    assert(team.hasContactWithID('C1'))

    team.deleteContact('C1')
    assert.throws(() => {
      team.getContactByID('C1')
    }, {
      message: 'Contact with ID "C1" not found'
    })
    assert.equal(team.getContacts().length, 0)
    assert(!team.hasContacts())
    assert(!team.hasContactWithID('C1'))

    team.deleteContact('C1')
    assert.equal(team.getContacts().length, 0)
    assert(!team.hasContacts())
    assert(!team.hasContactWithID('C1'))
  })

  it('testCompetitionTeamPlayers', async () => {
    const competition = new Competition('test competition')
    const team = new CompetitionTeam(competition, 'T1', 'Team 1')
    const player = new Player(team, 'P1', 'Player 1')

    assert.equal(team.getPlayers().length, 0)
    assert(!team.hasPlayers())
    assert(!team.hasPlayerWithID('P1'))

    team.addPlayer(player)
    assert.equal(team.getPlayers().length, 1)
    assert(team.hasPlayers())
    assert(team.hasPlayerWithID('P1'))
    assert.equal(team.getPlayerByID('P1').getName(), 'Player 1')

    assert.throws(() => {
      team.addPlayer(player)
    }, {
      message: 'team players with duplicate IDs within a team not allowed'
    })
    assert.equal(team.getPlayers().length, 1)
    assert(team.hasPlayers())
    assert(team.hasPlayerWithID('P1'))

    team.deletePlayer('P1')
    assert.throws(() => {
      team.getPlayerByID('P1')
    }, {
      message: 'Player with ID "P1" not found'
    })
    assert.equal(team.getPlayers().length, 0)
    assert(!team.hasPlayers())
    assert(!team.hasPlayerWithID('P1'))

    team.deletePlayer('P1')
    assert.equal(team.getPlayers().length, 0)
    assert(!team.hasPlayers())
    assert(!team.hasPlayerWithID('P1'))
  })

  it('testCompetitionTeamConstructorBadID', async () => {
    const competition = new Competition('test competition')
    assert.throws(() => {
      new CompetitionTeam(competition, '', 'my team')
    }, {
      message: 'Invalid team ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new CompetitionTeam(competition, '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567891', 'my team')
    }, {
      message: 'Invalid team ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new CompetitionTeam(competition, '"id1"', 'my team')
    }, {
      message: 'Invalid team ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new CompetitionTeam(competition, 'id:1', 'my team')
    }, {
      message: 'Invalid team ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new CompetitionTeam(competition, 'id{1', 'my team')
    }, {
      message: 'Invalid team ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new CompetitionTeam(competition, 'id1}', 'my team')
    }, {
      message: 'Invalid team ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new CompetitionTeam(competition, 'id1?', 'my team')
    }, {
      message: 'Invalid team ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new CompetitionTeam(competition, 'id=1', 'my team')
    }, {
      message: 'Invalid team ID: must contain only ASCII printable characters excluding " : { } ? ='
    })
  })
})
