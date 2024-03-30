/**
 * Represents a team that plays in a match.
 */
class MatchTeam {
  /**
   * The identifier for the team. This may be an exact identifier or a team reference.
   * @type {string}
   * @private
   */
  #id

  /**
   * This team's most valuable player award.
   * @type {string|null}
   * @private
   */
  #mvp

  /**
   * Did this team forfeit the match.
   * @type {boolean}
   * @private
   */
  #forfeit

  /**
   * Does this team get any bonus points in the league.
   * This is separate from any league points calculated from the match result, and is added to their league points.
   * @type {number}
   * @private
   */
  #bonusPoints

  /**
   * Does this team receive any penalty points in the league.
   * This is separate from any league points calculated from the match result, and is subtracted from their league points.
   * @type {number}
   * @private
   */
  #penaltyPoints

  /**
   * Free form string to add notes about the team relating to this match.
   * This can be used for arbitrary content that various implementations can use.
   * @type {string|null}
   * @private
   */
  #notes

  /**
   * The list of players from this team that played in this match.
   * @type {string[]}
   * @private
   */
  #players

  /**
   * The match this team is playing in.
   * @type {MatchInterface}
   * @private
   */
  #match

  /**
   * Contains the team data of a match, creating any metadata needed.
   * @param {MatchInterface} match The match this team is playing in.
   * @param {string} id The identifier for the team.
   */
  constructor (match, id) {
    this.#match = match
    this.#id = id
    this.#mvp = null
    this.#forfeit = false
    this.#bonusPoints = 0
    this.#penaltyPoints = 0
    this.#notes = null
    this.#players = []
  }

  /**
   * Load team data from a given object.
   * @param {MatchInterface} match The match this team is playing in.
   * @param {object} teamData The data defining this Team.
   * @return {MatchTeam} The match team instance.
   */
  static loadFromData (match, teamData) {
    const team = new MatchTeam(match, teamData.id)
    if (Object.hasOwn(teamData, 'mvp')) {
      team.setMVP(teamData.mvp)
    }
    if (Object.hasOwn(teamData, 'forfeit')) {
      team.setForfeit(teamData.forfeit)
    }
    if (Object.hasOwn(teamData, 'bonusPoints')) {
      team.setBonusPoints(teamData.bonusPoints)
    }
    if (Object.hasOwn(teamData, 'penaltyPoints')) {
      team.setPenaltyPoints(teamData.penaltyPoints)
    }
    if (Object.hasOwn(teamData, 'notes')) {
      team.setNotes(teamData.notes)
    }
    if (Object.hasOwn(teamData, 'players')) {
      team.setPlayers(teamData.players)
    }
    return team
  }

  /**
   * Return the team data in a form suitable for serializing
   *
   * @return {object} The serialized team data.
   */
  serialize () {
    const matchTeam = {
      id: this.#id,
      scores: this.getScores(),
      forfeit: this.#forfeit,
      bonusPoints: this.#bonusPoints,
      penaltyPoints: this.#penaltyPoints,
      players: this.#players
    }

    if (this.#mvp !== null) {
      matchTeam.mvp = this.#mvp
    }
    if (this.#notes !== null) {
      matchTeam.notes = this.#notes
    }

    return matchTeam
  }

  /**
   * Get the match the team is playing in.
   * @return {MatchInterface} The match this team plays in.
   */
  getMatch () {
    return this.#match
  }

  /**
   * Get the ID of the team.
   * @return {string} The team ID.
   */
  getID () {
    return this.#id
  }

  /**
   * Set whether the team forfeited the match.
   * @param {boolean} forfeit Whether the team forfeited the match.
   * @return {MatchTeam} The MatchTeam instance.
   */
  setForfeit (forfeit) {
    this.#forfeit = forfeit
    return this
  }

  /**
   * Get whether the team forfeited the match.
   * @return {boolean} Whether the team forfeited the match.
   */
  getForfeit () {
    return this.#forfeit
  }

  /**
   * Get the array of scores for this team in this match.
   * @return {number[]} The team's scores.
   */
  getScores () {
    if (this.#match.getHomeTeam().getID() === this.#id) {
      return this.#match.getHomeTeamScores()
    }
    return this.#match.getAwayTeamScores()
  }

  /**
   * Set the bonus points for the team.
   * @param {number} bonusPoints The bonus points for the team.
   * @return {MatchTeam} The MatchTeam instance.
   */
  setBonusPoints (bonusPoints) {
    this.#bonusPoints = bonusPoints
    return this
  }

  /**
   * Get the bonus points for the team.
   * @return {number} The bonus points for the team.
   */
  getBonusPoints () {
    return this.#bonusPoints
  }

  /**
   * Set the penalty points for the team.
   * @param {number} penaltyPoints The penalty points for the team.
   * @return {MatchTeam} The MatchTeam instance.
   */
  setPenaltyPoints (penaltyPoints) {
    this.#penaltyPoints = penaltyPoints
    return this
  }

  /**
   * Get the penalty points for the team.
   * @return {number} The penalty points for the team.
   */
  getPenaltyPoints () {
    return this.#penaltyPoints
  }

  /**
   * Set the most valuable player for the team.
   * @param {?string} mvp The most valuable player for the team.
   * @return {MatchTeam} The MatchTeam instance.
   */
  setMVP (mvp) {
    this.#mvp = mvp
    return this
  }

  /**
   * Get the most valuable player for the team.
   * @return {?string} The most valuable player for the team.
   */
  getMVP () {
    return this.#mvp
  }

  /**
   * Set notes for the team.
   * @param {?string} notes The notes for the team.
   * @return {MatchTeam} The MatchTeam instance.
   */
  setNotes (notes) {
    this.#notes = notes
    return this
  }

  /**
   * Get notes for the team.
   * @return {?string} The notes for the team.
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Set the players for the team.
   * @param {string[]} players The players for the team.
   * @return {MatchTeam} The MatchTeam instance.
   */
  setPlayers (players) {
    this.#players = players
    return this
  }

  /**
   * Get the players for the team.
   * @return {string[]} The players for the team.
   */
  getPlayers () {
    return this.#players
  }
}

export default MatchTeam
