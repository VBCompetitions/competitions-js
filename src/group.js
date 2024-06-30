import Competition from './competition.js'
import CompetitionTeam from './competitionTeam.js'
import GroupBreak from './groupBreak.js'
import GroupMatch from './groupMatch.js'
import GroupType from './groupType.js'
import KnockoutConfig from './knockoutConfig.js'
import LeagueConfig from './leagueConfig.js'
import MatchType from './matchType.js'
import SetConfig from './setConfig.js'

/**
 * A group within a stage of the competition
 */
class Group {
  /**
   * A unique ID for this group, e.g. 'P1'
   * @type {string}
   * @protected
   */
  _id

  /**
   * Descriptive title for the group, e.g. 'Pool 1'
   * @type {string|null}
   * @protected
   */
  _name

  /**
   * Free form string to add notes about this group.
   * @type {string|null}
   * @protected
   */
  _notes

  /**
   * An array of string values as a verbose description of the nature of the group
   * @type {array|null}
   * @protected
   */
  _description

  /**
   * The type of competition applying to this group
   * @type {GroupType}
   * @protected
   */
  _type

  /**
   * Configuration for the knockout matches
   * @type {KnockoutConfig|null}
   * @protected
   */
  _knockoutConfig

  /**
   * Configuration for the league
   * @type {LeagueConfig|null}
   * @protected
   */
  _leagueConfig

  /**
   * Are the matches played in sets or continuous points
   * @type {MatchType}
   * @protected
   */
  _matchType

  /**
   * Configuration defining the nature of a set
   * @type {SetConfig|null}
   * @protected
   */
  _sets

  /**
   * Sets whether drawn matches are allowed
   * @type {bool}
   * @protected
   */
  _drawsAllowed

  /**
   * An array of matches in this group (or breaks in play)
   * @type {array}
   * @protected
   */
  _matches = []

  /**
   * Whether this group is complete, i.e. have all matches been played
   * @type {bool}
   * @protected
   */
  _isComplete = true

  /**
   * A latch on whether we've calculated the latest known completeness of the group
   * @type {bool}
   * @protected
   */
  _isCompleteKnown = false

  /**
   * The Stage this Group is in
   * @type {bool}
   * @protected
   */
  _stage

  /**
   * The competition this Group is in
   * @type {Competition}
   * @protected
   */
  _competition

  /**
   * Lookup table for whether the team has matches they're playing in
   * @type {Object}
   * @private
   */
  #teamHasMatchesLookup

  /**
   * Lookup table for whether the team have matches to officiate
   * @type {Object}
   * @private
   */
  #teamHasOfficiatingLookup

  /**
   * An array of team references in this group
   * @type {array}
   * @private
   */
  #teamReferences

  /**
   * An array of team IDs in this group
   * @type {array}
   * @private
   */
  #teamIDs

  /**
   * An array of team IDs in this group
   * @type {array}
   * @private
   */
  #playingTeamIDs

  /**
   * An array of team IDs in this group
   * @type {array}
   * @private
   */
  #officiatingTeamIDs

  /**
   * A lookup table of references where the key is the string "{stage ID}:{group ID}"
   * @type {array}
   * @private
   */
  #stgGrpLookup

  /**
   * A cached list of the teams that might be in this group via a reference
   * @type {array}
   * @private
   */
  #maybeTeams

  /**
   * Whether any matches in the group have court information
   * @type {bool}
   * @private
   */
  #matchesHaveCourts = false

  /**
   * Whether any matches in the group have date information
   * @type {bool}
   * @private
   */
  #matchesHaveDates = false

  /**
   * Whether any matches in the group have duration information
   * @type {bool}
   * @private
   */
  #matchesHaveDurations = false

  /**
   * Whether any matches in the group have MVP information
   * @type {bool}
   * @private
   */
  #matchesHaveMVPs = false

  /**
   * Whether any matches in the group have manager information
   * @type {bool}
   * @private
   */
  #matchesHaveManagers = false

