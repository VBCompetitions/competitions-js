/**
 * Represents a manager for a match in a competition.
 */
class MatchManager {
  /**
   *  The court manager in charge of this match
   * @type {string|null}
   * @private
   */
  #managerName = null

  /**
   *  The team assigned to manage the match.
   * @type {string|null}
   * @private
   */
  #managerTeam = null

  /**
   * The match this Manager is managing
   * @type {MatchInterface}
   * @private
   */
  #match

  /**
   * Constructor.
   *
   * Defines the match/court manager of a match, which may be an individual or a team.
   *
   * @param {MatchInterface} match The match this Manager is managing
   * @param {string|null} teamID The ID of the team managing the match
   * @param {string|null} manager The name of the manager managing the match
   * @throws {Error} If Match Managers must be either a team or a person
   */
  constructor (match, teamID, manager = null) {
    this.#match = match
    if (teamID !== null) {
      this.setTeamID(teamID)
    } else if (manager !== null) {
      this.setManagerName(manager)
    } else {
      throw new Error('Match Managers must be either a team or a person')
    }
  }

  /**
   * Load match manager data from a given object.
   *
   * @param {MatchInterface} match The match this Manager is managing
   * @param {string|object} managerData The data for the match manager
   * @returns {MatchManager} The match manager instance
   */
  static loadFromData (match, managerData) {
    let manager
    if (typeof managerData === 'object' && managerData.team !== undefined) {
      manager = new MatchManager(match, managerData.team, null)
    } else {
      manager = new MatchManager(match, null, managerData)
    }
    return manager
  }

  /**
   * Return the match manager definition in a form suitable for serializing
   *
   * @returns {Object|string} The serialized match manager data
   */
  serialize () {
    if (this.#managerTeam !== null) {
      return { team: this.#managerTeam }
    }
    return this.#managerName
  }

  /**
   * Get the match this manager is managing.
   *
   * @returns {MatchInterface} The match being managed
   */
  getMatch () {
    return this.#match
  }

  /**
   * Check whether the match manager is a team or not.
   *
   * @returns {boolean} True if the manager is a team, false otherwise
   */
  isTeam () {
    return this.#managerTeam !== null
  }

  /**
   * Get the ID of the team managing the match.
   *
   * @returns {string|null} The team ID
   */
  getTeamID () {
    return this.#managerTeam
  }

  /**
   * Set the ID for the team managing the match. Note that this unsets any manager name.
   *
   * @param {string} id The ID for the team managing the match
   * @throws {Error} If the team ID is invalid
   */
  setTeamID (id) {
    this.#match.getGroup().getStage().getCompetition().validateTeamID(id, this.#match.getID(), 'manager')
    this.#managerTeam = id
    this.#managerName = null
  }

  /**
   * Get the name of the manager.
   *
   * @returns {string|null} The name of the manager
   */
  getManagerName () {
    return this.#managerName
  }

  /**
   * Set the name of the manager managing the match. Note that this unsets any team ID.
   *
   * @param {string} name The name of the manager managing the match
   * @throws {Error} If the manager name is invalid
   */
  setManagerName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid manager name: must be between 1 and 1000 characters long')
    }
    this.#managerName = name
    this.#managerTeam = null
  }
}

export default MatchManager
