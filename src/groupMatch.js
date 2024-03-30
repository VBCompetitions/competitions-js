import Group from './group.js'
import MatchManager from './matchManager.js'
import MatchOfficials from './matchOfficials.js'
import MatchTeam from './matchTeam.js'
import MatchType from './matchType.js'

/**
 * A match between two teams
 */
class GroupMatch {
  /**
   * An identifier for this match, i.e. a match number.  If the document uses any team references then all match
   * identifiers in the document must be unique or a document reader's behaviour is undefined
   */
  #id

  /** The court that a match takes place on */
  #court

  /** The venue that a match takes place at */
  #venue

  /** The date of the match */
  #date

  /** The start time for the warmup */
  #warmup

  /** The start time for the match */
  #start

  /** The maximum duration of the match */
  #duration

  /** Whether the match is complete. This must be set when matchType is "continuous" or when a match has a "duration".  This is the value in the loaded data */
  #complete

  /** The 'home' team for the match */
  #homeTeam

  /** The 'away' team for the match */
  #awayTeam

  /** The officials for this match */
  #officials

  /** A most valuable player award for the match */
  #mvp

  /** The court manager in charge of this match */
  #manager

  /** Whether the match is a friendly.  These matches do not contribute toward a league position.  If a team only participates in friendly matches then they are not included in the league table at all */
  #friendly

  /** Free form string to add notes about a match */
  #notes

  /** Whether the match is complete as a calculated value.  When the data sets a value, this is the same, but when a match completion must be calculated, this is the calculated version */
  #isComplete

  #isDraw
  #winnerTeamID
  #loserTeamID
  #homeTeamSets
  #awayTeamSets
  #homeTeamScores
  #awayTeamScores
  #group

  /**
   * @param {Group} group The Group this match is in
   * @param {string} id The identifier for this match
   * @throws {Error} If the two teams have scores arrays of different lengths
   */
  constructor (group, id) {
    if (group.hasMatchWithID(id)) {
      throw new Error(`Group {${group.getStage().getID()}:${group.getID()}}: matches with duplicate IDs {${id}} not allowed`)
    }
    this.#group = group
    this.#id = id
    this.#court = null
    this.#venue = null
    this.#date = null
    this.#warmup = null
    this.#start = null
    this.#duration = null
    this.#complete = null
    this.#officials = null
    this.#mvp = null
    this.#manager = null
    this.#friendly = false
    this.#notes = null
    this.#isComplete = false
    this.#isDraw = false
    this.#homeTeamSets = 0
    this.#awayTeamSets = 0
  }

  /**
   * Contains the match data, creating any metadata needed
   *
   * @param {object} matchData The data defining this Match
   * @returns {GroupMatch} The loaded GroupMatch object
   * @throws {Error} If the two teams have scores arrays of different lengths
   */
  loadFromData (matchData) {
    if (matchData.court) {
      this.setCourt(matchData.court)
    }
    if (matchData.venue) {
      this.setVenue(matchData.venue)
    }
    if (matchData.date) {
      this.setDate(matchData.date)
    }
    if (matchData.warmup) {
      this.setWarmup(matchData.warmup)
    }
    if (matchData.start) {
      this.setStart(matchData.start)
    }
    if (matchData.duration) {
      this.setDuration(matchData.duration)
    }
    if (matchData.complete !== undefined) {
      this.setComplete(matchData.complete)
    } else {
      if (this.#group.getMatchType() === MatchType.CONTINUOUS) {
        throw new Error(`Group {${this.#group.getStage().getID()}:${this.#group.getID()}}, match ID {${matchData.id}}, missing field "complete"`)
      }
    }

    this.setHomeTeam(MatchTeam.loadFromData(this, matchData.homeTeam))
    this.setAwayTeam(MatchTeam.loadFromData(this, matchData.awayTeam))

    this.#homeTeamScores = matchData.homeTeam.scores
    this.#awayTeamScores = matchData.awayTeam.scores

    if (matchData.officials) {
      const officials = MatchOfficials.loadFromData(this, matchData.officials)
      if (officials.isTeam() && (officials.getTeamID() === this.getHomeTeam().getID() || officials.getTeamID() === this.getAwayTeam().getID())) {
        throw new Error(`Refereeing team (in match {${this.#group.getStage().getID()}:${this.#group.getID()}:${this.getID()}}) cannot be the same as one of the playing teams`)
      }
      this.setOfficials(officials)
    }
    if (matchData.mvp) {
      this.setMVP(matchData.mvp)
    }
    if (matchData.manager) {
      this.setManager(MatchManager.loadFromData(this, matchData.manager))
    }
    if (matchData.notes) {
      this.setNotes(matchData.notes)
    }
    if (matchData.friendly !== undefined) {
      this.setFriendly(matchData.friendly)
    }

    this.#calculateResult()

    return this
  }

