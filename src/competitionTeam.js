import Contact from './contact.js'
import ContactRole from './contactRole.js'

class CompetitionTeam {
  static UNKNOWN_TEAM_ID = 'UNKNOWN'
  static UNKNOWN_TEAM_NAME = 'UNKNOWN'

  /**
   * A unique ID for the team, e.g. 'TM1'. This is used in the rest of the instance document to specify the team
   * @type {string}
   * @private
   */
  #id

  /**
   * The name for the team
   * @type {string}
   * @private
   */
  #name

  /**
   * The contacts for the Team
   * @type {array}
   * @private
   */
  #contacts

  /**
   * The club this team is in
   * @type {Club|null}
   * @private
   */
  #club

  /**
   * Free form string to add notes about a team.  This can be used for arbitrary content that various implementations can use
   * @type {string|null}
   * @private
   */
  #notes

  /**
   * The Competition this team is in
   * @type {Competition}
   * @private
   */
  #competition

  /**
   * A Lookup table from contact IDs to the contact
   * @type {object}
   * @private
   */
  #contactLookup

  /**
   * Contains the team data of a competition, creating any metadata needed
   *
   * @param {Competition} competition A link back to the Competition this Team is in
   * @param {string} id The unique ID for the team
   * @param {string} name The name for the team
   */
  constructor (competition, id, name) {
    if (id.length > 100 || id.length < 1) {
      throw new Error('Invalid team ID: must be between 1 and 100 characters long')
    }

    if (!/^((?![":{}?=])[\x20-\x7F])+$/.test(id)) {
      throw new Error('Invalid team ID: must contain only ASCII printable characters excluding " : { } ? =')
    }

    if (competition.hasTeam(id)) {
      throw new Error(`Team with ID "${id}" already exists in the competition`)
    }

    this.#competition = competition
    this.#id = id
    this.setName(name)
    this.#contacts = []
    this.#club = null
    this.#notes = null
    this.#contactLookup = {}
  }

  /**
   * Load team data from an object
   *
   * @param {object} teamData The data defining this Team
   *
   * @returns {CompetitionTeam}
   */
  loadFromData (teamData) {
    if (Object.hasOwn(teamData, 'contacts')) {
      teamData.contacts.forEach(contactData => {
        const roles = []
        contactData.roles.forEach(contactRole => {
          switch (contactRole) {
            case ContactRole.SECRETARY:
              roles.push(ContactRole.SECRETARY)
              break
            case ContactRole.TREASURER:
              roles.push(ContactRole.TREASURER)
              break
            case ContactRole.MANAGER:
              roles.push(ContactRole.MANAGER)
              break
            case ContactRole.CAPTAIN:
              roles.push(ContactRole.CAPTAIN)
              break
            case ContactRole.COACH:
              roles.push(ContactRole.COACH)
              break
            case ContactRole.ASSISTANT_COACH:
              roles.push(ContactRole.ASSISTANT_COACH)
              break
            case ContactRole.MEDIC:
              roles.push(ContactRole.MEDIC)
              break
          }
        })
        this.addContact((new Contact(this, contactData.id, roles)).loadFromData(contactData))
      })
    }

    if (Object.hasOwn(teamData, 'club')) {
      this.setClubID(teamData.club)
      this.getClub().addTeam(this)
    }

    if (Object.hasOwn(teamData, 'notes')) {
      this.#notes = teamData.notes
    }

    return this
  }

  /**
   * Return the list of team definition in a form suitable for serializing
   *
   * @returns {Object}
   */
  serialize () {
    const team = {
      id: this.#id,
      name: this.#name
    }
    if (this.#contacts.length > 0) {
      team.contacts = []
      this.#contacts.forEach(contacts => {
        team.contacts.push(contacts.serialize())
      })
    }
    if (this.#club !== null) {
      team.club = this.#club.getID()
    }
    if (this.#notes !== null) {
      team.notes = this.#notes
    }

    return team
  }

  /**
   * Get the competition this team is in
   *
   * @returns {Competition}
   */
  getCompetition () {
    return this.#competition
  }

  /**
   * Get the ID for this team
   *
   * @returns {string} The ID for this team
   */
  getID () {
    return this.#id
  }

  /**
   * Set the name for this team
   *
   * @param {string} name The name for this team
   *
   * @returns {CompetitionTeam} This CompetitionTeam
   */
  setName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid team name: must be between 1 and 1000 characters long')
    }
    this.#name = name
    return this
  }

  /**
   * Get the name for this team
   *
   * @returns {string} The name for this team
   */
  getName () {
    return this.#name
  }

  /**
   * Set the club ID for this team
   *
   * @param {string|null} id The ID of the club this team is in
   *
   * @returns CompetitionTeam This competition team
   */
  setClubID (id) {
    if (id === null) {
      if (this.#club.hasTeam(this.#id)) {
        this.#club.deleteTeam(this.#id)
      }
      this.#club = null
      return this
    }

    if (this.#club !== null && id === this.#club.getID()) {
      return this
    }

    if (!this.#competition.hasClub(id)) {
      throw new Error(`No club with ID "${id}" exists`)
    }

    this.#club = this.#competition.getClub(id)
    this.#club.addTeam(this)

    return this
  }

  /**
   * Get the club for this team
   *
   * @returns {Club|null} The club this team is in
   */
  getClub () {
    return this.#club
  }

  /**
   * Does this team have a club that it belongs to
   *
   * @returns {bool} True if the team belongs to a club, otherwise false
   */
  hasClub () {
    return this.#club !== null
  }

  /**
   * Get the notes for this team
   *
   * @returns {string|null} the notes for this team
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Set the notes for this team
   *
   * @param {string|nul} notes the notes for this team
   *
   * @returns {CompetitionTeam} This competition team
   */
  setNotes (notes) {
    this.#notes = notes
    return this
  }

  /**
   * Does this team have any notes attached
   *
   * @returns {bool} True if the team has notes, otherwise false
   */
  hasNotes () {
    return this.#notes !== null
  }

  /**
   * Add a contact to this team
   *
   * @param {Contact} contact The contact to add to this team
   *
   * @returns {CompetitionTeam} This CompetitionTeam instance
   *
   * @throws {Error} If a contact with a duplicate ID within the team is added
   */
  addContact (contact) {
    if (this.hasContact(contact.getID())) {
      throw new Error('team contacts with duplicate IDs within a team not allowed')
    }
    this.#contacts.push(contact)
    this.#contactLookup[contact.getID()] = contact
    return this
  }

  /**
   * Returns an array of Contacts for this team
   *
   * @returns {array<Contact>|null} The contacts for this team
   */
  getContacts () {
    return this.#contacts
  }

  /**
   * Returns the Contact with the requested ID, or throws if the ID is not found
   *
   * @param {string} id The ID of the contact in this team to return
   *
   * @throws {Error} If a Contact with the requested ID was not found
   *
   * @returns {Contact} The requested contact for this team
   */
  getContact (id) {
    if (!Object.hasOwn(this.#contactLookup, id)) {
      throw new Error(`Contact with ID "${id}" not found`)
    }
    return this.#contactLookup[id]
  }

  /**
   * Check if a contact with the given ID exists in this team
   *
   * @param {string} id The ID of the contact to check
   *
   * @returns {bool} True if the contact exists, otherwise false
   */
  hasContact (id) {
    return Object.hasOwn(this.#contactLookup, id)
  }

  /**
   * Check if this team has any contacts
   *
   * @returns bool True if the team has contacts, otherwise false
   */
  hasContacts () {
    return this.#contacts.length > 0
  }

  /**
   * Delete a contact from the team
   *
   * @param {string} id The ID of the contact to delete
   *
   * @returns {CompetitionTeam} This CompetitionTeam instance
   */
  deleteContact (id) {
    if (!this.hasContact(id)) {
      return this
    }

    delete this.#contactLookup[id]
    this.#contacts = this.#contacts.filter(el => el.getID() !== id)
    return this
  }

  /**
   * Get the players for this team
   *
   * @returns {array<Player>} The players for this team
   */
  getPlayers () {
    return this.#competition.getPlayersInTeam(this.#id)
  }

  /**
   * Check if a player with the given ID exists in this team
   *
   * @param {string} id The ID of the player to check
   *
   * @returns {bool} True if the player exists, otherwise false
   */
  hasPlayer (id) {
    return this.#competition.hasPlayerInTeam(id, this.#id)
  }

  /**
   * Check if this team has any players
   *
   * @returns {bool} True if the team has players, otherwise false
   */
  hasPlayers () {
    return this.#competition.hasPlayersInTeam(this.#id)
  }
}

export default CompetitionTeam
