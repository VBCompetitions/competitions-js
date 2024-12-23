import ClubContact from './clubContact.js'

class Club {
  /**
   * A unique ID for the club, e.g. 'CLUB1'.  This must be unique within the competition.  It must only contain letters (upper or lowercase), and numbers
   * @type {string}
   * @private
   */
  #id

  /**
   * The name for the club
   * @type {string}
   * @private
   */
  #name

  /**
   * The contacts for the club
   * @type {array}
   * @private
   */
  #contacts

  /**
   * Free form string to add notes about a club.  This can be used for arbitrary content that various implementations can use
   * @type {string|null}
   * @private
   */
  #notes

  /**
   * The Competition this club is in
   * @type {Competition}
   * @private
   */
  #competition

  /**
   * A Lookup table from team IDs (including references) to the team
   * @type {Object}
   * @private
   */
  /** @var object  */
  #teamLookup

  /**
   * A Lookup table from contact IDs to the contact
   * @type {object}
   * @private
   */
  #contactLookup

  static UNKNOWN_CLUB_ID = 'UNKNOWN'
  static UNKNOWN_CLUB_NAME = 'UNKNOWN'

  /**
   * Contains the club data of a competition, creating any metadata needed
   *
   * @param {Competition} competition A link back to the Competition this Stage is in
   * @param {string} id The ID of this Team
   * @param {string} clubName The name of this Team
   * @throws {Error} When the provided club ID is invalid or already exists in the competition
   */
  constructor (competition, id, clubName) {
    if (id.length > 100 || id.length < 1) {
      throw new Error('Invalid club ID: must be between 1 and 100 characters long')
    }

    if (!/^((?![":{}?=])[\x20-\x7F])+$/.test(id)) {
      throw new Error('Invalid club ID: must contain only ASCII printable characters excluding " : { } ? =')
    }

    if (competition.hasClub(id)) {
      throw new Error(`Club with ID "${id}" already exists in the competition`)
    }

    this.#competition = competition
    this.#id = id
    this.setName(clubName)
    this.#contacts = []
    this.#notes = null
    this.#teamLookup = {}
    this.#contactLookup = {}
  }

  /**
   * Assumes this is a freshly made Club object and loads it with the data extracted
   * from the Competitions JSON file for this club
   *
   * @param {object} clubData Data from a Competitions JSON file for a single club
   * @returns {Club} the updated club object
   */
  loadFromData (clubData) {
    if (Object.hasOwn(clubData, 'contacts')) {
      clubData.contacts.forEach(contactData => {
        this.addContact((new ClubContact(this, contactData.id, contactData.roles)).loadFromData(contactData))
      })
    }

    if (Object.hasOwn(clubData, 'notes')) {
      this.setNotes(clubData.notes)
    }
    return this
  }

  /**
   * Return the club definition in a form suitable for serializing
   *
   * @returns {Object}
   */
  serialize () {
    const team = {
      id: this.#id,
      name: this.#name
    }

    if (this.#notes !== null) {
      team.notes = this.#notes
    }

    return team
  }

  /**
   * Get the competition this club is in
   *
   * @returns {Competition}
   */
  getCompetition () {
    return this.#competition
  }

  /**
   * Get the ID for this club
   *
   * @returns {string} the id for this club
   */
  getID () {
    return this.#id
  }

  /**
   * Set the name for this club
   *
   * @param {string} name the name for this club
   * @returns {Club} this Club
   * @throws {Error} When the provided club name is invalid
   */
  setName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid club name: must be between 1 and 1000 characters long')
    }
    this.#name = name
    return this
  }

  /**
   * Get the name for this club
   *
   * @returns {string} the name for this club
   */
  getName () {
    return this.#name
  }

  /**
   * Add a contact to this club
   *
   * @param {ClubContact} contact The contact to add to this club
   *
   * @returns {CompetitionTeam} This CompetitionTeam instance
   *
   * @throws {Error} If a contact with a duplicate ID within the club is added
   */
  addContact (contact) {
    if (!(contact instanceof ClubContact)) {
      throw new Error(`clubs can only have club contacts, ${contact.constructor.name} given`)
    }
    if (this.hasContact(contact.getID())) {
      throw new Error('club contacts with duplicate IDs within a club not allowed')
    }
    this.#contacts.push(contact)
    this.#contactLookup[contact.getID()] = contact
    return this
  }

  /**
   * Returns an array of ClubContacts for this club
   *
   * @returns {array<ClubContact>|null} The contacts for this club
   */
  getContacts () {
    return this.#contacts
  }

  /**
   * Returns the ClubContact with the requested ID, or throws if the ID is not found
   *
   * @param {string} id The ID of the contact in this club to return
   *
   * @throws {Error} If a Contact with the requested ID was not found
   *
   * @returns {ClubContact} The requested contact for this club
   */
  getContact (id) {
    if (!Object.hasOwn(this.#contactLookup, id)) {
      throw new Error(`Contact with ID "${id}" not found`)
    }
    return this.#contactLookup[id]
  }

  /**
   * Check if a contact with the given ID exists in this club
   *
   * @param {string} id The ID of the contact to check
   *
   * @returns {bool} True if the contact exists, otherwise false
   */
  hasContact (id) {
    return Object.hasOwn(this.#contactLookup, id)
  }

  /**
   * Check if this club has any contacts
   *
   * @returns bool True if the club has contacts, otherwise false
   */
  hasContacts () {
    return this.#contacts.length > 0
  }

  /**
   * Delete a contact from the club
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
   * Set the notes for this club
   *
   * @param {string|null} notes the notes for this club
   * @returns {Club} this Club
   */
  setNotes (notes) {
    this.#notes = notes
    return this
  }

  /**
   * Get the notes for this club
   *
   * @returns {string|null} the notes for this club
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Does this club have any notes attached
   *
   * @returns {bool} True if the club has notes, otherwise false
   */
  hasNotes () {
    return this.#notes !== null
  }

  /**
   * Add a team to this club
   *
   * @param {CompetitionTeam} team the team to add
   * @returns {Club} this Club
   */
  addTeam (team) {
    if (this.hasTeam(team.getID())) {
      return this
    }
    this.#teamLookup[team.getID()] = team
    team.setClubID(this.getID())
    return this
  }

  /**
   * Get the teams in this club
   *
   * @returns {array<CompetitionTeam>}
   */
  getTeams () {
    return Object.values(this.#teamLookup)
  }

  /**
   * Check if the club has a team with the specified ID
   *
   * @param {string} id The ID of the team
   * @returns {bool}
   */
  hasTeam (id) {
    return Object.hasOwn(this.#teamLookup, id)
  }

  /**
   * Delete a team from this club
   *
   * @param {string} id The ID of the team to delete
   * @returns void
   */
  deleteTeam (id) {
    if (this.hasTeam(id)) {
      const team = this.#teamLookup[id]
      delete this.#teamLookup[id]
      team.setClubID(null)
    }
    return this
  }
}

export default Club
