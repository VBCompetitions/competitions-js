import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'


import { Competition, CompetitionTeam, Contact, ContactRole } from '../../src/index.js'

describe('contact', () => {
  it('testContactsNone', async () => {
    const competitionJSON = await readFile(new URL(path.join('contacts', 'contacts.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    const team = competition.getTeam('TM1')
    assert(team instanceof CompetitionTeam)
    assert.equal(team.getContacts().length, 0)
  })

  it('testContactsDefaultSecretary', async () => {
    const competitionJSON = await readFile(new URL(path.join('contacts', 'contacts.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    const team = competition.getTeam('TM2')
    assert(team instanceof CompetitionTeam)

    assert.equal(team.getContacts().length, 1)
    assert.equal(team.getContact('C1').getID(), 'C1')
    assert.equal(team.getContact('C1').getName(), 'Alice Alison')
    assert.deepEqual(team.getContact('C1').getEmails(), ['alice@example.com'])
    assert.deepEqual(team.getContact('C1').getRoles(), [ContactRole.SECRETARY])
  })

  it('testContactsDuplicateID', async () => {
    const competitionJSON = await readFile(new URL(path.join('contacts', 'contacts-duplicate-ids.json'), import.meta.url), { encoding: 'utf8' })
    await assert.rejects(async () => {
      await Competition.loadFromCompetitionJSON(competitionJSON)
    }, {
      message: 'Contact with ID "C1" already exists in the team'
    })
  })

  it('testContactsEach', async () => {
    const competitionJSON = await readFile(new URL(path.join('contacts', 'contacts.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    const team = competition.getTeam('TM3')

    assert.equal(team.getContacts().length, 7)

    const contactC1 = team.getContact('C1')
    assert.equal(contactC1.getID(), 'C1')
    assert.equal(contactC1.getName(), 'Alice Alison')
    assert.deepEqual(contactC1.getEmails(), ['alice@example.com'])
    assert.deepEqual(contactC1.getPhones(), ['01234 567890'])

    assert.deepEqual(contactC1.getRoles(), [ContactRole.SECRETARY, ContactRole.ASSISTANT_COACH])
    assert(contactC1.hasRole(ContactRole.SECRETARY))
    assert(contactC1.hasRole(ContactRole.ASSISTANT_COACH))
    assert(!contactC1.hasRole(ContactRole.TREASURER))
    assert(!contactC1.hasRole(ContactRole.MANAGER))
    assert(!contactC1.hasRole(ContactRole.CAPTAIN))
    assert(!contactC1.hasRole(ContactRole.COACH))
    assert(!contactC1.hasRole(ContactRole.MEDIC))

    assert.deepEqual(team.getContact('C2').getRoles(), [ContactRole.TREASURER])
    assert.deepEqual(team.getContact('C3').getRoles(), [ContactRole.MANAGER])
    assert.deepEqual(team.getContact('C4').getRoles(), [ContactRole.CAPTAIN])
    assert.deepEqual(team.getContact('C5').getRoles(), [ContactRole.COACH])
    assert.deepEqual(team.getContact('C6').getRoles(), [ContactRole.ASSISTANT_COACH])
    assert.deepEqual(team.getContact('C7').getRoles(), [ContactRole.MEDIC])
  })

  it('testContactsGetByIDOutOfBounds', async () => {
    const competitionJSON = await readFile(new URL(path.join('contacts', 'contacts.json'), import.meta.url), { encoding: 'utf8' })
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)

    assert.throws(() => {
      competition.getTeam('TM1').getContact('NO-SUCH-TEAM')
    }, {
      message: 'Contact with ID "NO-SUCH-TEAM" not found'
    })
  })

  it('testContactSetName', async () => {
    const competition = new Competition('test competition')
    const team = new CompetitionTeam(competition, 'T1', 'Team 1')
    const contact = new Contact(team, 'C1', [ContactRole.SECRETARY])
    assert.equal(contact.getTeam().getID(), 'T1')

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
    const team = new CompetitionTeam(competition, 'T1', 'Team 1')
    const contact = new Contact(team, 'C1', [ContactRole.SECRETARY])

    contact.addEmail('alice@example.com').addEmail('alice@example.com').addEmail('alice@example.com')
    assert.equal(contact.getEmails().length, 1)

    contact.addPhone('01234 567890').addPhone('01234 567890').addPhone('01234 567890')
    assert.equal(contact.getPhones().length, 1)

    contact.addRole(ContactRole.SECRETARY).addRole(ContactRole.SECRETARY)
    assert.equal(contact.getRoles().length, 1)
  })

  it('testContactSettersAndAdders', () => {
    const competition = new Competition('test competition')
    const team = new CompetitionTeam(competition, 'T1', 'Team 1')
    const contact = new Contact(team, 'C1', [ContactRole.SECRETARY])

    assert.equal(contact.getRoles().length, 1)
    contact.setRoles([ContactRole.CAPTAIN, ContactRole.COACH, ContactRole.TREASURER, ContactRole.SECRETARY])
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
  })

  it('testContactConstructorBadID', async () => {
    const competition = new Competition('test competition')
    const team = new CompetitionTeam(competition, 'T1', 'Team 1')
    assert.throws(() => {
      new Contact(team, '', [ContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new Contact(team, '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567891', [ContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must be between 1 and 100 characters long'
    })

    assert.throws(() => {
      new Contact(team, '"id1"', [ContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Contact(team, 'id:1', [ContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Contact(team, 'id{1', [ContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Contact(team, 'id1}', [ContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Contact(team, 'id1?', [ContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })

    assert.throws(() => {
      new Contact(team, 'id=1', [ContactRole.SECRETARY])
    }, {
      message: 'Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? ='
    })
  })
})
