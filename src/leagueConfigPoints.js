/**
 * Configuration for league points in a competition.
*/
class LeagueConfigPoints {
  /**
   * Number of league points for playing the match
   * @type {number}
   * @private
   */
  #played

  /**
   * Number of league points for each set won
   * @type {number}
   * @private
   */
  #perSet

  /**
   * Number of league points for winning (by 2 sets or more if playing sets)
   * @type {number}
   * @private
   */
  #win

  /**
   * Number of league points for winning by 1 set
   * @type {number}
   * @private
   */
  #winByOne

  /**
   * Number of league points for losing (by 2 sets or more if playing sets)
   * @type {number}
   * @private
   */
  #lose

  /**
   * Number of league points for losing by 1 set
   * @type {number}
   * @private
   */
  #loseByOne

  /**
   * Number of league penalty points for forfeiting a match
   * @type {number}
   * @private
   */
  #forfeit

  /**
   * The league configuration associated with these points
   * @type {LeagueConfig}
   * @private
   */
  #leagueConfig

  /**
   * Constructs a new LeagueConfigPoints instance.
   *
   * @param {LeagueConfig} leagueConfig The league configuration associated with these points
   */
  constructor (leagueConfig) {
    this.#played = 0
    this.#perSet = 0
    this.#win = 3
    this.#winByOne = 0
    this.#lose = 0
    this.#loseByOne = 0
    this.#forfeit = 0
    this.#leagueConfig = leagueConfig
  }

  /**
   * Load league points configuration data from a provided object.
   *
   * @param {object} leagueConfigData The league points configuration data to load
   * @return {LeagueConfigPoints} Returns the LeagueConfigPoints instance after loading the data
   */
  loadFromData (leagueConfigData) {
    if (leagueConfigData.played !== undefined) {
      this.setPlayed(leagueConfigData.played)
    }
    if (leagueConfigData.perSet !== undefined) {
      this.setPerSet(leagueConfigData.perSet)
    }
    if (leagueConfigData.win !== undefined) {
      this.setWin(leagueConfigData.win)
    }
    if (leagueConfigData.winByOne !== undefined) {
      this.setWinByOne(leagueConfigData.winByOne)
    }
    if (leagueConfigData.lose !== undefined) {
      this.setLose(leagueConfigData.lose)
    }
    if (leagueConfigData.loseByOne !== undefined) {
      this.setLoseByOne(leagueConfigData.loseByOne)
    }
    if (leagueConfigData.forfeit !== undefined) {
      this.setForfeit(leagueConfigData.forfeit)
    }

    return this
  }

  /**
   * The league points configuration in a form suitable for serializing
   *
   * @return {object} The serialized league points configuration data
   */
  serialize () {
    return {
      played: this.#played,
      perSet: this.#perSet,
      win: this.#win,
      winByOne: this.#winByOne,
      lose: this.#lose,
      loseByOne: this.#loseByOne,
      forfeit: this.#forfeit
    }
  }

  /**
   * Get the league configuration associated with these points.
   *
   * @return {LeagueConfig} The league configuration associated with these points
   */
  getLeagueConfig () {
    return this.#leagueConfig
  }

  /**
   * Set the number of league points for playing the match.
   *
   * @param {number} played The number of league points for playing the match
   * @return {LeagueConfigPoints} Returns the LeagueConfigPoints instance for method chaining
   */
  setPlayed (played) {
    this.#played = played
    return this
  }

  /**
   * Get the number of league points for playing the match.
   *
   * @return {number} The number of league points for playing the match
   */
  getPlayed () {
    return this.#played
  }

  /**
   * Set the number of league points for each set won.
   *
   * @param {number} perSet The number of league points for each set won
   * @return {LeagueConfigPoints} Returns the LeagueConfigPoints instance for method chaining
   */
  setPerSet (perSet) {
    this.#perSet = perSet
    return this
  }

  /**
   * Get the number of league points for each set won.
   *
   * @return {number} The number of league points for each set won
   */
  getPerSet () {
    return this.#perSet
  }

  /**
   * Set the number of league points for winning.
   *
   * @param {number} win The number of league points for winning
   * @return {LeagueConfigPoints} Returns the LeagueConfigPoints instance for method chaining
   */
  setWin (win) {
    this.#win = win
    return this
  }

  /**
   * Get the number of league points for winning.
   *
   * @return {number} The number of league points for winning
   */
  getWin () {
    return this.#win
  }

  /**
   * Set the number of league points for winning by one set.
   *
   * @param {number} winByOne The number of league points for winning by one set
   * @return {LeagueConfigPoints} Returns the LeagueConfigPoints instance for method chaining
   */
  setWinByOne (winByOne) {
    this.#winByOne = winByOne
    return this
  }

  /**
   * Get the number of league points for winning by one set.
   *
   * @return {number} The number of league points for winning by one set
   */
  getWinByOne () {
    return this.#winByOne
  }

  /**
   * Set the number of league points for losing.
   *
   * @param {number} lose The number of league points for losing
   * @return {LeagueConfigPoints} Returns the LeagueConfigPoints instance for method chaining
   */
  setLose (lose) {
    this.#lose = lose
    return this
  }

  /**
   * Get the number of league points for losing.
   *
   * @return {number} The number of league points for losing
   */
  getLose () {
    return this.#lose
  }

  /**
   * Set the number of league points for losing by one set.
   *
   * @param {number} loseByOne The number of league points for losing by one set
   * @return {LeagueConfigPoints} Returns the LeagueConfigPoints instance for method chaining
   */
  setLoseByOne (loseByOne) {
    this.#loseByOne = loseByOne
    return this
  }

  /**
   * Get the number of league points for losing by one set.
   *
   * @return {number} The number of league points for losing by one set
   */
  getLoseByOne () {
    return this.#loseByOne
  }

  /**
   * Set the number of league penalty points for forfeiting a match.
   *
   * @param {number} forfeit The number of league penalty points for forfeiting a match
   * @return {LeagueConfigPoints} Returns the LeagueConfigPoints instance for method chaining
   */
  setForfeit (forfeit) {
    this.#forfeit = forfeit
    return this
  }

  /**
   * Get the number of league penalty points for forfeiting a match.
   *
   * @return {number} The number of league penalty points for forfeiting a match
   */
  getForfeit () {
    return this.#forfeit
  }
}

export default LeagueConfigPoints
