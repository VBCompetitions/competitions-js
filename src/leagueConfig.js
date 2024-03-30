import LeagueConfigPoints from './leagueConfigPoints.js'

/**
 * Configuration for a league within a competition.
 */
class LeagueConfig {
  /**
   * An array of parameters that define how the league positions are determined
   * @type {array}
   * @private
   */
  #ordering

  /**
   * Properties defining how to calculate the league points based on match results
   * @type {LeagueConfigPoints}
   * @private
   */
  #points

  /**
   * The league this config is for
   * @type {League}
   * @private
   */
  #league

  /**
   * Constructs a new LeagueConfig instance.
   *
   * @param {League} league The league this configuration is associated with
   */
  constructor (league) {
    this.#league = league
    this.#ordering = []
    this.#points = {}
  }

  /**
   * Load league configuration data from a provided object.
   *
   * @param {object} leagueData The league configuration data to load
   * @return {LeagueConfig} Returns the LeagueConfig instance after loading the data
   */
  loadFromData (leagueData) {
    const leagueConfigPoints = (new LeagueConfigPoints(this)).loadFromData(leagueData.points)
    this.setOrdering(leagueData.ordering).setPoints(leagueConfigPoints)
    return this
  }

  /**
   * The league configuration in a form suitable for serializing
   *
   * @return {object} The serialized league configuration data
   */
  serialize () {
    const leagueConfig = {
      ordering: this.#ordering,
      points: this.#points.serialize()
    }
    return leagueConfig
  }

  /**
   * Get the league associated with this configuration.
   *
   * @return {League} The league associated with this configuration
   */
  getLeague () {
    return this.#league
  }

  /**
   * Set the ordering configuration for the league.
   *
   * @param {array} ordering The ordering configuration for the league
   * @return {LeagueConfig} Returns the LeagueConfig instance for method chaining
   */
  setOrdering (ordering) {
    this.#ordering = ordering
    return this
  }

  /**
   * Get the ordering configuration for the league.
   *
   * @return {array} The ordering configuration for the league
   */
  getOrdering () {
    return this.#ordering
  }

  /**
   * Get the points configuration for the league.
   *
   * @return {LeagueConfigPoints} The points configuration for the league
   */
  getPoints () {
    return this.#points
  }

  /**
   * Set the points configuration for the league.
   *
   * @param {LeagueConfigPoints} points The points configuration for the league
   * @return {LeagueConfig} Returns the LeagueConfig instance for method chaining
   */
  setPoints (points) {
    this.#points = points
    return this
  }
}

export default LeagueConfig
