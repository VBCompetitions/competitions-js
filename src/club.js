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

  static UNKNOWN_CLUB_ID = 'UNKNOWN'
  static UNKNOWN_CLUB_NAME = 'UNKNOWN'

  /**
   * Contains the club data of a competition, creating any metadata needed
   *
   * @param {Competition} competition A link back to the Competition this Stage is in
   * @param {string} clubID The ID of this Team
   * @param {string} clubName The name of this Team
   * @throws {Error} When the provided club ID is invalid or already exists in the competition
   */
  constructor (competition, clubID, clubName) {
    if (clubID.length > 100 || clubID.length < 1) {
      throw new Error('Invalid club ID: must be between 1 and 100 characters long')
    }

    if (!/^((?![":{}?=])[\x20-\x7F])+$/.test(clubID)) {
      throw new Error('Invalid club ID: must contain only ASCII printable characters excluding " : { } ? =')
    }

    if (competition.hasClubWithID(clubID)) {
      throw new Error(`Club with ID "${clubID}" already exists in the competition`)
    }

    this.#competition = competition
    this.#id = clubID
    this.setName(clubName)
    this.#notes = null
    this.#teamLookup = {}
  }

  /**
   * Assumes this is a freshly made Club object and loads it with the data extracted
   * from the Competitions JSON file for this club
   *
   * @param {object} clubData Data from a Competitions JSON file for a single club
   * @return {Club} the updated club object
   */
  loadFromData (clubData) {
    if (Object.hasOwn(clubData, 'notes')) {
      this.setNotes(clubData.notes)
    }
    return this
  }

  /**
   * Return the club definition in a form suitable for serializing
   *
   * @return {Object}
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
   * @return {Competition}
   */
  getCompetition () {
    return this.#competition
  }

  /**
   * Get the ID for this club
   *
   * @return {string} the id for this club
   */
  getID () {
    return this.#id
  }

  /**
   * Set the name for this club
   *
   * @param {string} name the name for this club
   * @return {Club} this Club
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
   * @return {string} the name for this club
   */
  getName () {
    return this.#name
  }

  /**
   * Set the notes for this club
   *
   * @param {string|null} notes the notes for this club
   * @return {Club} this Club
   */
  setNotes (notes) {
    this.#notes = notes
    return this
  }

  /**
   * Get the notes for this club
   *
   * @return {string|null} the notes for this club
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Does this club have any notes attached
   *
   * @return {bool} True if the club has notes, otherwise false
   */
  hasNotes () {
    return this.#notes !== null
  }

  /**
   * Add a team to this club
   *
   * @param {CompetitionTeam} team the team to add
   * @return {Club} this Club
   */
  addTeam (team) {
    if (this.hasTeamWithID(team.getID())) {
      return this
    }
    this.#teamLookup[team.getID()] = team
    team.setClubID(this.getID())
    return this
  }

  /**
   * Get the teams in this club
   *
   * @return {array<CompetitionTeam>}
   */
  getTeams () {
    return Object.values(this.#teamLookup)
  }

  /**
   * Check if the club has a team with the specified ID
   *
   * @param {string} teamID The ID of the team
   * @return {bool}
   */
  hasTeamWithID (teamID) {
    return Object.hasOwn(this.#teamLookup, teamID)
  }

  /**
   * Delete a team from this club
   *
   * @param {string} teamID The ID of the team to delete
   * @return void
   */
  deleteTeam (teamID) {
    if (this.hasTeamWithID(teamID)) {
      const team = this.#teamLookup[teamID]
      delete this.#teamLookup[teamID]
      team.setClubID(null)
    }
    return this
  }
}

export default Club
