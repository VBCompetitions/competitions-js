import IfUnknownBreak from './ifUnknownBreak.js'
import IfUnknownMatch from './ifUnknownMatch.js'
import MatchType from './matchType.js'

/**
 * It can be useful to still present something to the user about the later stages of a competition,
 * even if the teams playing in that stage is not yet known. This defines what should be presented
 * in any application handling this competition's data in such cases.
 */
class IfUnknown {
  /**
   * An array of string values to be presented in the case that the teams in this stage are not yet known, typically as an explanation of what this stage will contain (e.g. 'The crossover games will be between the top two teams in each pool')
   * @type {array}
   * @private
   */
  #description

  /**
   * An array of matches in this group (or breaks in play)
   * @type {array}
   * @private
   */
  #matches

  /**
   * The Stage this IfUnknown is in
   * @type {Stage}
   * @private
   */
  #stage

  /**
   * Whether matches have courts
   * @type {bool}
   * @private
   */
  #matchesHaveCourts

  /**
   * Whether matches have dates
   * @type {bool}
   * @private
   */
  #matchesHaveDates

  /**
   * Whether matches have durations
   * @type {bool}
   * @private
   */
  #matchesHaveDurations

  /**
   * Whether matches have MVPs
   * @type {bool}
   * @private
   */
  #matchesHaveMVPs

  /**
   * Whether matches have managers
   * @type {bool}
   * @private
   */
  #matchesHaveManagers

  /**
   * Whether matches have notes
   * @type {bool}
   * @private
   */
  #matchesHaveNotes

  /**
   * Whether matches have officials
   * @type {bool}
   * @private
   */
  #matchesHaveOfficials

  /**
   * Whether matches have starts
   * @type {bool}
   * @private
   */
  #matchesHaveStarts

  /**
   * Whether matches have venues
   * @type {bool}
   * @private
   */
  #matchesHaveVenues

  /**
   * Whether matches have warmups
   * @type {bool}
   * @private
   */
  #matchesHaveWarmups

  /**
   * A Lookup table from match IDs to that match
   * @type {Object}
   * @private
   */
  #matchLookup

  /**
   * @param {Stage} stage A link back to the Stage this IfUnknown is in
   * @param {string[]} description An array of string values to be presented in the case that
   * the teams in this stage are not yet known
   */
  constructor (stage, description) {
    this.#stage = stage
    this.#description = description
    this.#matches = []
    this.#matchesHaveCourts = false
    this.#matchesHaveDates = false
    this.#matchesHaveDurations = false
    this.#matchesHaveMVPs = false
    this.#matchesHaveManagers = false
    this.#matchesHaveNotes = false
    this.#matchesHaveOfficials = false
    this.#matchesHaveStarts = false
    this.#matchesHaveVenues = false
    this.#matchesHaveWarmups = false
    this.#matchLookup = {}
  }

  /**
   * Load data from an object into the IfUnknown instance
   *
   * @param {object} ifUnknownData The data defining this IfUnknown
   * @returns {IfUnknown} The IfUnknown instance
   */
  loadFromData (ifUnknownData) {
    ifUnknownData.matches.forEach(match => {
      if (match.type === 'match') {
        const newMatch = new IfUnknownMatch(this, match.id)
        newMatch.loadFromData(match)
        this.addMatch(newMatch)
      } else if (match.type === 'break') {
        this.addBreak((new IfUnknownBreak(this)).loadFromData(match))
      }
    })
    return this
  }