  /**
   * Whether any matches in the group have notes
   * @type {bool}
   * @private
   */
  #matchesHaveNotes = false

  /**
   * Whether any matches in the group have Officials
   * @type {bool}
   * @private
   */
  #matchesHaveOfficials = false

  /**
   * Whether any matches in the group have start times defined
   * @type {bool}
   * @private
   */
  #matchesHaveStarts = false

  /**
   * Whether any matches in the group have venue information
   * @type {bool}
   * @private
   */
  #matchesHaveVenues = false

  /**
   * Whether any matches in the group have warmup times
   * @type {bool}
   * @private
   */
  #matchesHaveWarmups = false

  /**
   * A Lookup table from match IDs to that match
   * @type {Object}
   * @private
   */
  #matchLookup

  /**
   * Whether matches have been processed or not
   * @type {bool}
   * @protected
   */
  _matchesProcessed = false

  /**
   * @param {Stage} stage A link back to the Stage this Group is in
   * @param {string} id The unique ID of this Group
   * @param {string} matchType Whether matches are continuous or played to sets
   */
  constructor (stage, id, matchType) {
    this._id = id
    this._stage = stage
    this._competition = stage.getCompetition()
    this._matchType = matchType
    this._name = null
    this._notes = null
    this._description = null
    this.#matchLookup = {}
    this.#teamHasMatchesLookup = {}
    this.#teamHasOfficiatingLookup = {}
    this.#teamReferences = []
    this.#playingTeamIDs = []
    this.#officiatingTeamIDs = []
    this.#teamIDs = []
    this._isComplete = true
    this._isCompleteKnown = false
    this._matches = []
    this._sets = null
    this._knockoutConfig = null
    this._leagueConfig = null
    this._type = null
    this._drawsAllowed = false
    this.#stgGrpLookup = null
    this.#maybeTeams = null
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
  }

  /**
   * Load group data from object
   *
   * @param {object} groupData The data defining this Group
   * @returns {Group} The loaded group instance
   */
  loadFromData (groupData) {
    if (Object.hasOwn(groupData, 'name')) {
      this.setName(groupData.name)
    }

    if (Object.hasOwn(groupData, 'notes')) {
      this.setNotes(groupData.notes)
    }

    if (Object.hasOwn(groupData, 'description')) {
      this.setDescription(groupData.description)
    }

    if (Object.hasOwn(groupData, 'sets')) {
      const setConfig = new SetConfig(this)
      this.setSetConfig(setConfig)
      setConfig.loadFromData(groupData.sets)
    }

    if (Object.hasOwn(groupData, 'knockout')) {
      const knockoutConfig = new KnockoutConfig(this)
      this.setKnockoutConfig(knockoutConfig)
      knockoutConfig.loadFromData(groupData.knockout)
    }

    if (Object.hasOwn(groupData, 'league')) {
      const leagueConfig = new LeagueConfig(this)
      this.setLeagueConfig(leagueConfig)
      leagueConfig.loadFromData(groupData.league)
    }

    for (const matchData of groupData.matches) {
      if (matchData.type === 'match') {
        this.addMatch((new GroupMatch(this, matchData.id)).loadFromData(matchData))
      } else if (matchData.type === 'break') {
        this.addBreak((new GroupBreak(this)).loadFromData(matchData))
      }
    }

    return this
  }

  /**
   * Return the group data in a form suitable for serializing
   *
   * @returns {object} The serialized group data
   */
  serialize () {
    const group = {
      id: this._id
    }

    if (this._name !== null) {
      group.name = this._name
    }

    if (this._notes !== null) {
      group.notes = this._notes
    }

    if (this._description !== null) {
      group.description = this._description
    }

    group.type = this._type

    if (this._type === GroupType.LEAGUE && this._leagueConfig !== null) {
      group.league = this._leagueConfig.serialize()
    } else if (this._type === GroupType.KNOCKOUT && this._knockoutConfig !== null) {
      group.knockout = this._knockoutConfig.serialize()
    }

    group.matchType = this._matchType

    if (this._matchType === MatchType.SETS && this._sets !== null) {
      group.sets = this._sets.serialize()
    }

    if (this._type === GroupType.LEAGUE) {
      group.drawsAllowed = this._drawsAllowed
    }

    group.matches = []
    this._matches.forEach(match => {
      group.matches.push(match.serialize())
    })

    return group
  }

