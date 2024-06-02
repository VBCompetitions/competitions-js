/**
 * Represents an entry in a league table for a competition.
 */
class LeagueTableEntry {
  /**
   * The team ID
   * @type {string}
   * @private
   */
  #teamID

  /**
   * The name of the team
   * @type {string}
   * @private
   */
  #team

  /**
   * The number of matches played
   * @type {number}
   * @private
   */
  #played = 0

  /**
   * The number of matches won
   * @type {number}
   * @private
   */
  #wins = 0

  /**
   * The number of matches lost
   * @type {number}
   * @private
   */
  #losses = 0

  /**
   * The number of matches drawn
   * @type {number}
   * @private
   */
  #draws = 0

  /**
   * The number of sets won
   * @type {number}
   * @private
   */
  #sf = 0

  /**
   * The number of sets against
   * @type {number}
   * @private
   */
  #sa = 0

  /**
   * The sets difference
   * @type {number}
   * @private
   */
  #sd = 0

  /**
   * The number of points scored
   * @type {number}
   * @private
   */
  #pf = 0

  /**
   * The number of points conceded
   * @type {number}
   * @private
   */
  #pa = 0

  /**
   * The points difference
   * @type {number}
   * @private
   */
  #pd = 0

  /**
   * The number of bonus points
   * @type {number}
   * @private
   */
  #bp = 0

  /**
   * The number of penalty points
   * @type {number}
   * @private
   */
  #pp = 0

  /**
   * The total points
   * @type {number}
   * @private
   */
  #pts = 0

  /**
   * The head-to-head data
   * @type {object}
   * @private
   */
  #head = {}

  /**
   * The league associated with this entry
   * @type {League}
   * @private
   */
  #league

  /**
   * Constructs a new LeagueTableEntry instance.
   *
   * @param {League} league The league associated with this entry
   * @param {string} teamID The team ID
   * @param {string} name The name of the team
   */
  constructor (league, teamID, name) {
    this.#league = league
    this.#teamID = teamID
    this.#team = name
  }

  /**
   * Return the leagueTableEntry in a form suitable for serializing.  Thisis only used by unit tests
   *
   * @return {object} The serialized league table entry data
   */
  serialize () {
    const leagueTableEntry = {
      teamID: this.#teamID,
      played: this.#played,
      wins: this.#wins,
      losses: this.#losses,
      draws: this.#draws,
      sf: this.#sf,
      sa: this.#sa,
      sd: this.#sd,
      pf: this.#pf,
      pa: this.#pa,
      pd: this.#pd,
      bp: this.#bp,
      pp: this.#pp,
      pts: this.#pts,
      head: this.#head
    }

    return leagueTableEntry
  }

  /**
   * Get the group ID associated with this entry.
   *
   * @return {string} The group ID associated with this entry
   */
  getGroupID () {
    return this.#league.getID()
  }

  /**
   * Get the team ID.
   *
   * @return {string} The team ID
   */
  getTeamID () {
    return this.#teamID
  }

  /**
   * Get the name of the team.
   *
   * @return {string} The name of the team
   */
  getTeam () {
    return this.#team
  }

  /**
   * Get the number of matches played.
   *
   * @return {number} The number of matches played
   */
  getPlayed () {
    return this.#played
  }

  /**
   * Set the number of matches played.
   *
   * @param {number} played The number of matches played
   */
  setPlayed (played) {
    this.#played = played
  }

  /**
   * Get the number of matches won.
   *
   * @return {number} The number of matches won
   */
  getWins () {
    return this.#wins
  }

  /**
   * Set the number of matches won.
   *
   * @param {number} wins The number of matches won
   */
  setWins (wins) {
    this.#wins = wins
  }

  /**
   * Get the number of matches lost.
   *
   * @return {number} The number of matches lost
   */
  getLosses () {
    return this.#losses
  }

  /**
   * Set the number of matches lost.
   *
   * @param {number} losses The number of matches lost
   */
  setLosses (losses) {
    this.#losses = losses
  }

  /**
   * Get the number of matches drawn.
   *
   * @return {number} The number of matches drawn
   */
  getDraws () {
    return this.#draws
  }

  /**
   * Set the number of matches drawn.
   *
   * @param {number} draws The number of matches drawn
   */
  setDraws (draws) {
    this.#draws = draws
  }

  /**
   * Get the number of sets won.
   *
   * @return {number} The number of sets won
   */
  getSF () {
    return this.#sf
  }

  /**
   * Set the number of sets won.
   *
   * @param {number} sf The number of sets won
   */
  setSF (sf) {
    this.#sf = sf
  }

  /**
   * Get the number of sets against.
   *
   * @return {number} The number of sets against
   */
  getSA () {
    return this.#sa
  }

  /**
   * Set the number of sets against.
   *
   * @param {number} sa The number of sets against
   */
  setSA (sa) {
    this.#sa = sa
  }

  /**
   * Get the sets difference.
   *
   * @return {number} The sets difference
   */
  getSD () {
    return this.#sd
  }

  /**
   * Set the sets difference.
   *
   * @param {number} sd The sets difference
   */
  setSD (sd) {
    this.#sd = sd
  }

  /**
   * Get the number of points scored.
   *
   * @return {number} The number of points scored
   */
  getPF () {
    return this.#pf
  }

  /**
   * Set the number of points scored.
   *
   * @param {number} pf The number of points scored
   */
  setPF (pf) {
    this.#pf = pf
  }

  /**
   * Get the number of points conceded.
   *
   * @return {number} The number of points conceded
   */
  getPA () {
    return this.#pa
  }

  /**
   * Set the number of points conceded.
   *
   * @param {number} pa The number of points conceded
   */
  setPA (pa) {
    this.#pa = pa
  }

  /**
   * Get the points difference.
   *
   * @return {number} The points difference
   */
  getPD () {
    return this.#pd
  }

  /**
   * Set the points difference.
   *
   * @param {number} pd The points difference
   */
  setPD (pd) {
    this.#pd = pd
  }

  /**
   * Get the bonus points.
   *
   * @return {number} The bonus points
   */
  getBP () {
    return this.#bp
  }

  /**
   * Set the bonus points.
   *
   * @param {number} bp The bonus points
   */
  setBP (bp) {
    this.#bp = bp
  }

  /**
   * Get the penalty points.
   *
   * @return {number} The penalty points
   */
  getPP () {
    return this.#pp
  }

  /**
   * Set the penalty points.
   *
   * @param {number} pp The penalty points
   */
  setPP (pp) {
    this.#pp = pp
  }

  /**
   * Get the total points.
   *
   * @return {number} The total points
   */
  getPTS () {
    return this.#pts
  }

  /**
   * Set the total points.
   *
   * @param {number} pts The total points
   */
  setPTS (pts) {
    this.#pts = pts
  }

  /**
   * Get the head-to-head data.
   *
   * @return {object} The head-to-head data
   */
  getH2H () {
    return this.#head
  }
}

export default LeagueTableEntry