  /**
   * Return the "ifUnknown" data in a form suitable for serializing
   *
   * @returns {object} The serialized IfUnknown data
   */
  serialize () {
    const ifUnknown = {
      description: this.#description,
      matches: []
    }
    this.#matches.forEach(match => [
      ifUnknown.matches.push(match.serialize())
    ])
    return ifUnknown
  }

  /**
   * Get the stage this IfUnknown belongs to
   *
   * @returns {Stage} The Stage instance
   */
  getStage () {
    return this.#stage
  }

  /**
   * Get the competition this IfUnknown belongs to
   *
   * @returns {Competition} The Competition instance
   */
  getCompetition () {
    return this.#stage.getCompetition()
  }

  /**
   * Get the description of this IfUnknown
   *
   * @returns {string[]} The description array
   */
  getDescription () {
    return this.#description
  }

  /**
   * Add a match to this IfUnknown
   *
   * @param {IfUnknownMatch} match The match to add
   * @returns {IfUnknown} The IfUnknown instance
   */
  addMatch (match) {
    this.#matches.push(match)
    this.#matchLookup[match.getID()] = match
    if (match.getCourt() !== null) {
      this.#matchesHaveCourts = true
    }
    if (match.getDate() !== null) {
      this.#matchesHaveDates = true
    }
    if (match.getDuration() !== null) {
      this.#matchesHaveDurations = true
    }
    if (match.getMVP() !== null) {
      this.#matchesHaveMVPs = true
    }
    if (match.getManager() !== null) {
      this.#matchesHaveManagers = true
    }
    if (match.getNotes() !== null) {
      this.#matchesHaveNotes = true
    }
    if (match.getOfficials() !== null) {
      this.#matchesHaveOfficials = true
    }
    if (match.getStart() !== null) {
      this.#matchesHaveStarts = true
    }
    if (match.getVenue() !== null) {
      this.#matchesHaveVenues = true
    }
    if (match.getWarmup() !== null) {
      this.#matchesHaveWarmups = true
    }
    return this
  }

  /**
   * Add a break to this IfUnknown
   *
   * @param {IfUnknownBreak} break The break to add
   * @returns {IfUnknown} The IfUnknown instance
   */
  addBreak (breakObj) {
    this.#matches.push(breakObj)
    return this
  }

  /**
   * Get the matches in this IfUnknown
   *
   * @returns {Array} Array of matches
   */
  getMatches () {
    return this.#matches
  }

  /**
   * Check if a match with the given ID exists in this IfUnknown
   *
   * @param {mixed} id The ID of the match
   * @returns {boolean} True if match exists, false otherwise
   */
  hasMatch (id) {
    return Object.hasOwn(this.#matchLookup, id)
  }

  /**
   * Get the IDs of the teams in this IfUnknown
   *
   * @returns {Array} Array of team IDs
   */
  getTeamIDs () {
    return []
  }

  /**
   * Get the match type of this IfUnknown
   *
   * @returns {MatchType} The match type
   */
  getMatchType () {
    return MatchType.CONTINUOUS
  }

  /**
   * Get the match with the specified ID
   *
   * @param {string} id The ID of the match
   * @returns {IfUnknownMatch} The requested match
   * @throws {OutOfBoundsException} When the match with the specified ID is not found
   */
  getMatch (id) {
    if (Object.hasOwn(this.#matchLookup, id)) {
      return this.#matchLookup[id]
    }
    throw new Error(`Match with ID ${id} not found`)
  }

  /**
   * Check if matches have courts
   *
   * @returns {boolean} True if matches have courts, false otherwise
   */
  matchesHaveCourts () {
    return this.#matchesHaveCourts
  }

  /**
   * Check if matches have dates
   *
   * @returns {boolean} True if matches have dates, false otherwise
   */
  matchesHaveDates () {
    return this.#matchesHaveDates
  }

  /**
   * Check if matches have durations
   *
   * @returns {boolean} True if matches have durations, false otherwise
   */
  matchesHaveDurations () {
    return this.#matchesHaveDurations
  }

  /**
   * Check if matches have managers
   *
   * @returns {boolean} True if matches have managers, false otherwise
   */
  matchesHaveManagers () {
    return this.#matchesHaveManagers
  }

  /**
   * Check if matches have MVPs
   *
   * @returns {boolean} True if matches have MVPs, false otherwise
   */
  matchesHaveMVPs () {
    return this.#matchesHaveMVPs
  }

  /**
   * Check if matches have notes
   *
   * @returns {boolean} True if matches have notes, false otherwise
   */
  matchesHaveNotes () {
    return this.#matchesHaveNotes
  }

  /**
   * Check if matches have officials
   *
   * @returns {boolean} True if matches have officials, false otherwise
   */
  matchesHaveOfficials () {
    return this.#matchesHaveOfficials
  }

  /**
   * Check if matches have starts
   *
   * @returns {boolean} True if matches have starts, false otherwise
   */
  matchesHaveStarts () {
    return this.#matchesHaveStarts
  }

  /**
   * Check if matches have venues
   *
   * @returns {boolean} True if matches have venues, false otherwise
   */
  matchesHaveVenues () {
    return this.#matchesHaveVenues
  }

  /**
   * Check if matches have warmups
   *
   * @returns {boolean} True if matches have warmups, false otherwise
   */
  matchesHaveWarmups () {
    return this.#matchesHaveWarmups
  }

  /**
   * Get the ID of this IfUnknown. Since IfUnknown blocks don't have a unique id,
   * this is always the string "unknown"
   *
   * @returns {string} The ID of this IfUnknown
   */
  getID () {
    return 'unknown'
  }
}

export default IfUnknown