  /**
   * Get the stage this group is in
   *
   * @returns {Stage} The stage this group is in
   */
  getStage () {
    return this._stage
  }

  /**
   * Get the ID for this group
   *
   * @returns {string} The id for this group
   */
  getID () {
    return this._id
  }

  /**
   * Get the name for this group
   *
   * @returns {string|null} The name for this group
   */
  getName () {
    return this._name
  }

  /**
   * Set the group Name
   *
   * @param {string} name The new name for the group
   * @returns {Group} The Group instance
   */
  setName (name) {
    this._name = name
    return this
  }

  /**
   * Get the notes for this group
   *
   * @returns {string|null} The notes for this group
   */
  getNotes () {
    return this._notes
  }

  /**
   * Set the notes for this group
   *
   * @param {string|null} notes The notes for this group
   * @returns {Group} The Group instance
   */
  setNotes (notes) {
    this._notes = notes
    return this
  }

  /**
   * Get the description for this group
   *
   * @returns {Array<string>|null} the description for this group
   */
  getDescription () {
    return this._description
  }

  /**
   * Set the description for this group
   *
   * @param {Array<string>|null} description The description for this group
   * @returns {Group} The Group instance
   */
  setDescription (description) {
    this._description = description
    return this
  }

  /**
   * Set the knockout configuration for this group
   *
   * @param {KnockoutConfig} knockoutConfig The knockout configuration
   * @returns {Group} The Group instance
   */
  setKnockoutConfig (knockoutConfig) {
    this._knockoutConfig = knockoutConfig
    return this
  }

  /**
   * Set the league configuration for this group
   *
   * @param {LeagueConfig} leagueConfig The league configuration
   * @returns {Group} The Group instance
   */
  setLeagueConfig (leagueConfig) {
    this._leagueConfig = leagueConfig
    return this
  }

  /**
   * Get the type for this group
   *
   * @returns {GroupType} The type for this group
   */
  getType () {
    return this._type
  }

  /**
   * Get the match type for the matches in this group
   *
   * @returns {string} The match type for the matches in this group
   */
  getMatchType () {
    return this._matchType
  }

  /**
   * Returns the set configuration that defines a set for this group
   *
   * @returns {SetConfig} The set configuration for this group
   */
  getSetConfig () {
    return this._sets
  }

  /**
   * Set the set configuration that defines a set for this group
   *
   * @param {SetConfig} sets The set configuration for this group
   * @returns {Group} The Group instance
   */
  setSetConfig (sets) {
    this._sets = sets
    return this
  }

  /**
   * Returns whether draws are allowed in this group
   *
   * @returns {boolean} Are draws allowed
   */
  getDrawsAllowed () {
    return this._drawsAllowed
  }

  /**
   * Sets whether draws are allowed in this group
   *
   * @param {boolean} drawsAllowed Are draws allowed
   * @returns {Group} The Group instance
   */
  setDrawsAllowed (drawsAllowed) {
    // TODO - check if there are any draws already when this is set to false, and throw
    this._drawsAllowed = drawsAllowed
    return this
  }

  /**
   * Get the competition this group is in
   *
   * @returns {Competition} The competition
   */
  getCompetition () {
    return this._competition
  }

