import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'


import { Competition, CompetitionTeam, CompetitionContact, CompetitionContactRole } from '../../src/index.js'

describe('team contact', () => {
  it('testContactsNone', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitioncontacts', 'no-contacts.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    assert.equal(competition.getContacts().length, 0)
    assert(!competition.hasContacts())
  })

  it('testContactsDuplicateID', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitioncontacts', 'contacts-duplicate-ids.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Contact with ID "C1" already exists in the competition'
    })
  })

  it('testContactsEach', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitioncontacts', 'contacts.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    assert.equal(competition.getContacts().length, 7)

    const contactC1 = competition.getContact('C1')
    assert.equal(contactC1.getID(), 'C1')
    assert.equal(contactC1.getName(), 'Alice Alison')
    assert.deepEqual(contactC1.getEmails(), ['alice@example.com'])
    assert.deepEqual(contactC1.getPhones(), ['01234 567890'])
    assert.equal(contactC1.getNotes(), 'We should find a separate secretary so Alice doesn\'t get overloaded')

    assert.deepEqual(contactC1.getRoles(), [CompetitionContactRole.DIRECTOR, CompetitionContactRole.FIXTURES, CompetitionContactRole.SECRETARY])
    assert(contactC1.hasRole(CompetitionContactRole.DIRECTOR))
    assert(contactC1.hasRole(CompetitionContactRole.FIXTURES))
    assert(contactC1.hasRole(CompetitionContactRole.SECRETARY))
    assert(!contactC1.hasRole(CompetitionContactRole.LOGISTICS))
    assert(!contactC1.hasRole(CompetitionContactRole.COMMUNICATIONS))
    assert(!contactC1.hasRole(CompetitionContactRole.OFFICIALS))
    assert(!contactC1.hasRole(CompetitionContactRole.RESULTS))
    assert(!contactC1.hasRole(CompetitionContactRole.MARKETING))
    assert(!contactC1.hasRole(CompetitionContactRole.SAFETY))
    assert(!contactC1.hasRole(CompetitionContactRole.VOLUNTEER))
    assert(!contactC1.hasRole(CompetitionContactRole.WELFARE))
    assert(!contactC1.hasRole(CompetitionContactRole.HOSPITALITY))
    assert(!contactC1.hasRole(CompetitionContactRole.CEREMONIES))
    assert(!contactC1.hasRole(CompetitionContactRole.TREASURER))
    assert(!contactC1.hasRole(CompetitionContactRole.MEDIC))

    assert.deepEqual(competition.getContact('C2').getRoles(), [CompetitionContactRole.LOGISTICS, CompetitionContactRole.TREASURER])
    assert.deepEqual(competition.getContact('C3').getRoles(), [CompetitionContactRole.COMMUNICATIONS])
    assert.deepEqual(competition.getContact('C4').getRoles(), [CompetitionContactRole.OFFICIALS, CompetitionContactRole.RESULTS])
    assert.deepEqual(competition.getContact('C5').getRoles(), [CompetitionContactRole.MARKETING, CompetitionContactRole.HOSPITALITY, CompetitionContactRole.CEREMONIES])
    assert.deepEqual(competition.getContact('C6').getRoles(), [CompetitionContactRole.SAFETY, CompetitionContactRole.VOLUNTEER, CompetitionContactRole.WELFARE])
    assert.deepEqual(competition.getContact('C7').getRoles(), [CompetitionContactRole.MEDIC])
  })

  it('testContactsGetByIDOutOfBounds', async () => {
    const competitionJSON = await readFile(new URL(path.join('competitioncontacts', 'contacts.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    assert.throws(() => {
      competition.getContact('NO-SUCH-CONTACT')
    }, {
      message: 'Contact with ID "NO-SUCH-CONTACT" not found'
    })
  })

  it('testContactSetName', async () => {
    const competition = new Competition('test competition')
    const contact = new CompetitionContact(competition, 'C1', [CompetitionContactRole.SECRETARY])
    assert.equal(contact.getCompetition().getName(), competition.getName())

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
    const contact = new CompetitionContact(competition, 'C1', [CompetitionContactRole.SECRETARY])

    contact.addEmail('alice@example.com').addEmail('alice@example.com').addEmail('alice@example.com')
    assert.equal(contact.getEmails().length, 1)

    contact.addPhone('01234 567890').addPhone('01234 567890').addPhone('01234 567890')
    assert.equal(contact.getPhones().length, 1)

    contact.addRole(CompetitionContactRole.SECRETARY).addRole(CompetitionContactRole.SECRETARY)
    assert.equal(contact.getRoles().length, 1)
  })

  it('testContactSettersAndAdders', () => {
    const competition = new Competition('test competition')

    assert.throws(() => {
      const team = new CompetitionTeam(competition, 'T1', 'Team 1')
      new CompetitionContact(team, 'C1', [CompetitionContactRole.SECRETARY])
    }, {
      message: 'competition contacts can only be attached to competitions, CompetitionTeam given'
    })

    const contact = new CompetitionContact(competition, 'C1', [CompetitionContactRole.SECRETARY])

    assert.throws(() => {
      contact.addRole('bad role')
    }, {
      message: 'Error adding the role due to invalid role: bad role'
    })

    assert.equal(contact.getRoles().length, 1)
    contact.setRoles([CompetitionContactRole.DIRECTOR, CompetitionContactRole.FIXTURES, CompetitionContactRole.TREASURER, CompetitionContactRole.SECRETARY])
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
    assert.throws(() => {
      new CompetitionContact(competition, '', [CompetitionContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new CompetitionContact(competition, '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567891', [CompetitionContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new CompetitionContact(competition, '"id1"', [CompetitionContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new CompetitionContact(competition, 'id:1', [CompetitionContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new CompetitionContact(competition, 'id{1', [CompetitionContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new CompetitionContact(competition, 'id1}', [CompetitionContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new CompetitionContact(competition, 'id1?', [CompetitionContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new CompetitionContact(competition, 'id=1', [CompetitionContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })
  })
})
