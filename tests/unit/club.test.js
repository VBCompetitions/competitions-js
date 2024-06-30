import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Club, Competition } from '../../src/index.js'

describe('club', () => {
  it('testClubNone', async () => {
    const competitionJSON = await readFile(new URL(path.join('club', 'competition-with-clubs.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const team = competition.getTeam('TM7')
    assert.equal(team.getClub(), null, 'Team 7 should have no club defined')
  })

  it('testCompetitionWithClubsNoSuchID', async () => {
    const competitionJSON = await readFile(new URL(path.join('club', 'competition-with-clubs.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    assert.throws(() => {
      competition.getClub('Foo')
    },
    {
      message: 'Club with ID "Foo" not found'
    })
  })

  it('testCompetitionWithClubs', async () => {
    const competitionJSON = await readFile(new URL(path.join('club', 'competition-with-clubs.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    assert(competition.hasClubs())

    assert.equal(competition.getTeam('TM1').getClub().getID(), 'SOU')
    assert.equal(competition.getTeam('TM2').getClub().getID(), 'NOR')
    assert.equal(competition.getTeam('TM7').getClub(), null)

    assert.equal(competition.getTeam('TM1').getClub().getNotes(), 'This is a club')

    assert.equal(competition.getClub('SOU').getName(), 'Southampton')
    assert.equal(competition.getClub('NOR').getName(), 'Northampton')

    const clubs = competition.getClubs()
    assert.equal(clubs.length, 2)
    assert.equal(clubs[0].getName(), 'Southampton')
    assert.equal(clubs[1].getName(), 'Northampton')

    assert.equal(clubs[0].getCompetition().getName(), 'competition-with-clubs')
  })

  it('testClubSettersGetters', async () => {
    const competitionJSON = await readFile(new URL(path.join('club', 'competition-with-clubs.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const club = competition.getClub('SOU')

    assert.equal(club.getName(), 'Southampton')
    assert.equal(club.getNotes(), 'This is a club')
    assert(club.hasNotes())
    assert.equal(club.getTeams().length, 3)
    assert.equal(club.getTeams()[0].getName(), 'Alice VC')
    assert(club.hasTeam('TM1'))
    assert(!club.hasTeam('TM2'))

    club.setName('New Southampton')
    club.setNotes('This is the club to be')

    assert.equal(club.getName(), 'New Southampton')
    assert.equal(club.getNotes(), 'This is the club to be')

    assert.throws(() => {
      club.setName('')
    }, {
      message: 'Invalid club name: must be between 1 and 1000 characters long'
    })

    let name = 'a'
    for (let i=0; i < 100; i++) {
      name += '0123456789'
    }
    assert.throws(() => {
      club.setName(name)
    }, {
      message: 'Invalid club name: must be between 1 and 1000 characters long'
    })
  })

  it('testClubDelete', async () => {
    const competitionJSON = await readFile(new URL(path.join('club', 'competition-with-clubs.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const club = competition.getClub('SOU')
    const team = club.getTeams()[0]

    assert.equal(club.getName(), 'Southampton')
    assert.equal(club.getNotes(), 'This is a club')
    assert.equal(club.getTeams().length, 3)
    assert.equal(team.getName(), 'Alice VC')
    assert.equal(team.getClub().getID(), 'SOU')
    assert(club.hasTeam('TM1'))
    assert(!club.hasTeam('TM2'))

    let clubReturned = club.deleteTeam('TM1')
    assert(clubReturned instanceof Club)
    assert.equal(clubReturned.getID(), 'SOU')
    assert.equal(club.getTeams().length, 2)
    assert.equal(team.getClub(), null)
    assert.equal(club.getTeams()[0].getName(), 'Charlie VC')

    clubReturned = club.deleteTeam('TM1')
    assert.equal(club.getTeams().length, 2)
    assert.equal(club.getTeams()[0].getName(), 'Charlie VC')
  })

  it('testClubConstructorBadID', async () => {
    const competition = new Competition('test competition')

    assert.throws(() => {
      new Club(competition, '', 'my club')
    }, {
      message: 'Invalid club ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new Club(competition, '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567891', 'my club')
    }, {
      message: 'Invalid club ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new Club(competition, '"id1"', 'my club')
    }, {
      message: 'Invalid club ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Club(competition, 'id:1', 'my club')
    }, {
      message: 'Invalid club ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Club(competition, 'id{1', 'my club')
    }, {
      message: 'Invalid club ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Club(competition, 'id1}', 'my club')
    }, {
      message: 'Invalid club ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Club(competition, 'id1?', 'my club')
    }, {
      message: 'Invalid club ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Club(competition, 'id=1', 'my club')
    }, {
      message: 'Invalid club ID: must contain only ASCII printable characters excluding " : { } ? ='
    })
  })
})
