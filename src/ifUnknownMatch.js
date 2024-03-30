import CompetitionTeam from './competitionTeam.js'
import MatchManager from './matchManager.js'
import MatchOfficials from './matchOfficials.js'
import MatchTeam from './matchTeam.js'

/**
 * A match between two teams
 */
class IfUnknownMatch {
  /**
   * An identifier for this match, i.e. a match number.  If the document uses any team references then all match
   * identifiers in the document must be unique or a document reader's behaviour is undefined
   * @type string
   * @private
   */
  #id

  /**
   * The court that a match takes place on
   * @type {string|null}
   * @private
   */
  #court = null

  /**
   * The venue that a match takes place at
   * @type {string|null}
   * @private
   */
  #venue = null

  /**
   * The date of the match
   * @type {string|null}
   * @private
   */
  #date = null

  /**
   * The start time for the warmup
   * @type {string|null}
   * @private
   */
  #warmup = null

  /**
   * The start time for the match
   * @type {string|null}
   * @private
   */
  #start = null

  /**
   * The maximum duration of the match
   * @type {string|null}
   * @private
   */
  #duration = null

  /**
   * The 'home' team for the match
   * @type {MatchTeam}
   * @private
   */
  #homeTeam

  /**
   * The 'away' team for the match
   * @type {MatchTeam}
   * @private
   */
  #awayTeam

  /**
   * The officials for this match
   * @type {MatchOfficials|null}
   * @private
   */
  #officials = null

  /**
   * A most valuable player award for the match
   * @type {string|null}
   * @private
   */
  #mvp = null

  /**
   * The court manager in charge of this match
   * @type {MatchManager|null}
   * @private
   */
  #manager = null

  /**
   * Whether the match is a friendly.  These matches do not contribute toward a league position.  If a team only participates in friendly matches then they are not included in the league table at all
   * @type {bool}
   * @private
   */
  #friendly

  /**
   * Free form string to add notes about a match
   * @type {string|null}
   * @private
   */
  #notes = null

  /**
   * The Group or "IfUnknown" this match is in
   * @type {IfUnknown}
   * @private
   */
  #ifUnknown

  /**
   * Creates an instance of IfUnknownMatch.
   * @param {IfUnknown} ifUnknown The Group or "IfUnknown" this match is in
   * @param {string} id An identifier for this match
   * @throws {Error} If the two teams have scores arrays of different lengths
   */
  constructor (ifUnknown, id) {
    if (ifUnknown.hasMatchWithID(id)) {
      throw new Error(`stage ID {${ifUnknown.getStage().getID()}}, ifUnknown: matches with duplicate IDs {${id}} not allowed`)
    }

    this.#ifUnknown = ifUnknown
    this.#id = id
    this.#court = null
    this.#venue = null
    this.#date = null
    this.#warmup = null
    this.#start = null
    this.#duration = null
    this.#homeTeam = null
    this.#awayTeam = null
    this.#officials = null
    this.#mvp = null
    this.#manager = null
    this.#friendly = null
    this.#notes = null
  }

  /**
   * Loads data from an object into the IfUnknownMatch instance
   * @param {object} matchData The data defining this Match
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   */
  loadFromData (matchData) {
    if (Object.hasOwn(matchData, 'court')) {
      this.setCourt(matchData.court)
    }
    if (Object.hasOwn(matchData, 'venue')) {
      this.setVenue(matchData.venue)
    }
    if (Object.hasOwn(matchData, 'date')) {
      this.setDate(matchData.date)
    }
    if (Object.hasOwn(matchData, 'warmup')) {
      this.setWarmup(matchData.warmup)
    }
    if (Object.hasOwn(matchData, 'start')) {
      this.setStart(matchData.start)
    }
    if (Object.hasOwn(matchData, 'duration')) {
      this.setDuration(matchData.duration)
    }
    if (Object.hasOwn(matchData, 'complete')) {
      this.setComplete(matchData.complete)
    }

    this.setHomeTeam(MatchTeam.loadFromData(this, matchData.homeTeam))
    this.setAwayTeam(MatchTeam.loadFromData(this, matchData.awayTeam))

    if (Object.hasOwn(matchData, 'officials')) {
      this.setOfficials(MatchOfficials.loadFromData(this, matchData.officials))
    }
    if (Object.hasOwn(matchData, 'mvp')) {
      this.setMVP(matchData.mvp)
    }
    if (Object.hasOwn(matchData, 'manager')) {
      this.setManager(MatchManager.loadFromData(this, matchData.manager))
    }
    if (Object.hasOwn(matchData, 'notes')) {
      this.setNotes(matchData.notes)
    }

    return this
  }

