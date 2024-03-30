/**
 * Represents a player in a team.
 */
class Player {
  /**
   * Free form string to add notes about this stage.
   * @type {string|null}
   * @private
   **/

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
   * Free form string to add notes about the player. This can be used for arbitrary content that various implementations can use
   * @type {string|null}
   * @private
   **/
  #notes

  /**
   * The team this player belongs to
   * @type {CompetitionTeam}
   * @private
   **/
  #team

  /**
   * @param {CompetitionTeam} team The team to which this player belongs
   * @param {string} id The ID of the player
   * @param {string} name The name of the player
   * @throws {Error} If the ID is invalid or already exists in the team
   */
  constructor (team, id, name) {
    if (id.length > 100 || id.length < 1) {
      throw new Error('Invalid player ID: must be between 1 and 100 characters long')
    }

    if (!/^((?![":{}?=])[\x20-\x7F])+$/.test(id)) {
      throw new Error('Invalid player ID: must contain only ASCII printable characters excluding " : { } ? =')
    }

    if (team.hasPlayerWithID(id)) {
      throw new Error(`Player with ID "${id}" already exists in the team`)
    }

    this.#team = team
    this.#id = id
    this.setName(name)
    this.#number = null
    this.#notes = null
  }

  /**
   * Load player data from an object.
   *
   * @param {object} playerData The data defining this Player
   * @return {Player} The updated Player object
   */
  loadFromData (playerData) {
    if (playerData.number !== undefined) {
      this.setNumber(playerData.number)
    }

    if (playerData.notes !== undefined) {
      this.setNotes(playerData.notes)
    }

    return this
  }

  /**
   * Return the list of player data in a form suitable for serializing
   *
   * @return {object}
   */
  serialize () {
    const player = {
      id: this.#id,
      name: this.#name
    }

    if (this.#number !== null) {
      player.number = this.#number
    }

    if (this.#notes !== null) {
      player.notes = this.#notes
    }

    return player
  }

  /**
   * Get the team this player belongs to
   * @returns {CompetitionTeam} The team this player belongs to
   */
  getTeam () {
    return this.#team
  }

  /**
   * Get the ID for this player.
   *
   * @return {string} The ID for this player
   */
  getID () {
    return this.#id
  }

  /**
   * Get the name for this player.
   *
   * @return {string} The name for this player
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
   * @return {number|null} The shirt number for this player
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
   * Get the notes for this player.
   *
   * @return {string|null} The notes for this player
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Set the notes for this player.
   *
   * @param {string|null} notes The notes for this player
   */
  setNotes (notes) {
    this.#notes = notes
  }
}

export default Player
