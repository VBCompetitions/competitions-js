import Contact from './contact.js'
import ContactRole from './contactRole.js'
import Player from './player.js'

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
   * A list of players for a team
   * @type {array}
   * @private
   */
  #players

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
   * A Lookup table from player IDs to the contact
   * @type {object}
   * @private
   */
  #playerLookup

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

    if (competition.hasTeamWithID(id)) {
      throw new Error(`Team with ID "${id}" already exists in the competition`)
    }

    this.#competition = competition
    this.#id = id
    this.setName(name)
    this.#contacts = []
    this.#players = []
    this.#club = null
    this.#notes = null
    this.#contactLookup = {}
    this.#playerLookup = {}
  }

  /**
   * Load team data from an object
   *
   * @param {object} teamData The data defining this Team
   *
   * @return {CompetitionTeam}
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

    if (Object.hasOwn(teamData, 'players')) {
      teamData.players.forEach(playerData => {
        this.addPlayer((new Player(this, playerData.id, playerData.name)).loadFromData(playerData))
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
   * @return {Object}
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
    if (this.#players.length > 0) {
      team.players = []
      this.#players.forEach(players => {
        team.players.push(players.serialize())
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
   * @return {Competition}
   */
  getCompetition () {
    return this.#competition
  }

  /**
   * Get the ID for this team
   *
   * @return {string} The ID for this team
   */
  getID () {
    return this.#id
  }

  /**
   * Set the name for this team
   *
   * @param {string} name The name for this team
   *
   * @return {CompetitionTeam} This CompetitionTeam
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
   * @return {string} The name for this team
   */
  getName () {
    return this.#name
  }

  /**
   * Set the club ID for this team
   *
   * @param {string|null} clubID The ID of the club this team is in
   *
   * @return CompetitionTeam This competition team
   */
  setClubID (clubID) {
    if (clubID === null) {
      if (this.#club.hasTeamWithID(this.#id)) {
        this.#club.deleteTeam(this.#id)
      }
      this.#club = null
      return this
    }

    if (this.#club !== null && clubID === this.#club.getID()) {
      return this
    }

    if (!this.#competition.hasClubWithID(clubID)) {
      throw new Error(`No club with ID "${clubID}" exists`)
    }

    this.#club = this.#competition.getClubByID(clubID)
    this.#club.addTeam(this)

    return this
  }

  /**
   * Get the club for this team
   *
   * @return {Club|null} The club this team is in
   */
  getClub () {
    return this.#club
  }

  /**
   * Does this team have a club that it belongs to
   *
   * @return {bool} True if the team belongs to a club, otherwise false
   */
  hasClub () {
    return this.#club !== null
  }

  /**
   * Get the notes for this team
   *
   * @return {string|null} the notes for this team
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Set the notes for this team
   *
   * @param {string|nul} notes the notes for this team
   *
   * @return {CompetitionTeam} This competition team
   */
  setNotes (notes) {
    this.#notes = notes
    return this
  }

  /**
   * Does this team have any notes attached
   *
   * @return {bool} True if the team has notes, otherwise false
   */
  hasNotes () {
    return this.#notes !== null
  }

  /**
   * Add a contact to this team
   *
   * @param {Contact} contact The contact to add to this team
   *
   * @return {CompetitionTeam} This CompetitionTeam instance
   *
   * @throws {Error} If a contact with a duplicate ID within the team is added
   */
  addContact (contact) {
    if (this.hasContactWithID(contact.getID())) {
      throw new Error('team contacts with duplicate IDs within a team not allowed')
    }
    this.#contacts.push(contact)
    this.#contactLookup[contact.getID()] = contact
    return this
  }

  /**
   * Returns an array of Contacts for this team
   *
   * @return {array<Contact>|null} The contacts for this team
   */
  getContacts () {
    return this.#contacts
  }

  /**
   * Returns the Contact with the requested ID, or throws if the ID is not found
   *
   * @param {string} contactID The ID of the contact in this team to return
   *
   * @throws {Error} If a Contact with the requested ID was not found
   *
   * @return {Contact} The requested contact for this team
   */
  getContactByID (contactID) {
    if (!Object.hasOwn(this.#contactLookup, contactID)) {
      throw new Error(`Contact with ID "${contactID}" not found`)
    }
    return this.#contactLookup[contactID]
  }

  /**
   * Check if a contact with the given ID exists in this team
   *
   * @param {string} contactID The ID of the contact to check
   *
   * @return {bool} True if the contact exists, otherwise false
   */
  hasContactWithID (contactID) {
    return Object.hasOwn(this.#contactLookup, contactID)
  }

  /**
   * Check if this team has any contacts
   *
   * @return bool True if the team has contacts, otherwise false
   */
  hasContacts () {
    return this.#contacts.length > 0
  }

  /**
   * Delete a contact from the team
   *
   * @param {string} contactID The ID of the contact to delete
   *
   * @return {CompetitionTeam} This CompetitionTeam instance
   */
  deleteContact (contactID) {
    if (!this.hasContactWithID(contactID)) {
      return this
    }

    delete this.#contactLookup[contactID]
    this.#contacts = this.#contacts.filter(el => el.getID() !== contactID)
    return this
  }

  /**
   * Add a player to this team
   *
   * @param {Player} player The player to add to this team
   *
   * @return {CompetitionTeam} This CompetitionTeam instance
   *
   * @throws {Error} If a player with a duplicate ID within the team is added
   */
  addPlayer (player) {
    if (this.hasPlayerWithID(player.getID())) {
      throw new Error('team players with duplicate IDs within a team not allowed')
    }

    this.#players.push(player)
    this.#playerLookup[player.getID()] = player
    return this
  }

  /**
   * Get the players for this team
   *
   * @return {array<Player>|null} The players for this team
   */
  getPlayers () {
    return this.#players
  }

  /**
   * Returns the Player with the requested ID, or throws if the ID is not found
   *
   * @param {string} playerID The ID of the player in this team to return
   *
   * @throws {Error} If a Player with the requested ID was not found
   *
   * @return {Player} The requested player for this team
   */
  getPlayerByID (playerID) {
    if (!Object.hasOwn(this.#playerLookup, playerID)) {
      throw new Error(`Player with ID "${playerID}" not found`)
    }
    return this.#playerLookup[playerID]
  }

  /**
   * Check if a player with the given ID exists in this team
   *
   * @param {string} playerID The ID of the player to check
   *
   * @return {bool} True if the player exists, otherwise false
   */
  hasPlayerWithID (playerID) {
    return Object.hasOwn(this.#playerLookup, playerID)
  }

  /**
   * Check if this team has any players
   *
   * @return {bool} True if the team has players, otherwise false
   */
  hasPlayers () {
    return this.#players.length > 0
  }

  /**
   * Delete a player from the team
   *
   * @param {string} playerID The ID of the player to delete
   *
   * @return {CompetitionTeam} This CompetitionTeam instance
   */
  deletePlayer (playerID) {
    if (!this.hasPlayerWithID(playerID)) {
      return this
    }

    delete this.#playerLookup[playerID]
    this.#players = this.#players.filter(el => el.getID() !== playerID)
    return this
  }
}

export default CompetitionTeam