  /**
   * Returns the match data in a form suitable for serializing
   *
   * @returns {object} The match data
   */
  serialize () {
    const match = {}

    match.id = this.#id
    match.type = 'match'

    if (this.#court !== null) {
      match.court = this.#court
    }
    if (this.#venue !== null) {
      match.venue = this.#venue
    }

    if (this.#date !== null) {
      match.date = this.#date
    }
    if (this.#warmup !== null) {
      match.warmup = this.#warmup
    }
    if (this.#start !== null) {
      match.start = this.#start
    }
    if (this.#duration !== null) {
      match.duration = this.#duration
    }
    match.complete = false

    match.homeTeam = this.#homeTeam.serialize()
    match.awayTeam = this.#awayTeam.serialize()

    if (this.#officials !== null) {
      match.officials = this.#officials.serialize()
    }
    if (this.#mvp !== null) {
      match.mvp = this.#mvp
    }
    if (this.#manager !== null) {
      match.manager = this.#manager.serialize()
    }
    if (this.#notes !== null) {
      match.notes = this.#notes
    }
    return match
  }

  /**
   * Get the IfUnknown this match is in
   * @returns {IfUnknown} The IfUnknown instance this match is in
   */
  getIfUnknown () {
    return this.#ifUnknown
  }

  /**
   * Get the "IfUnknown" this match is in
   * @returns {Group|IfUnknown} The Group or IfUnknown instance this match is in
   */
  getGroup () {
    return this.#ifUnknown
  }

  /**
   * Set the completion status of the match
   * An "unknown" match cannot be complete, so this method does nothing.
   * @param {boolean} complete Whether the match is complete or not
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   */
  setComplete () {
    // "unknown" matches can't be complete, so ignore
    return this
  }

  /**
   * Check if the match is complete
   * An "unknown" match cannot be complete.
   * @returns {boolean} Always returns false
   */
  isComplete () {
    // "unknown" matches can't be complete
    return false
  }

  /**
   * Check if the match is a draw
   * Since an "unknown" match cannot be complete, it cannot be a draw either.
   * @returns {boolean} Always returns false
   */
  isDraw () {
    return false
  }

  /**
   * Get the ID of the match
   * @returns {string} The ID of the match
   */
  getID () {
    return this.#id
  }

  /**
   * Set the court where the match takes place
   * @param {string} court The court where the match takes place
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   * @throws {Error} If the court name is invalid
   */
  setCourt (court) {
    if (court.length > 1000 || court.length < 1) {
      throw new Error('Invalid court: must be between 1 and 1000 characters long')
    }
    this.#court = court
    return this
  }

  /**
   * Get the court where the match takes place
   * @returns {string|null} The court where the match takes place
   */
  getCourt () {
    return this.#court
  }

  /**
   * Set the venue where the match takes place
   * @param {string} venue The venue where the match takes place
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   * @throws {Error} If the venue name is invalid
   */
  setVenue (venue) {
    if (venue.length > 10000 || venue.length < 1) {
      throw new Error('Invalid venue: must be between 1 and 10000 characters long')
    }
    this.#venue = venue
    return this
  }

  /**
   * Get the venue where the match takes place
   * @returns {string|null} The venue where the match takes place
   */
  getVenue () {
    return this.#venue
  }

  /**
   * Set the date of the match
   * @param {string} date The date of the match (format: YYYY-MM-DD)
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   * @throws {Error} If the date is invalid
   */
  setDate (date) {
    if (!/^[0-9]{4}-(0[0-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(date)) {
      throw new Error(`Invalid date "${date}": must contain a value of the form "YYYY-MM-DD"`)
    }

    const d = new Date(date)
    if (`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${(d.getDate()).toString().padStart(2, '0')}` !== date) {
      throw new Error(`Invalid date "${date}": date does not exist`)
    }

    this.#date = date
    return this
  }

  /**
   * Get the date of the match
   * @returns {string|null} The date of the match (format: YYYY-MM-DD)
   */
  getDate () {
    return this.#date
  }

  /**
   * Set the warmup start time of the match
   * @param {string} warmup The warmup start time of the match (format: HH:mm)
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   * @throws {Error} If the warmup time is invalid
   */
  setWarmup (warmup) {
    if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(warmup)) {
      throw new Error(`Invalid warmup time "${warmup}": must contain a value of the form "HH:mm" using a 24 hour clock`)
    }
    this.#warmup = warmup
    return this
  }

  /**
   * Get the warmup start time of the match
   * @returns {string|null} The warmup start time of the match (format: HH:mm)
   */
  getWarmup () {
    return this.#warmup
  }

  /**
   * Set the duration for the match
   * @param {string} duration The duration for the match in the format "HH:mm"
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   * @throws {Error} If the duration is invalid
   */
  setDuration (duration) {
    if (!/^[0-9]+:[0-5][0-9]$/.test(duration)) {
      throw new Error(`Invalid duration "${duration}": must contain a value of the form "HH:mm"`)
    }
    this.#duration = duration
    return this
  }

  /**
   * Get the duration for the match
   * @returns {string|null} The duration for the match in the format "HH:mm"
   */
  getDuration () {
    return this.#duration
  }

  /**
   * Set the start time of the match
   * @param {string} start The start time of the match (format: HH:mm)
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   * @throws {Error} If the start time is invalid
   */
  setStart (start) {
    if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(start)) {
      throw new Error(`Invalid start time "${start}": must contain a value of the form "HH:mm" using a 24 hour clock`)
    }
    this.#start = start
    return this
  }

