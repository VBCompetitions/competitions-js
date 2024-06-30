import PlayerTeam from './playerTeam.js'

/**
 * Represents a player in a team.
 */
class Player {
  static UNREGISTERED_PLAYER_ID = 'UNKNOWN'

  /**
   * A unique ID for this player. This may be the player's registration number. This must be unique within the team
   * @type {string}
   * @private
   **/
  #id

  /**
   * The name of this player
   * @type {string}
   * @private
   **/
  #name

  /**
   * The player's shirt number
   * @type {int|null}
   * @private
   **/
  #number

  /**
   * An ordered list of teams the player is/has been registered for in this competition, in the order that they have been
   * registered (and therefore transferred in the case of more than one entry).  A player can only be registered with one
   * team at any time within this competition, meaning that if there are multiple teams listed, either all but the last
   * entry MUST have an \"until\" value, or there must be no \"from\" or \"until\" values in any entry
   * @type {Array<PlayerTeam}
   * @private
   */
  #teams

  /**
   * Free form string to add notes about the player. This can be used for arbitrary content that various implementations can use
   * @type {string|null}
   * @private
   **/
  #notes

  /**
   * The Competition this player is in
   * @type {Competition}
   * @private
   */
  #competition

  /**
   * @param {Competition} competition A link back to the Competition this Player is in
   * @param {string} id The ID of the player
   * @param {string} name The name of the player
   * @throws {Error} If the ID is invalid or already exists in the team
   */
  constructor (competition, id, name) {
    if (id.length > 100 || id.length < 1) {
      throw new Error('Invalid player ID: must be between 1 and 100 characters long')
    }

    if (!/^((?![":{}?=])[\x20-\x7F])+$/.test(id)) {
      throw new Error('Invalid player ID: must contain only ASCII printable characters excluding " : { } ? =')
    }

    if (competition.hasPlayer(id)) {
      throw new Error(`Player with ID "${id}" already exists in the competition`)
    }

    this.#competition = competition
    this.#id = id
    this.setName(name)
    this.#teams = []
    this.#number = null
    this.#notes = null
  }

  /**
   * Load player data from an object.
   *
   * @param {object} playerData The data defining this Player
   * @returns {Player} The updated Player object
   */
  loadFromData (playerData) {
    if (Object.hasOwn(playerData, 'number')) {
      this.setNumber(playerData.number)
    }

    if (Array.isArray(playerData.teams)) {
      playerData.teams.forEach(playerTeamData => {
        this.appendTeamEntry(new PlayerTeam(this, playerTeamData.id).loadFromData(playerTeamData))
      })
    }

    if (Object.hasOwn(playerData, 'notes')) {
      this.setNotes(playerData.notes)
    }

    return this
  }

  /**
   * Return the list of player data in a form suitable for serializing
   *
   * @returns {object}
   */
  serialize () {
    const player = {
      id: this.#id,
      name: this.#name
    }

    if (this.#number !== null) {
      player.number = this.#number
    }

    if (this.#teams.length > 0) {
      player.teams = []
      this.#teams.forEach(team => {
        player.teams.push(team.serialize())
      })
    }

    if (this.#notes !== null) {
      player.notes = this.#notes
    }

    return player
  }

  /**
   * Get the competition this player belongs to
   * @returns {Competition} The competition this player belongs to
   */
  getCompetition () {
    return this.#competition
  }

  /**
   * Get the ID for this player.
   *
   * @returns {string} The ID for this player
   */
  getID () {
    return this.#id
  }

  /**
   * Get the name for this player.
   *
   * @returns {string} The name for this player
   */
  getName () {
    return this.#name
  }

  /**
   * Set the name for this player.
   *
   * @param {string} name The name for this player
   * @throws {Error} If the name is invalid
   */
  setName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid player name: must be between 1 and 1000 characters long')
    }
    this.#name = name
  }

  /**
   * Get the shirt number for this player.
   *
   * @returns {number|null} The shirt number for this player
   */
  getNumber () {
    return this.#number
  }

  /**
   * Set the shirt number for this player.
   *
   * @param {number|null} number The shirt number for this player
   * @throws {Error} If the number is invalid
   */
  setNumber (number) {
    if (number !== null && number < 1) {
      throw new Error(`Invalid player number "${number}": must be greater than 1`)
    }
    this.#number = number
  }

  /**
   * Append a PlayerTeam entry to the end of the list of teams that the player has been registered with
   *
   * @param {PlayerTeam} teamEntry the PlayerTeam entry to add
   * @returns {Player} this Player
   */
  appendTeamEntry (teamEntry) {
    this.#teams.push(teamEntry)
    return this
  }

  /**
   * Get the list of teams this player has been registered with
   *
   * @returns {Array<PlayerTeam>} The team this player belongs to
   */
  getTeamEntries () {
    return this.#teams
  }

  /**
   * Get the most recent PlayerTeam that the player has been registered with
   *
   * @returns {?PlayerTeam} The most recent PlayerTeam that the player has been registered with
   */
  getLatestTeamEntry () {
    if (this.#teams.length === 0) {
      return null
    }

    return this.#teams[this.#teams.length - 1]
  }

  /**
   * Get the most recent CompetitionTeam that the player has been registered with
   *
   * @returns {?CompetitionTeam} The most recent CompetitionTeam that the player has been registered with
   */
  getCurrentTeam () {
    const id = this.#teams.length > 0 ? this.#teams[this.#teams.length - 1].getID() : ''
    return this.#competition.getTeam(id)
  }

  /**
   * Check if a team entry exists with the given team ID
   *
   * @param {string} id the team ID to check for
   * @returns {boolean} whether the player has ever been registered to the team with the given ID
   */
  hasTeamEntry (id) {
    return this.#teams.some(team => team.getID() === id)
  }

  /**
   * Removes up to "count" elements from the array of team entries, starting at element "start".
   * This calls "splice" directly so has the same behaviour in terms of negative values and
   * values out of bounds
   *
   * @param {number} start
   * @param {number} count
   * @returns {Player} this Player
   */
  spliceTeamEntries (start, count) {
    this.#teams.splice(start, count)
    return this
  }

  /**
   * Get the notes for this player.
   *
   * @returns {string|null} The notes for this player
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Set the notes for this player.
   *
   * @param {string|null} notes The notes for this player
   * @returns {Player} this Player
   */
  setNotes (notes) {
    this.#notes = notes
    return this
  }
}

export default Player
