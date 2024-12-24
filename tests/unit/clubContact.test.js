import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'


import { Club, ClubContact, ClubContactRole, Competition, CompetitionTeam } from '../../src/index.js'

describe('team contact', () => {
  it('testContactsNone', async () => {
    const competitionJSON = await readFile(new URL(path.join('clubcontacts', 'no-contacts.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const club = competition.getClub('CL1')

    assert.equal(club.getContacts().length, 0)
    assert(!club.hasContacts())
  })

  it('testContactsDuplicateID', async () => {
    const competitionJSON = await readFile(new URL(path.join('clubcontacts', 'contacts-duplicate-ids.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Contact with ID "C1" already exists in the club'
    })
  })

  it('testContactsEach', async () => {
    const competitionJSON = await readFile(new URL(path.join('clubcontacts', 'contacts.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const club = competition.getClub('CL1')

    assert.equal(club.getContacts().length, 7)

    const contactC1 = club.getContact('C1')
    assert.equal(contactC1.getID(), 'C1')
    assert.equal(contactC1.getName(), 'Alice Alison')
    assert.deepEqual(contactC1.getEmails(), ['alice@example.com'])
    assert.deepEqual(contactC1.getPhones(), ['01234 567890'])
    assert.equal(contactC1.getNotes(), 'Alice is both the club chair and secretary')

    assert.deepEqual(contactC1.getRoles(), [ClubContactRole.CHAIR, ClubContactRole.SECRETARY])
    assert(contactC1.hasRole(ClubContactRole.CHAIR))
    assert(contactC1.hasRole(ClubContactRole.SECRETARY))
    assert(!contactC1.hasRole(ClubContactRole.VICE))
    assert(!contactC1.hasRole(ClubContactRole.TREASURER))
    assert(!contactC1.hasRole(ClubContactRole.WELFARE))
    assert(!contactC1.hasRole(ClubContactRole.COMMUNICATIONS))
    assert(!contactC1.hasRole(ClubContactRole.MARKETING))
    assert(!contactC1.hasRole(ClubContactRole.VOLUNTEER))
    assert(!contactC1.hasRole(ClubContactRole.LOGISTICS))
    assert(!contactC1.hasRole(ClubContactRole.COACHING))

    assert.deepEqual(club.getContact('C2').getRoles(), [ClubContactRole.TREASURER])
    assert.deepEqual(club.getContact('C3').getRoles(), [ClubContactRole.VICE, ClubContactRole.LOGISTICS])
    assert.deepEqual(club.getContact('C4').getRoles(), [ClubContactRole.WELFARE])
    assert.deepEqual(club.getContact('C5').getRoles(), [ClubContactRole.COMMUNICATIONS, ClubContactRole.MARKETING])
    assert.deepEqual(club.getContact('C6').getRoles(), [ClubContactRole.VOLUNTEER])
    assert.deepEqual(club.getContact('C7').getRoles(), [ClubContactRole.COACHING])
  })

  it('testContactsGetByIDOutOfBounds', async () => {
    const competitionJSON = await readFile(new URL(path.join('clubcontacts', 'contacts.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const club = competition.getClub('CL1')

    assert.throws(() => {
      club.getContact('NO-SUCH-CONTACT')
    }, {
      message: 'Contact with ID "NO-SUCH-CONTACT" not found'
    })
  })

  it('testContactSetName', async () => {
    const competition = new Competition('test competition')
    const club = new Club(competition, 'CL1', 'Some Club')
    const contact = new ClubContact(club, 'C1', [ClubContactRole.SECRETARY])
    assert.equal(contact.getClub().getID(), 'CL1')

    assert.throws(() => {
      contact.setName('')
    }, {
      message: 'Invalid contact name: must be between 1 and 1000 characters long'
    })
    assert.equal(contact.getName(), null)

    let name = 'a'
    for (let i = 0; i < 100; i++) {
      name += '0123456789'
    }
    assert.throws(() => {
      contact.setName(name)
    }, {
      message: 'Invalid contact name: must be between 1 and 1000 characters long'
    })
    assert.equal(contact.getName(), null)

    contact.setName('Alice Alison')
    assert.equal(contact.getName(), 'Alice Alison')
  })

  it('testContactSetSpotsDuplicates', async () => {
    const competition = new Competition('test competition')
    const club = new Club(competition, 'CL1', 'Some Club')
    const contact = new ClubContact(club, 'C1', [ClubContactRole.SECRETARY])

    contact.addEmail('alice@example.com').addEmail('alice@example.com').addEmail('alice@example.com')
    assert.equal(contact.getEmails().length, 1)

    contact.addPhone('01234 567890').addPhone('01234 567890').addPhone('01234 567890')
    assert.equal(contact.getPhones().length, 1)

    contact.addRole(ClubContactRole.SECRETARY).addRole(ClubContactRole.SECRETARY)
    assert.equal(contact.getRoles().length, 1)
  })

  it('testContactSettersAndAdders', () => {
    const competition = new Competition('test competition')
    const club = new Club(competition, 'CL1', 'Some Club')

    assert.throws(() => {
      const team = new CompetitionTeam(competition, 'T1', 'Team 1')
      new ClubContact(team, 'C1', [ClubContactRole.SECRETARY])
    }, {
      message: 'club contacts can only be attached to clubs, CompetitionTeam given'
    })

    const contact = new ClubContact(club, 'C1', [ClubContactRole.SECRETARY])

    assert.throws(() => {
      contact.addRole('bad role')
    }, {
      message: 'Error adding the role due to invalid role: bad role'
    })

    assert.equal(contact.getRoles().length, 1)
    contact.setRoles([ClubContactRole.CHAIR, ClubContactRole.COACHING, ClubContactRole.TREASURER, ClubContactRole.SECRETARY])
    assert.equal(contact.getRoles().length, 4)

    assert.throws(() => {
      contact.setRoles([])
    }, {
      message: 'Error setting the roles to an empty list as the Contact must have at least one role'
    })

    assert.throws(() => {
      contact.setRoles(['foo'])
    }, {
      message: 'Error setting the roles due to invalid role: foo'
    })

    assert.equal(contact.getEmails().length, 0)
    // Include a duplicate
    contact.setEmails(['alice1@example.com', 'alice2@example.com', 'alice2@example.com'])
    assert.equal(contact.getEmails().length, 2)
    contact.addEmail('alice3@example.com')
    assert.equal(contact.getEmails().length, 3)
    assert.throws(() => {
      contact.addEmail('fo')
    }, {
      message: 'Invalid contact email address: must be at least 3 characters long'
    })

    contact.setEmails(null)
    assert.equal(contact.getEmails().length, 0)

    assert.throws(() => {
      contact.setEmails(['fo', 'alice1@example.com'])
    }, {
      message: 'Invalid contact email address: must be at least 3 characters long'
    })

    assert.throws(() => {
      contact.setEmails(['alice1@example.com', 'fo'])
    }, {
      message: 'Invalid contact email address: must be at least 3 characters long'
    })

    assert.equal(contact.getPhones().length, 0)
    // Include a duplicate
    contact.setPhones(['01234 567890', '01234 567891', '01234 567891'])
    assert.equal(contact.getPhones().length, 2)
    contact.addPhone('01234 567892')
    assert.equal(contact.getPhones().length, 3)

    assert.throws(() => {
      contact.addPhone('')
    }, {
      message: 'Invalid contact phone number: must be between 1 and 50 characters long'
    })

    assert.throws(() => {
      contact.addPhone('012345678901234567890123456789012345678901234567890123456789')
    }, {
      message: 'Invalid contact phone number: must be between 1 and 50 characters long'
    })

    contact.setPhones(null)
    assert.equal(contact.getPhones().length, 0)

    assert.throws(() => {
      contact.setPhones(['', '01234 567890'])
    }, {
      message: 'Invalid contact phone number: must be between 1 and 50 characters long'
    })

    assert.throws(() => {
      contact.setPhones(['01234 567890', ''])
    }, {
      message: 'Invalid contact phone number: must be between 1 and 50 characters long'
    })

    assert.throws(() => {
      contact.setPhones(['012345678901234567890123456789012345678901234567890123456789', '01234 567890'])
    }, {
      message: 'Invalid contact phone number: must be between 1 and 50 characters long'
    })

    assert.throws(() => {
      contact.setPhones(['01234 567890', '012345678901234567890123456789012345678901234567890123456789'])
    }, {
      message: 'Invalid contact phone number: must be between 1 and 50 characters long'
    })

    assert.equal(contact.getNotes(), null)
    contact.setNotes('some contact notes')
    assert.equal(contact.getNotes(), 'some contact notes')
    contact.setNotes(null)
    assert.equal(contact.getNotes(), null)
  })

  it('testContactConstructorBadID', async () => {
    const competition = new Competition('test competition')
    const club = new Club(competition, 'CL1', 'Some Club')
    assert.throws(() => {
      new ClubContact(club, '', [ClubContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new ClubContact(club, '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567891', [ClubContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new ClubContact(club, '"id1"', [ClubContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new ClubContact(club, 'id:1', [ClubContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new ClubContact(club, 'id{1', [ClubContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new ClubContact(club, 'id1}', [ClubContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new ClubContact(club, 'id1?', [ClubContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new ClubContact(club, 'id=1', [ClubContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })
  })
})
