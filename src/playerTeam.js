/**
 * Represents a team that the player is/has been registered to
 */
class PlayerTeam {
  /**
   * The team ID that the player is/was registered with
   * @type {string}
   * @private
   **/
  #id

  /**
   * The date from which the player is/was registered with this team.  When this is not present, there should not be any \"from\"
   * or \"until\" values in any entry in this player's \"teams\" array
   * @type {string|null}
   * @private
   **/
  #from

  /**
   * The date up to which the player was registered with this team.  When a \"from\" date is specified and this is not, it should
   * be taken that a player is still registered with this team
   * @type {string|null}
   * @private
   **/
  #until

  /**
   * Free form string to add notes about this team registration entry for the player
   * @type {string|null}
   * @private
   **/
  #notes

  /**
   * The player associated with this record
   * @type {Player}
   * @private
   */
  #player

  /**
   * @param {Player} player A link back to the Player for this record
   * @param {string} id The ID of the team that the player's registry represents
   * @throws {Error} If the ID is invalid
   */
  constructor (player, id) {
    if (id.length > 100 || id.length < 1) {
      throw new Error('Invalid team ID: must be between 1 and 100 characters long')
    }

    if (!/^((?![":{}?=])[\x20-\x7F])+$/.test(id)) {
      throw new Error('Invalid team ID: must contain only ASCII printable characters excluding " : { } ? =')
    }

    this.#player = player
    this.#id = id
    this.#from = null
    this.#until = null
    this.#notes = null
  }

  /**
   * Load player team data from an object.
   *
   * @param {object} playerData The data defining this PlayerTeam entry
   * @returns {Player} The updated PlayerTeam object
   */
  loadFromData (playerTeamData) {
    if (Object.hasOwn(playerTeamData, 'from')) {
      this.setFrom(playerTeamData.from)
    }

    if (Object.hasOwn(playerTeamData, 'until')) {
      this.setUntil(playerTeamData.until)
    }

    if (Object.hasOwn(playerTeamData, 'notes')) {
      this.setNotes(playerTeamData.notes)
    }

    return this
  }

  /**
   * Return the playerTeam data in a form suitable for serializing
   *
   * @returns {object}
   */
  serialize () {
    const playerTeam = {
      id: this.#id
    }

    if (this.#from !== null) {
      playerTeam.from = this.#from
    }

    if (this.#until !== null) {
      playerTeam.until = this.#until
    }

    if (this.#notes !== null) {
      playerTeam.notes = this.#notes
    }

    return playerTeam
  }

  /**
   * Get the player this player team entry belongs to
   * @returns {Player} The player this player team entry belongs to
   */
  getPlayer () {
    return this.#player
  }

  /**
   * Get the ID for the Team this entry represents.
   *
   * @returns {string} The ID of the team for this playerTeam entry
   */
  getID () {
    return this.#id
  }

  /**
   * Get the from date for this player team entry.
   *
   * @returns {string} The from date for this player team entry
   */
  getFrom () {
    return this.#from
  }

  /**
   * Set the from date for this player team entry
   *
   * @param {string} from The from date for this player team entry
   * @throws {Error} If the from date is invalid
   * @returns {PlayerTeam} This player team entry
   */
  setFrom (from) {
    if (!/^[0-9]{4}-(0[0-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(from)) {
      throw new Error(`Invalid date "${from}": must contain a value of the form "YYYY-MM-DD"`)
    }

    const d = new Date(from)
    if (`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${(d.getDate()).toString().padStart(2, '0')}` !== from) {
      throw new Error(`Invalid date "${from}": date does not exist`)
    }

    this.#from = from
    return this
  }

  /**
   * Get the until date for this player team entry
   *
   * @returns {string|null} The until date for this player team entry
   */
  getUntil () {
    return this.#until
  }

  /**
   * Set the until date for this player team entry
   *
   * @param {string|null} until The until date for this player team entry
   * @throws {Error} If the until date is invalid
   * @returns {PlayerTeam} This player team entry
   */
  setUntil (until) {
    if (!/^[0-9]{4}-(0[0-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(until)) {
      throw new Error(`Invalid date "${until}": must contain a value of the form "YYYY-MM-DD"`)
    }

    const d = new Date(until)
    if (`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${(d.getDate()).toString().padStart(2, '0')}` !== until) {
      throw new Error(`Invalid date "${until}": date does not exist`)
    }

    this.#until = until
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
   * @returns {PlayerTeam} This player team entry
   */
  setNotes (notes) {
    this.#notes = notes
    return this
  }
}

export default PlayerTeam