  /**
   * Return the match data in a form suitable for serializing
   *
   * @returns {object} The serialized match data
   */
  serialize () {
    const match = {
      id: this.#id
    }

    if (this.#court !== null) {
      match.court = this.#court
    }
    if (this.#venue !== null) {
      match.venue = this.#venue
    }

    match.type = 'match'

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
    if (this.#complete !== null) {
      match.complete = this.#complete
    }

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
   * Get the Group this match is in
   *
   * @returns {Group|IfUnknown} The Group this match is in
   */
  getGroup () {
    return this.#group
  }

  /**
   * Get the ID for this match
   *
   * @returns {string} The ID for this match
   */
  getID () {
    return this.#id
  }

  /**
   * Set the court for this match
   *
   * @param {string|null} court The court for this match
   * @returns {GroupMatch} The GroupMatch object
   */
  setCourt (court) {
    this.#court = court
    return this
  }

  /**
   * Get the court for this match
   *
   * @returns {string|null} The court for this match
   */
  getCourt () {
    return this.#court
  }

  /**
   * Check if the match has a court
   *
   * @returns {boolean} True if the match has a court, false otherwise
   */
  hasCourt () {
    return this.#court !== null
  }

  /**
   * Set the venue for this match
   *
   * @param {string|null} venue The venue for this match
   * @returns {GroupMatch} The GroupMatch object
   */
  setVenue (venue) {
    this.#venue = venue
    return this
  }

  /**
   * Get the venue for this match
   *
   * @returns {string|null} The venue for this match
   */
  getVenue () {
    return this.#venue
  }

  /**
   * Check if the match has a venue
   *
   * @returns {boolean} True if the match has a venue, false otherwise
   */
  hasVenue () {
    return this.#venue !== null
  }

  /**
   * Set the date for this match
   *
   * @param {string|null} date The date for this match
   * @returns {GroupMatch} The GroupMatch object
   */
  setDate (date) {
    this.#date = date
    return this
  }

  /**
   * Get the date for this match
   *
   * @returns {string|null} The date for this match
   */
  getDate () {
    return this.#date
  }

  /**
   * Check if the match has a date
   *
   * @returns {boolean} True if the match has a date, false otherwise
   */
  hasDate () {
    return this.#date !== null
  }

  /**
   * Set the warmup time for this match
   *
   * @param {string|null} warmup The warmup time for this match
   * @returns {GroupMatch} The GroupMatch object
   */
  setWarmup (warmup) {
    this.#warmup = warmup
    return this
  }

  /**
   * Get the warmup time for this match
   *
   * @returns {string|null} The warmup time for this match
   */
  getWarmup () {
    return this.#warmup
  }

  /**
   * Check if the match has a warmup time
   *
   * @returns {boolean} True if the match has a warmup time, false otherwise
   */
  hasWarmup () {
    return this.#warmup !== null
  }

  /**
   * Set the start time for this match
   *
   * @param {string|null} start The start time for this match
   * @returns {GroupMatch} The GroupMatch object
   */
  setStart (start) {
    this.#start = start
    return this
  }

  /**
   * Get the start time for this match
   *
   * @returns {string|null} The start time for this match
   */
  getStart () {
    return this.#start
  }

  /**
   * Check if the match has a start time
   *
   * @returns {boolean} True if the match has a start time, false otherwise
   */
  hasStart () {
    return this.#start !== null
  }

  /**
   * Set the duration for this match
   *
   * @param {string|null} duration The duration for this match
   * @returns {GroupMatch} The GroupMatch object
   */
  setDuration (duration) {
    this.#duration = duration
    return this
  }

  /**
   * Get the duration for this match
   *
   * @returns {string|null} The duration for this match
   */
  getDuration () {
    return this.#duration
  }

  /**
   * Check if the match has a duration
   *
   * @returns {boolean} True if the match has a duration, false otherwise
   */
  hasDuration () {
    return this.#duration !== null
  }

  /**
   * Set the completeness for this match
   *
   * @param {boolean} complete The completeness for this match
   * @returns {void}
   */
  setComplete (complete) {
    this.#complete = complete
    this.#isComplete = complete
  }

  /**
   * Get the completeness for this match.
   * This is the explicit "complete" value from the original data
   *
   * @returns {boolean|null} The completeness for this match
   */
  getComplete () {
    return this.#complete
  }

  /**
   * Get the <i>calculated</i> completeness for this match. This is for when the data does not explicitly state
   * the completeness, but the match configuration allows us to calculate whether the match is complete (e.g. set-based
   * matches without a duration limit)
   *
   * @returns {boolean} The completeness for this match
   */
  isComplete () {
    return this.#isComplete
  }

  /**
   * Get whether the match is a draw
   *
   * @returns {boolean} Whether the match is a draw
   */
  isDraw () {
    return this.#isDraw
  }

  /**
   * Set the home team for this match
   *
   * @param {MatchTeam} homeTeam The home team for this match
   * @returns {GroupMatch} The GroupMatch object
   */
  setHomeTeam (homeTeam) {
    this.#homeTeam = homeTeam
    return this
  }

  /**
   * Get the home team for this match
   *
   * @returns {MatchTeam} The home team for this match
   */
  getHomeTeam () {
    return this.#homeTeam
  }

  /**
   * Get the home team scores
   *
   * @returns {Array} The home team scores
   */
  getHomeTeamScores () {
    return [...this.#homeTeamScores]
  }

  /**
   * Get the number of sets won by the home team
   *
   * @returns {number} The number of sets won by the home team
   * @throws {Error} If the match type is continuous
   */
  getHomeTeamSets () {
    if (this.#group.getMatchType() === MatchType.CONTINUOUS) {
      throw new Error('Match has no sets because the match type is continuous')
    }
    return this.#homeTeamSets
  }

  /**
   * Set the away team for this match
   *
   * @param {MatchTeam} awayTeam The away team for this match
   * @returns {GroupMatch} The GroupMatch object
   */
  setAwayTeam (awayTeam) {
    this.#awayTeam = awayTeam
    return this
  }

  /**
   * Get the away team for this match
   *
   * @returns {MatchTeam} The away team for this match
   */
  getAwayTeam () {
    return this.#awayTeam
  }

  /**
   * Get the away team scores
   *
   * @returns {Array} The away team scores
   */
  getAwayTeamScores () {
    return [...this.#awayTeamScores]
  }

  /**
   * Get the number of sets won by the away team
   *
   * @returns {number} The number of sets won by the away team
   * @throws {Error} If the match type is continuous
   */
  getAwayTeamSets () {
    if (this.#group.getMatchType() === MatchType.CONTINUOUS) {
      throw new Error('Match has no sets because the match type is continuous')
    }
    return this.#awayTeamSets
  }

  /**
   * Set the officials for this match
   *
   * @param {MatchOfficials|null} officials The officials for this match
   * @returns {GroupMatch} The GroupMatch object
   */
  setOfficials (officials) {
    this.#officials = officials
    return this
  }

  /**
   * Get the officials for this match
   *
   * @returns {MatchOfficials|null} The officials for this match
   */
  getOfficials () {
    return this.#officials
  }

  /**
   * Check if the match has officials
   *
   * @returns {boolean} True if the match has officials, false otherwise
   */
  hasOfficials () {
    return this.#officials !== null
  }

  /**
   * Set the MVP for this match
   *
   * @param {string|null} mvp The MVP for this match
   * @returns {GroupMatch} The GroupMatch object
   */
  setMVP (mvp) {
    this.#mvp = mvp
    return this
  }

  /**
   * Get the MVP for this match
   *
   * @returns {string|null} The MVP for this match
   */
  getMVP () {
    return this.#mvp
  }

  /**
   * Check if the match has an MVP
   *
   * @returns {boolean} True if the match has an MVP, false otherwise
   */
  hasMVP () {
    return this.#mvp !== null
  }

  /**
   * Set the court manager for this match
   *
   * @param {MatchManager|null} manager The court manager for this match
   * @returns {GroupMatch} The GroupMatch object
   */
  setManager (manager) {
    this.#manager = manager
    return this
  }

  /**
   * Get the court manager for this match
   *
   * @returns {MatchManager|null} The court manager for this match
   */
  getManager () {
    return this.#manager
  }

  /**
   * Check if the match has a court manager
   *
   * @returns {boolean} True if the match has a court manager, false otherwise
   */
  hasManager () {
    return this.#manager !== null
  }

  /**
   * Set the notes for this match
   *
   * @param {string|null} notes The notes for this match
   * @returns {GroupMatch} The GroupMatch object
   */
  setNotes (notes) {
    this.#notes = notes
    return this
  }

  /**
   * Get the notes for this match
   *
   * @returns {string|null} The notes for this match
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Check if the match has notes
   *
   * @returns {boolean} True if the match has notes, false otherwise
   */
  hasNotes () {
    return this.#notes !== null
  }

  /**
   * Set whether the match is a friendly match
   *
   * @param {boolean} friendly Whether the match is friendly or not
   * @returns {GroupMatch} The GroupMatch object
   */
  setFriendly (friendly) {
    this.#friendly = friendly
    return this
  }

  /**
   * Check if the match is a friendly match
   *
   * @returns {boolean} Whether the match is friendly or not
   */
  isFriendly () {
    return this.#friendly
  }

  /**
   * Set the scores for this match
   *
   * @param {Array<number>} homeTeamScores The score array for the home team
   * @param {Array<number>} awayTeamScores The score array for the away team
   * @param {boolean|null} complete Whether the match is complete or not (required for continuous scoring matches)
   * @returns {GroupMatch} The GroupMatch object
   * @throws {Error} If the scores are invalid
   */
  setScores (homeTeamScores, awayTeamScores, complete = null) {
    if (this.#group.getMatchType() === MatchType.CONTINUOUS) {
      if (complete === null) {
        throw new Error('Invalid score: match type is continuous, but the match completeness is not set')
      }
      GroupMatch.assertContinuousScoresValid(homeTeamScores, awayTeamScores, this.#group)
      this.setComplete(complete)
    } else {
      GroupMatch.assertSetScoresValid(homeTeamScores, awayTeamScores, this.#group.getSetConfig())
      if (this.#duration !== null && complete === null) {
        throw new Error('Invalid results: match type is sets and match has a duration, but the match completeness is not set')
      }
      if (complete !== null) {
        this.setComplete(complete)
      }
    }
    this.#homeTeamScores = homeTeamScores
    this.#awayTeamScores = awayTeamScores
    this.#calculateResult()
    return this
  }

  /**
   * Calculate the result information for this match.
   * For example, is the match complete, who won, how many sets did each team score, are the results valid
   *
   * @throws {Error} If the scores are invalid
   * @private
   */
  #calculateResult () {
    if (this.#homeTeam.getScores().length !== this.#awayTeam.getScores().length) {
      throw new Error(`Invalid match information for match ${this.#id}: team scores have different length`)
    }

    if (this.#group.getMatchType() === MatchType.CONTINUOUS) {
      this.#calculateContinuousResult()
    } else {
      if (this.#homeTeam.getScores().length > this.#group.getSetConfig().getMaxSets()) {
        throw new Error(`Invalid match information (in match {${this.#group.getStage().getID()}:${this.#group.getID()}:${this.#id}}): team scores have more sets than the maximum allowed length`)
      }
      try {
        this.#calculateSetsResult()
      } catch (err) {
        throw new Error(err.message)
      }
    }
  }

  /**
   * Calculate the result information for this match, when the scores are continuous
   *
   * @throws {Error} If the match shows a draw but draws are not allowed
   * @private
   */
  #calculateContinuousResult () {
    if (this.#homeTeam.getScores().length === 0) {
      return
    }
    if (this.#homeTeam.getScores()[0] + this.#awayTeam.getScores()[0] === 0) {
      return
    }

    if (this.#isComplete) {
      if (this.#homeTeam.getScores()[0] > this.#awayTeam.getScores()[0]) {
        this.#winnerTeamID = this.#homeTeam.getID()
        this.#loserTeamID = this.#awayTeam.getID()
      } else if (this.#homeTeam.getScores()[0] < this.#awayTeam.getScores()[0]) {
        this.#winnerTeamID = this.#awayTeam.getID()
        this.#loserTeamID = this.#homeTeam.getID()
      } else if (this.#group.getDrawsAllowed()) {
        this.#isDraw = true
      } else {
        throw new Error(`Invalid match information (in match {${this.#group.getStage().getID()}:${this.#group.getID()}:${this.#id}}): scores show a draw but draws are not allowed`)
      }
    }
  }

  /**
   * Check that the continuous scores are valid
   *
   * @param {Array<number>} homeTeamScores The home team's scores
   * @param {Array<number>} awayTeamScores The away team's scores
   * @param {object} groupConfig The configuration for the group this match is in
   * @throws {Error} If the scores are invalid
   * @static
   */
  static assertContinuousScoresValid (homeTeamScores, awayTeamScores, groupConfig) {
    const scoreLength = homeTeamScores.length
    if (scoreLength > 1) {
      throw new Error('Invalid results: match type is continuous, but score length is greater than one')
    }
    if (groupConfig instanceof Group) {
      if (!groupConfig.getDrawsAllowed() && homeTeamScores[0] === awayTeamScores[0] && homeTeamScores[0] !== 0) {
        throw new Error('Invalid score: draws not allowed in this group')
      }
    } else {
      if (groupConfig.drawsAllowed !== undefined && !groupConfig.drawsAllowed && homeTeamScores[0] === awayTeamScores[0] && homeTeamScores[0] !== 0) {
        throw new Error('Invalid score: draws not allowed in this group')
      }
    }
  }

  /**
   * Calculate the result information for this match, when the match is played to multiple sets
   *
   * @throws {Error} If the scores are invalid
   * @private
   */
  #calculateSetsResult () {
    this.constructor.assertSetScoresValid(this.#homeTeam.getScores(), this.#awayTeam.getScores(), this.#group.getSetConfig())

    const maxSets = this.#group.getSetConfig().getMaxSets()
    const setsToWin = this.#group.getSetConfig().getSetsToWin()
    const scoreLength = this.#homeTeam.getScores().length

    this.#homeTeamSets = 0
    this.#awayTeamSets = 0
    for (let setNumber = 0; setNumber < scoreLength; setNumber++) {
      if (this.#homeTeam.getScores()[setNumber] < this.#group.getSetConfig().getMinPoints() && this.#awayTeam.getScores()[setNumber] < this.#group.getSetConfig().getMinPoints()) {
        continue
      }
      if (this.#isComplete || GroupMatch.#isSetComplete(setNumber, this.#homeTeam.getScores()[setNumber], this.#awayTeam.getScores()[setNumber], this.#group.getSetConfig())) {
        if (this.#homeTeam.getScores()[setNumber] > this.#awayTeam.getScores()[setNumber]) {
          this.#homeTeamSets++
        } else if (this.#homeTeam.getScores()[setNumber] < this.#awayTeam.getScores()[setNumber]) {
          this.#awayTeamSets++
        }
      }
    }

    if (this.#duration === null &&
        (this.#homeTeamSets + this.#awayTeamSets === maxSets || this.#homeTeamSets >= setsToWin || this.#awayTeamSets >= setsToWin)) {
      this.#isComplete = true
    }

    if (this.#isComplete) {
      if (this.#homeTeamSets > this.#awayTeamSets) {
        this.#winnerTeamID = this.#homeTeam.getID()
        this.#loserTeamID = this.#awayTeam.getID()
      } else if (this.#homeTeamSets < this.#awayTeamSets) {
        this.#winnerTeamID = this.#awayTeam.getID()
        this.#loserTeamID = this.#homeTeam.getID()
      } else if (this.#group.getDrawsAllowed()) {
        this.#isDraw = true
      } else {
        throw new Error(`Invalid match information (in match {${this.#group.getStage().getID()}:${this.#group.getID()}:${this.#id}}): scores show a draw but draws are not allowed`)
      }
    }
  }

  /**
   * Check that the set scores are valid
   *
   * @param {number[]} homeTeamScores The home team's scores
   * @param {number[]} awayTeamScores The away team's scores
   * @param {SetConfig} setConfig The set configuration for this match
   * @throws {Error} If the scores are invalid
   */
  static assertSetScoresValid (homeTeamScores, awayTeamScores, setConfig) {
    const homeScoreLength = homeTeamScores.length
    const awayScoreLength = awayTeamScores.length

    if (homeScoreLength !== awayScoreLength) {
      throw new Error('Invalid set scores: score arrays are different lengths')
    }

    if (homeScoreLength > setConfig.getMaxSets()) {
      throw new Error('Invalid set scores: score arrays are longer than the maximum number of sets allowed')
    }

    let seenIncompleteSet = false
    for (let setNumber = 0; setNumber < homeScoreLength; setNumber++) {
      if (seenIncompleteSet && (homeTeamScores[setNumber] !== 0 || awayTeamScores[setNumber] !== 0)) {
        throw new Error('Invalid set scores: data contains non-zero scores for a set after an incomplete set')
      }

      const deciderSet = (setNumber === setConfig.getMaxSets() - 1)
      const clearByPoints = Math.abs(homeTeamScores[setNumber] - awayTeamScores[setNumber])
      if (deciderSet) {
        if (clearByPoints > setConfig.getClearPoints() && Math.min(homeTeamScores[setNumber], awayTeamScores[setNumber]) > setConfig.getLastSetPointsToWin()) {
          if (homeTeamScores[setNumber] > awayTeamScores[setNumber]) {
            throw new Error(`Invalid set scores: value for set score at index ${setNumber} shows home team scoring more points than necessary to win the set`)
          } else {
            throw new Error(`Invalid set scores: value for set score at index ${setNumber} shows away team scoring more points than necessary to win the set`)
          }
        }
      } else {
        if (!GroupMatch.#isMidSetComplete(homeTeamScores[setNumber], awayTeamScores[setNumber], clearByPoints, setConfig)) {
          seenIncompleteSet = true
        }
      }
    }
  }

  /**
   * Work out whether the set is complete or not, first establishing whether this is the deciding set or not
   *
   * @param {number} setNumber The set number being checked
   * @param {number} homeScore The home team's score in this set
   * @param {number} awayScore The away team's score in this set
   * @param {SetConfig} setConfig The set configuration for this match
   * @returns {boolean} Whether the set is complete or not
   */
  static #isSetComplete (setNumber, homeScore, awayScore, setConfig) {
    const deciderSet = (setNumber === setConfig.getMaxSets() - 1)
    if (deciderSet) {
      return GroupMatch.#isDeciderSetComplete(homeScore, awayScore, Math.abs(homeScore - awayScore), setConfig)
    } else {
      return GroupMatch.#isMidSetComplete(homeScore, awayScore, Math.abs(homeScore - awayScore), setConfig)
    }
  }

  /**
   * Work out whether the set is complete or not, when this is not the deciding set
   *
   * @param {number} homeScore The home team's score in this set
   * @param {number} awayScore The away team's score in this set
   * @param {number} clearByPoints The number of points clear a team must be
   * @param {SetConfig} setConfig The set configuration for this match
   * @returns {boolean} Whether the set is complete or not
   */
  static #isMidSetComplete (homeScore, awayScore, clearByPoints, setConfig) {
    const hasEnoughPoints = homeScore >= setConfig.getPointsToWin() || awayScore >= setConfig.getPointsToWin()
    const isClearByEnoughPoints = clearByPoints >= setConfig.getClearPoints()
    const hasScoredMaximumPoints = (homeScore === setConfig.getMaxPoints() || awayScore === setConfig.getMaxPoints())
    return (hasEnoughPoints && isClearByEnoughPoints) || hasScoredMaximumPoints
  }

  /**
   * Work out whether the set is complete or not, when this is the deciding set
   *
   * @param {number} homeScore The home team's score in this set
   * @param {number} awayScore The away team's score in this set
   * @param {number} clearByPoints The number of points clear a team must be
   * @param {SetConfig} setConfig The set configuration for this match
   * @returns {boolean} Whether the set is complete or not
   */
  static #isDeciderSetComplete (homeScore, awayScore, clearByPoints, setConfig) {
    const hasEnoughPoints = homeScore >= setConfig.getLastSetPointsToWin() || awayScore >= setConfig.getLastSetPointsToWin()
    const isClearByEnoughPoints = clearByPoints >= setConfig.getClearPoints()
    const hasScoredMaximumPoints = (homeScore === setConfig.getLastSetMaxPoints() || awayScore === setConfig.getLastSetMaxPoints())
    return (hasEnoughPoints && isClearByEnoughPoints) || hasScoredMaximumPoints
  }

  /**
   * Get the ID of the winning team
   *
   * @returns {string} The ID of the winning team
   * @throws {Error} If the match does not have a winner
   */
  getWinnerTeamID () {
    if (!this.#isComplete) {
      throw new Error('Match incomplete, there is no winner')
    }

    if (this.#isDraw) {
      throw new Error('Match drawn, there is no winner')
    }

    return this.#winnerTeamID
  }

  /**
   * Get the ID of the losing team
   *
   * @returns {string} The ID of the loser team
   * @throws {Error} If the match does not have a loser
   */
  getLoserTeamID () {
    if (!this.#isComplete) {
      throw new Error('Match incomplete, there is no loser')
    }

    if (this.#isDraw) {
      throw new Error('Match drawn, there is no loser')
    }

    return this.#loserTeamID
  }
}

export default GroupMatch
