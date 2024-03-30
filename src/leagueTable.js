import MatchType from './matchType.js'

/**
 * Represents a league table for a competition.
*/
class LeagueTable {
  static ORDERING_LEAGUE_POINTS = 'PTS'
  static ORDERING_WINS = 'WINS'
  static ORDERING_LOSSES = 'LOSSES'
  static ORDERING_HEAD_TO_HEAD = 'H2H'
  static ORDERING_POINTS_FOR = 'PF'
  static ORDERING_POINTS_AGAINST = 'PA'
  static ORDERING_POINTS_DIFFERENCE = 'PD'
  static ORDERING_SETS_FOR = 'SF'
  static ORDERING_SETS_AGAINST = 'SA'
  static ORDERING_SETS_DIFFERENCE = 'SD'

  /**
   * An array of entries in the league table
   * @type {array}
   * @private
   */
  entries = []

  /**
   * The league associated with this table
   * @type {League}
   * @private
   */
  #league

  /**
   * Indicates if draws are allowed in the league
   * @type {bool}
   * @private
   */
  #hasDraws

  /**
   * Indicates if the league uses sets
   * @type {bool}
   * @private
   */
  #hasSets

  /**
   * The ordering criteria for the league table
   * @type {array}
   * @private
   */
  #ordering

  /**
   * Constructs a new LeagueTable instance.
   *
   * @param {League} league The league associated with this table
   */
  constructor (league) {
    this.#league = league
    this.#hasDraws = league.getDrawsAllowed()
    this.#hasSets = league.getMatchType() === MatchType.SETS
    this.#ordering = league.getLeagueConfig().getOrdering()
  }

  /**
   * Get the league associated with this table.
   *
   * @return {League} The league associated with this table
   */
  getLeague () {
    return this.#league
  }

  /**
   * Get the text representation of the ordering criteria for the league table.
   *
   * @return {string} The text representation of the ordering criteria
   */
  getOrderingText () {
    let orderingText = `Position is decided by ${LeagueTable.#mapOrderingToString(this.#ordering[0])}`
    for (let i = 1; i < this.#ordering.length; i++) {
      orderingText += `, then ${LeagueTable.#mapOrderingToString(this.#ordering[i])}`
    }
    return orderingText
  }

  /**
   * Maps ordering string to human-readable format.
   *
   * @param {string} orderingString The ordering string to map
   * @return {string} The human-readable representation of the ordering string
   */
  static #mapOrderingToString (orderingString) {
    switch (orderingString) {
      case LeagueTable.ORDERING_LEAGUE_POINTS:
        return 'points'
      case LeagueTable.ORDERING_WINS:
        return 'wins'
      case LeagueTable.ORDERING_LOSSES:
        return 'losses'
      case LeagueTable.ORDERING_HEAD_TO_HEAD:
        return 'head-to-head'
      case LeagueTable.ORDERING_POINTS_FOR:
        return 'points for'
      case LeagueTable.ORDERING_POINTS_AGAINST:
        return 'points against'
      case LeagueTable.ORDERING_POINTS_DIFFERENCE:
        return 'points difference'
      case LeagueTable.ORDERING_SETS_FOR:
        return 'sets for'
      case LeagueTable.ORDERING_SETS_AGAINST:
        return 'sets against'
      case LeagueTable.ORDERING_SETS_DIFFERENCE:
        return 'sets difference'
    }
  }

  /**
   * Get the text representation of the scoring system used in the league.
   *
   * @return {string} The text representation of the league's scoring system
   */
  getScoringText () {
    const textBuilder = (points, action) => {
      if (points === 1) {
        return `1 point per ${action}, `
      } else {
        return `${points} points per ${action}, `
      }
    }

    const leagueConfig = this.#league.getLeagueConfig().getPoints()
    let scoringText = 'Teams win '
    if (leagueConfig.getPlayed() !== 0) {
      scoringText += textBuilder(leagueConfig.getPlayed(), 'played')
    }
    if (leagueConfig.getWin() !== 0) {
      scoringText += textBuilder(leagueConfig.getWin(), 'win')
    }
    if (leagueConfig.getPerSet() !== 0) {
      scoringText += textBuilder(leagueConfig.getPerSet(), 'set')
    }
    if (leagueConfig.getWinByOne() !== 0 && leagueConfig.getWin() !== leagueConfig.getWinByOne()) {
      scoringText += textBuilder(leagueConfig.getWinByOne(), 'win by one set')
    }
    if (leagueConfig.getLose() !== 0) {
      scoringText += textBuilder(leagueConfig.getLose(), 'loss')
    }
    if (leagueConfig.getLoseByOne() !== 0 && leagueConfig.getWin() !== leagueConfig.getLoseByOne()) {
      scoringText += textBuilder(leagueConfig.getLoseByOne(), 'loss by one set')
    }
    if (leagueConfig.getForfeit() !== 0) {
      scoringText += textBuilder(leagueConfig.getForfeit(), 'forfeited match')
    }
    if (scoringText.length < 12) {
      // Everything is zero; weird but possible
      return ''
    }
    return scoringText.slice(0, -2).replace(/(.*), ([^,]*)/, '$1 and $2')
  }

  /**
   * Checks if draws are allowed in the league.
   *
   * @return {boolean} True if draws are allowed, false otherwise
   */
  hasDraws () {
    return this.#hasDraws
  }

  /**
   * Checks if the league uses sets.
   *
   * @return {boolean} True if the league uses sets, false otherwise
   */
  hasSets () {
    return this.#hasSets
  }

  /**
   * Get the group ID associated with this league table.
   *
   * @return {string} The group ID associated with this league table
   */
  getGroupID () {
    return this.#league.getID()
  }
}

export default LeagueTable