  /**
   * Add a match to this group
   *
   * @param {GroupMatch} match The match to add
   * @returns {Group} The Group instance
   */
  addMatch (match) {
    this._matchesProcessed = false

    this._competition.validateTeamID(match.getHomeTeam().getID(), match.getID(), 'homeTeam')
    this._competition.validateTeamID(match.getAwayTeam().getID(), match.getID(), 'awayTeam')

    this._matches.push(match)
    this.#matchLookup[match.getID()] = match

    if (match.hasCourt()) {
      this.#matchesHaveCourts = true
    }
    if (match.hasDate()) {
      this.#matchesHaveDates = true
    }
    if (match.hasDuration()) {
      this.#matchesHaveDurations = true
    }
    if (match.hasMVP()) {
      this.#matchesHaveMVPs = true
    }
    if (match.hasManager()) {
      this.#matchesHaveManagers = true
    }
    if (match.hasNotes()) {
      this.#matchesHaveNotes = true
    }
    if (match.hasOfficials()) {
      this.#matchesHaveOfficials = true
    }
    if (match.hasStart()) {
      this.#matchesHaveStarts = true
    }
    if (match.hasVenue()) {
      this.#matchesHaveVenues = true
    }
    if (match.hasWarmup()) {
      this.#matchesHaveWarmups = true
    }

    if (match.getHomeTeam().getID().charAt(0) === '{') {
      this.#teamReferences.push(match.getHomeTeam().getID())
    }
    if (match.getAwayTeam().getID().charAt(0) === '{') {
      this.#teamReferences.push(match.getAwayTeam().getID())
    }

    this.#playingTeamIDs[match.getHomeTeam().getID()] = true
    this.#playingTeamIDs[match.getAwayTeam().getID()] = true
    this.#teamIDs[match.getHomeTeam().getID()] = true
    this.#teamIDs[match.getAwayTeam().getID()] = true
    if (match.hasOfficials() && match.getOfficials().isTeam()) {
      this.#teamIDs[match.getOfficials().getTeamID()] = true
      this.#officiatingTeamIDs[match.getOfficials().getTeamID()] = true
    }

    this._isCompleteKnown = false

    return this
  }

  /**
   * Add a break to this group
   *
   * @param {GroupBreak} breakObj The break to add
   * @returns {Group} The Group instance
   */
  addBreak (breakObj) {
    this._matches.push(breakObj)
    this._isCompleteKnown = false
    return this
  }

  /**
   * Returns a list of matches from this Group, where the list depends on the input parameters and on the type of the MatchContainer
   *
   * @param {string|null} id When provided, return the matches where the team with this ID is playing, otherwise all matches are returned
   *                          (and subsequent parameters are ignored).  This must be a resolved team ID and not a reference.
   *                          A team ID of CompetitionTeam::UNKNOWN_TEAM_ID is interpreted as null
   * @param {number} flags Controls what gets returned
   *                       <ul>
   *                         <li>{@link VBC_MATCH_ALL_IN_GROUP} - Include all matches in the group</li>
   *                         <li>{@link VBC_MATCH_PLAYING} - Include matches that a team plays in</li>
   *                         <li>{@link VBC_MATCH_OFFICIATING} - Include matches that a team officiates in</li>
   *                       </ul>
   * @returns {Array<MatchInterface|BreakInterface>}
   */
  getMatches (id = null, flags = 0) {
    if (id === null ||
            flags & Competition.VBC_MATCH_ALL_IN_GROUP ||
            id === CompetitionTeam.UNKNOWN_TEAM_ID ||
            id.charAt(0) === '{') {
      return this._matches
    }

    const matches = []

    for (const match of this._matches) {
      if (match instanceof GroupBreak) {
        continue
      } else if (flags & Competition.VBC_MATCH_PLAYING &&
                (this._competition.getTeam(match.getHomeTeam().getID()).getID() === id || this._competition.getTeam(match.getAwayTeam().getID()).getID() === id)) {
        matches.push(match)
      } else if (flags & Competition.VBC_MATCH_OFFICIATING &&
                match.getOfficials() !== null &&
                match.getOfficials().isTeam() &&
                this._competition.getTeam(match.getOfficials().getTeamID()).getID() === id) {
        matches.push(match)
      }
    }
    return matches
  }