  /**
   * Get the start time of the match
   * @returns {string|null} The start time of the match (format: HH:mm)
   */
  getStart () {
    return this.#start
  }

  /**
   * Set the manager for the match
   * @param {MatchManager} manager The manager for the match
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   */
  setManager (manager) {
    this.#manager = manager
    return this
  }

  /**
   * Get the manager for the match
   * @returns {MatchManager|null} The manager for the match
   */
  getManager () {
    return this.#manager
  }

  /**
   * Set the Most Valuable Player (MVP) for the match
   * @param {string} mvp The Most Valuable Player for the match
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   * @throws {Error} If the MVP string is invalid
   */
  setMVP (mvp) {
    if (mvp.length > 203 || mvp.length < 1) {
      throw new Error('Invalid MVP: must be between 1 and 203 characters long')
    }
    this.#mvp = mvp
    return this
  }

  /**
   * Get the Most Valuable Player (MVP) for the match
   * @returns {string|null} The Most Valuable Player for the match
   */
  getMVP () {
    return this.#mvp
  }

  /**
   * Set notes for the match
   * @param {string} notes Notes about the match
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   */
  setNotes (notes) {
    this.#notes = notes
    return this
  }

  /**
   * Get notes for the match
   * @returns {string|null} Notes about the match
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Set whether the match is a friendly match
   * @param {boolean} friendly Whether the match is a friendly match
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   */
  setFriendly (friendly) {
    this.#friendly = friendly
    return this
  }

  /**
   * Check if the match is a friendly match
   * @returns {boolean} Whether the match is a friendly match
   */
  isFriendly () {
    return this.#friendly
  }

  /**
   * Set the officials for the match
   * @param {MatchOfficials} officials The officials for the match
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   */
  setOfficials (officials) {
    this.#officials = officials
    return this
  }

  /**
   * Get the officials for the match
   * @returns {MatchOfficials|null} The officials for the match
   */
  getOfficials () {
    return this.#officials
  }

  /**
   * Check if the match has officials assigned
   * @returns {boolean} Whether the match has officials assigned
   */
  hasOfficials () {
    return !!this.#officials
  }

  /**
   * Get the ID of the winning team
   *
   * @return {string} The ID of the winning team
   */
  getWinnerTeamID () {
    return CompetitionTeam.UNKNOWN_TEAM_ID
  }

  /**
   * Get the ID of the losing team
   *
   * @return {string} The ID of the losing team
   */
  getLoserTeamID () {
    return CompetitionTeam.UNKNOWN_TEAM_ID
  }

  /**
   * Get the scores of the home team
   *
   * @return {array} The scores of the home team
   */
  getHomeTeamScores () {
    return []
  }

  /**
   * Get the scores of the away team
   *
   * @return {array} The scores of the away team
   */
  getAwayTeamScores () {
    return []
  }

  /**
   * Get the number of sets won by the home team
   *
   * @return {number} The number of sets won by the home team
   */
  getHomeTeamSets () {
    return 0
  }

  /**
   * Get the number of sets won by the away team
   *
   * @return {number} The number of sets won by the away team
   */
  getAwayTeamSets () {
    return 0
  }

  /**
   * Set the away team for the match
   * @param {MatchTeam} awayTeam The away team for the match
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   */
  setAwayTeam (awayTeam) {
    this.#awayTeam = awayTeam
    return this
  }

  /**
   * Get the away team for the match
   * @returns {MatchTeam|null} The away team for the match
   */
  getAwayTeam () {
    return this.#awayTeam
  }

  /**
   * Set the home team for the match
   * @param {MatchTeam} homeTeam The home team for the match
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   */
  setHomeTeam (homeTeam) {
    this.#homeTeam = homeTeam
    return this
  }

  /**
   * Get the home team for the match
   * @returns {MatchTeam|null} The home team for the match
   */
  getHomeTeam () {
    return this.#homeTeam
  }

  /**
   * An IfUnknown match has no scores so this function has no effect
   *
   * @return IfUnknownMatch The updated IfUnknownMatch instance
   */
  setScores () {
    return this
  }
}

export default IfUnknownMatch