  /**
   * Returns a list of teams from this match container.  If all teams are known then the list is sorted by team name
   *
   * @param {number} flags Controls what gets returned (MAYBE overrides KNOWN overrides FIXED_ID)
   *                       <ul>
   *                         <li>{@link VBC_TEAMS_FIXED_ID} (default) returns teams with a defined team ID (no references)</li>
   *                         <li>{@link VBC_TEAMS_KNOWN} returns teams that are known (teams not defined by a reference plus references that are resolved)</li>
   *                         <li>{@link VBC_TEAMS_MAYBE} returns teams that might be in this container (references that could resolve to a team but are not yet defined)</li>
   *                         <li>{@link VBC_TEAMS_ALL} returns all team IDs including refereeing as defined in the group data, including unresolved references</li>
   *                         <li>{@link VBC_TEAMS_PLAYING} returns all team IDs for teams that are playing, as defined in the group data, including unresolved references</li>
   *                         <li>{@link VBC_TEAMS_OFFICIATING} returns all team IDs for teams that are OFFICIATING, as defined in the group data, including unresolved references</li>
   *                       </ul>
   * @returns {Array<string>}
   */
  getTeamIDs (flags = Competition.VBC_TEAMS_FIXED_ID) {
    let teamIDs = []

    if (flags & Competition.VBC_TEAMS_ALL) {
      teamIDs = Object.keys(this.#teamIDs)
    } else if (flags & Competition.VBC_TEAMS_PLAYING) {
      teamIDs = Object.keys(this.#playingTeamIDs)
    } else if (flags & Competition.VBC_TEAMS_OFFICIATING) {
      teamIDs = Object.keys(this.#officiatingTeamIDs)
    } else if (flags & Competition.VBC_TEAMS_MAYBE) {
      return this.#getMaybeTeamIDs()
    } else if (flags & Competition.VBC_TEAMS_KNOWN) {
      teamIDs = Object.keys(this.#teamIDs).filter(k => this._competition.getTeam(k).getID() !== CompetitionTeam.UNKNOWN_TEAM_ID)
      teamIDs.sort((a, b) => this._competition.getTeam(a).getName().localeCompare(this._competition.getTeam(b).getName()))
    } else if (flags & Competition.VBC_TEAMS_FIXED_ID) {
      teamIDs = Object.keys(this.#teamIDs).filter(k => k.charAt(0) !== '{')
      teamIDs.sort((a, b) => this._competition.getTeam(a).getName().localeCompare(this._competition.getTeam(b).getName()))
    }

    return teamIDs
  }

  /**
   * Go through the stages:groups referenced by this group and build a list of teams that could reach this group.
   * If the feeding group is complete then the reference can be resolved and the team is "known" and not a "maybe",
   * so we only consider incomplete groups.  We ask that group for all of its known and maybe teams and recurse back
   * to the end of each lookup chain
   *
   * @returns {Array<string>} the array of team IDs that may be in this group
   */
  #getMaybeTeamIDs () {
    if (this.isComplete()) {
      // If the group is complete then there are no "maybes"; everything is known so you should call getTeamIDs(VBC_TEAMS_KNOWN)
      return []
    }

    if (this.#maybeTeams === null) {
      this.#maybeTeams = []
      this.#buildStageGroupLookup()

      const stgGrpLookupValues = Object.values(this.#stgGrpLookup)
      for (let i = 0; i < stgGrpLookupValues.length; i++) {
        const group = this._competition.getStage(stgGrpLookupValues[i].stage).getGroup(stgGrpLookupValues[i].group)
        if (!group.isComplete()) {
          this.#maybeTeams = Array.from(new Set([...this.#maybeTeams, ...group.getTeamIDs(Competition.VBC_TEAMS_KNOWN), ...group.getTeamIDs(Competition.VBC_TEAMS_MAYBE)]))
        }
      }
    }

    return this.#maybeTeams
  }

  /**
   * Build the lookup table of references where the key is the string "{stage ID}:{group ID}" and the value is an object linking to
   * the Stage and the Group
   */
  #buildStageGroupLookup () {
    // Get all unresolved references {STG:GRP:...}
    if (this.#stgGrpLookup === null) {
      this.#stgGrpLookup = {}
      for (const match of this.getMatches()) {
        if (match instanceof GroupMatch) {
          const homeTeamParts = match.getHomeTeam().getID().substring(1).split(':', 3)
          if (homeTeamParts.length > 2) {
            const key = `${homeTeamParts[0]}:${homeTeamParts[1]}`
            if (!Object.hasOwn(this.#stgGrpLookup, key)) {
              this.#stgGrpLookup[key] = { stage: homeTeamParts[0], group: homeTeamParts[1] }
            }
          }
          const awayTeamParts = match.getAwayTeam().getID().substring(1).split(':', 3)
          if (awayTeamParts.length > 2) {
            const key = `${awayTeamParts[0]}:${awayTeamParts[1]}`
            if (!Object.hasOwn(this.#stgGrpLookup, key)) {
              this.#stgGrpLookup[key] = { stage: awayTeamParts[0], group: awayTeamParts[1] }
            }
          }
          if (match.getOfficials() !== null && match.getOfficials().isTeam()) {
            const refereeTeamParts = match.getOfficials().getTeamID().substring(1).split(':', 3)
            if (refereeTeamParts.length > 2) {
              const key = `${refereeTeamParts[0]}:${refereeTeamParts[1]}`
              if (!Object.hasOwn(this.#stgGrpLookup, key)) {
                this.#stgGrpLookup[key] = { stage: refereeTeamParts[0], group: refereeTeamParts[1] }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Returns the match with the specified ID
   *
   * @param {string} id The ID of the match
   *
   * @returns {GroupMatch} The requested match
   */
  getMatch (id) {
    if (Object.hasOwn(this.#matchLookup, id)) {
      return this.#matchLookup[id]
    }
    throw new Error(`Match with ID ${id} not found`)
  }

  /**
   * Checks if a match with the given ID exists in the group.
   *
   * @param {string} id The ID of the match to check
   * @returns {boolean} True if a match with the given ID exists, false otherwise
   */
  hasMatch (id) {
    return Object.hasOwn(this.#matchLookup, id)
  }

  /**
   * Process the matches in this group
   */
  processMatches () {
    this._matchesProcessed = true
  }

  /**
   * Get the team by ID based on the type of entity.
   *
   * @param {string} type The type part of the team reference ('MATCH-ID' or 'league')
   * @param {string} entity The entity (e.g., 'winner' or 'loser')
   * @returns {CompetitionTeam} The CompetitionTeam instance
   * @throws {Error} If the entity is invalid
   */
  getTeam (type, entity) {
    if (type === 'league') {
      throw new Error('Invalid type "league" in team reference.  Cannot get league position from a non-league group')
    }

    const match = this.getMatch(type)

    switch (entity) {
      case 'winner':
        return this._competition.getTeam(match.getWinnerTeamID())
      case 'loser':
        return this._competition.getTeam(match.getLoserTeamID())
      default:
        throw new Error(`Invalid entity "${entity}" in team reference`)
    }
  }

  /**
   * Checks if the matches in this group have been processed.
   *
   * @returns {boolean} True if the matches in this group have been processed, false otherwise
   */
  isProcessed () {
    return this._matchesProcessed
  }

  /**
   * Checks if the group is complete, i.e., all matches in the group are complete.
   *
   * @returns {boolean} True if the group is complete, false otherwise
   */
  isComplete () {
    if (!this._isCompleteKnown) {
      let completedMatches = 0
      let matchesInThisPool = 0

      for (const match of this.getMatches()) {
        if (match instanceof GroupBreak) {
          continue
        }

        matchesInThisPool++

        if (match.isComplete()) {
          completedMatches++
        }
      }
      this._isComplete = completedMatches === matchesInThisPool
      this._isCompleteKnown = true
    }

    return this._isComplete
  }

  /**
   * Checks if the matches in this group have courts.
   *
   * @returns {boolean} True if the matches in this group have courts, false otherwise
   */
  matchesHaveCourts () {
    return this.#matchesHaveCourts
  }

  /**
   * Checks if the matches in this group have dates.
   *
   * @returns {boolean} True if the matches in this group have dates, false otherwise
   */
  matchesHaveDates () {
    return this.#matchesHaveDates
  }

  /**
   * Checks if the matches in this group have durations.
   *
   * @returns {boolean} True if the matches in this group have durations, false otherwise
   */
  matchesHaveDurations () {
    return this.#matchesHaveDurations
  }

  /**
   * Checks if the matches in this group have MVPs.
   *
   * @returns {boolean} True if the matches in this group have MVPs, false otherwise
   */
  matchesHaveMVPs () {
    return this.#matchesHaveMVPs
  }

  /**
   * Checks if the matches in this group have court managers.
   *
   * @returns {boolean} True if the matches in this group have court managers, false otherwise
   */
  matchesHaveManagers () {
    return this.#matchesHaveManagers
  }

  /**
   * Checks if the matches in this group have notes.
   *
   * @returns {boolean} True if the matches in this group have notes, false otherwise
   */
  matchesHaveNotes () {
    return this.#matchesHaveNotes
  }

  /**
   * Checks if the matches in this group have officials.
   *
   * @returns {boolean} True if the matches in this group have officials, false otherwise
   */
  matchesHaveOfficials () {
    return this.#matchesHaveOfficials
  }

  /**
   * Checks if the matches in this group have start times.
   *
   * @returns {boolean} True if the matches in this group have start times, false otherwise
   */
  matchesHaveStarts () {
    return this.#matchesHaveStarts
  }

  /**
   * Checks if the matches in this group have venues.
   *
   * @returns {boolean} True if the matches in this group have venues, false otherwise
   */
  matchesHaveVenues () {
    return this.#matchesHaveVenues
  }

  /**
   * Checks if the matches in this group have warmup times.
   *
   * @returns {boolean} True if the matches in this group have warmup times, false otherwise
   */
  matchesHaveWarmups () {
    return this.#matchesHaveWarmups
  }

  /**
   * Returns whether all of the teams in this group are known yet or not.
   *
   * @returns {boolean} Whether all of the teams in this group are known yet or not
   */
  allTeamsKnown () {
    let allGroupsComplete = true
    for (const teamReference of this.#teamReferences) {
      const parts = teamReference.trim().replace(/[{}]/g, '').split(':', 4)
      if (!this._competition.getStage(parts[0]).getGroup(parts[1]).isComplete()) {
        allGroupsComplete = false
      }
    }
    return allGroupsComplete
  }

  /**
   * Returns whether the specified team is known to have matches in this group.
   *
   * @param {string} id The ID of the team
   * @returns {boolean} Whether the specified team is known to have matches in this group
   */
  teamHasMatches (id) {
    if (!Object.hasOwn(this.#teamHasMatchesLookup, id)) {
      this.#teamHasMatchesLookup[id] = false
      for (const match of this._matches) {
        if (match instanceof GroupBreak) {
          continue
        }
        if (this._competition.getTeam(match.getHomeTeam().getID()).getID() === id) {
          this.#teamHasMatchesLookup[id] = true
          break
        }
        if (this._competition.getTeam(match.getAwayTeam().getID()).getID() === id) {
          this.#teamHasMatchesLookup[id] = true
          break
        }
      }
    }
    return this.#teamHasMatchesLookup[id]
  }

  /**
   * Returns whether the specified team is known to have officiating duties in this group.
   *
   * @param {string} id The ID of the team
   * @returns {boolean} Whether the specified team is known to have officiating duties in this group
   */
  teamHasOfficiating (id) {
    if (!Object.hasOwn(this.#teamHasOfficiatingLookup, id)) {
      this.#teamHasOfficiatingLookup[id] = false
      for (const match of this._matches) {
        if (match instanceof GroupBreak) {
          continue
        }
        if (match.getOfficials() !== null && match.getOfficials().isTeam() &&
                    this._competition.getTeam(match.getOfficials().getTeamID()).getID() === id) {
          this.#teamHasOfficiatingLookup[id] = true
          break
        }
      }
    }
    return this.#teamHasOfficiatingLookup[id]
  }

  /**
   * Returns whether the specified team may have matches or officiating duties in this group.
   *
   * @param {string} id The ID of the team
   * @returns {boolean} Whether it is possible for a team with the given ID to have matches in this group
   */
  teamMayHaveMatches (id) {
    if (this.isComplete()) {
      return false
    }

    if (this._competition.getTeam(id).getID() === CompetitionTeam.UNKNOWN_TEAM_ID) {
      return false
    }

    this.#buildStageGroupLookup()

    const stgGrpLookupValues = Object.values(this.#stgGrpLookup)
    for (let i = 0; i < stgGrpLookupValues.length; i++) {
      const group = this._competition.getStage(stgGrpLookupValues[i].stage).getGroup(stgGrpLookupValues[i].group)
      if ((!group.isComplete() && group.teamHasMatches(id)) || group.teamMayHaveMatches(id)) {
        return true
      }
    }

    return false
  }

  /**
   * Returns a list of match dates in this Group.
   *
   * @param {string} [teamID=null] The ID of the team
   * @param {number} [flags=VBC_MATCH_PLAYING] Controls what gets returned
   * @returns {Array<string>} List of match dates
   */
  getMatchDates (teamID = null, flags = Competition.VBC_MATCH_PLAYING) {
    const matchDates = {}
    if (teamID === null || teamID === CompetitionTeam.UNKNOWN_TEAM_ID || flags & Competition.VBC_MATCH_ALL) {
      for (const match of this._matches) {
        if (match instanceof GroupMatch) {
          matchDates[match.getDate()] = 1
        }
      }
    } else {
      for (const match of this._matches) {
        if (!(match instanceof GroupMatch)) {
          continue
        }

        if (flags & Competition.VBC_MATCH_PLAYING &&
                    (this._competition.getTeam(match.getHomeTeam().getID()).getID() === teamID ||
                     this._competition.getTeam(match.getAwayTeam().getID()).getID() === teamID)) {
          matchDates[match.getDate()] = 1
        } else if (flags & Competition.VBC_MATCH_OFFICIATING &&
                    match.getOfficials() !== null &&
                    match.getOfficials().isTeam() &&
                    this._competition.getTeam(match.getOfficials().getTeamID()).getID() === teamID) {
          matchDates[match.getDate()] = 1
        }
      }
    }
    return Object.keys(matchDates)
  }

  /**
   * Returns a list of matches on the specified date in this Group.
   * The returned list includes breaks when that break has a date value
   *
   * @param {string} date The requested date in the format YYYY-MM-DD
   * @param {string} [teamID=null] The ID of the team
   * @param {number} [flags=VBC_MATCH_ALL] Controls what gets returned
   * @returns {Array<MatchInterface>} List of matches on the specified date
   */
  getMatchesOnDate (date, teamID = null, flags = Competition.VBC_MATCH_ALL) {
    const matches = []
    if (teamID === null || teamID === CompetitionTeam.UNKNOWN_TEAM_ID || flags & Competition.VBC_MATCH_ALL) {
      for (const match of this._matches) {
        if (match.getDate() === date) {
          matches.push(match)
        }
      }
    } else {
      for (const match of this._matches) {
        if (match.getDate() === date) {
          if (!(match instanceof GroupMatch)) {
            matches.push(match)
          } else if (flags & Competition.VBC_MATCH_PLAYING &&
                              (this._competition.getTeam(match.getHomeTeam().getID()).getID() === teamID ||
                               this._competition.getTeam(match.getAwayTeam().getID()).getID() === teamID)) {
            matches.push(match)
          } else if (flags & Competition.VBC_MATCH_OFFICIATING &&
                               match.getOfficials() !== null &&
                               match.getOfficials().isTeam() &&
                               this._competition.getTeam(match.getOfficials().getTeamID()).getID() === teamID) {
            matches.push(match)
          }
        }
      }
    }
    return matches
  }
}

export default Group
