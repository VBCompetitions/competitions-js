import Competition from './competition.js'
import CompetitionTeam from './competitionTeam.js'
import Crossover from './crossover.js'
import GroupMatch from './groupMatch.js'
import IfUnknown from './ifUnknown.js'
import Knockout from './knockout.js'
import League from './league.js'
import MatchType from './matchType.js'

/**
 * A single competition stage.
 */
class Stage {
  /**
   * A unique ID for this stage, e.g., 'LG'
   * @type {string}
   * @private
   **/
  #id

  /**
   * Descriptive title for the stage, e.g., 'Pools'
   * @type {string|null}
   * @private
   **/
  #name

  /**
   * Free form string to add notes about this stage.
   * @type {string|null}
   * @private
   **/
  #notes

  /**
   * Verbose text describing the nature of the stage.
   * @type {array|null}
   * @private
   **/
  #description

  /**
   * The groups within a stage of the competition.
   * @type {array<Group>}
   * @private
   **/
  #groups

  /**
   * It can be useful to still present something to the user about the later stages of a competition, even if the teams playing in that stage are not yet known.
   * @type ?{object}
   * @private
   **/
  #ifUnknown

  /**
   * The Competition this Stage is in
   * @type {Competition}
   * @private
   **/
  #competition

  /**
   * All of the matches in all of the group in this stage
   * @type {array<MatchInterface|BreakInterface>}
   * @private
   **/
  #allMatches

  /**
   * A Lookup table from group IDs to the group
   * @type {object}
   * @private
   **/
  #groupLookup

  /**
   * A lookup table for listing stage:group:team lookups
   * @type {array}
   * @private
   **/
  #teamStgGrpLookup

  /**
   * @param {Competition} competition A link back to the Competition this Stage is in
   * @param {string} stageID The unique ID of this Stage
   * @throws {Error} If the stage ID is invalid or already exists in the competition
   */
  constructor (competition, stageID) {
    if (stageID.length > 100 || stageID.length < 1) {
      throw new Error('Invalid stage ID: must be between 1 and 100 characters long')
    }

    if (!/^((?![":{}?=])[\x20-\x7F])+$/.test(stageID)) {
      throw new Error('Invalid stage ID: must contain only ASCII printable characters excluding " : { } ? =')
    }

    if (competition.hasStageWithID(stageID)) {
      throw new Error(`Stage with ID "${stageID}" already exists in the competition`)
    }

    this.#competition = competition
    this.#id = stageID
    this.#name = null
    this.#notes = null
    this.#description = null
    this.#groups = []
    this.#ifUnknown = null
    this.#allMatches = null
    this.#groupLookup = {}
    this.#teamStgGrpLookup = null
  }

  /**
   * Load stage data from an object.
   *
   * @param {object} stageData The stage data
   * @returns {Stage} The updated Stage object
   */
  loadFromData (stageData) {
    if (Object.hasOwn(stageData, 'name')) {
      this.setName(stageData.name)
    }

    if (Object.hasOwn(stageData, 'notes')) {
      this.setNotes(stageData.notes)
    }

    if (Object.hasOwn(stageData, 'description')) {
      this.setDescription(stageData.description)
    }

    stageData.groups.forEach(groupData => {
      let group
      switch (groupData.type) {
        case 'crossover':
          group = new Crossover(this, groupData.id, groupData.matchType === 'continuous' ? MatchType.CONTINUOUS : MatchType.SETS)
          break
        case 'knockout':
          group = new Knockout(this, groupData.id, groupData.matchType === 'continuous' ? MatchType.CONTINUOUS : MatchType.SETS)
          break
        case 'league':
          group = new League(this, groupData.id, groupData.matchType === 'continuous' ? MatchType.CONTINUOUS : MatchType.SETS, groupData.drawsAllowed)
          break
      }
      this.addGroup(group)
      group.loadFromData(groupData)
    })

    if (stageData.ifUnknown !== undefined) {
      this.setIfUnknown(new IfUnknown(this, stageData.ifUnknown.description)).loadFromData(stageData.ifUnknown)
    }

    this.#checkMatches()

    return this
  }

  /**
   * Return the stage data in a form suitable for serializing
   *
   * @return {object}
   */
  serialize () {
    const stage = {
      id: this.#id
    }

    if (this.#name !== null) {
      stage.name = this.#name
    }

    if (this.#notes !== null) {
      stage.notes = this.#notes
    }

    if (this.#description !== null) {
      stage.description = this.#description
    }

    stage.groups = []
    this.#groups.forEach(group => {
      stage.groups.push(group.serialize())
    })

    if (this.#ifUnknown !== null) {
      stage.ifUnknown = this.#ifUnknown.serialize()
    }

    return stage
  }

  /**
   * Get the competition this stage is in.
   *
   * @returns {Competition} The competition this stage is in
   */
  getCompetition () {
    return this.#competition
  }

  /**
   * Get the ID for this stage.
   *
   * @returns {string} The ID for this stage
   */
  getID () {
    return this.#id
  }

  /**
   * Add a group to the stage.
   *
   * @param {Group} group The group to add
   * @returns {Stage} The updated Stage object
   * @throws {Error} If the group ID already exists in the stage or the group was initialized with a different Stage
   */
  addGroup (group) {
    if (group.getStage() !== this) {
      throw new Error('Group was initialised with a different Stage')
    }
    if (this.hasGroupWithID(group.getID())) {
      throw new Error(`Groups in a Stage with duplicate IDs not allowed: {${this.#id}:${group.getID()}}`)
    }
    this.#groups.push(group)
    this.#groupLookup[group.getID()] = group
    return this
  }

  /**
   * Get the groups as an array.
   *
   * @returns {Array<Group>} The array of Groups
   */
  getGroups () {
    return this.#groups
  }

  /**
   * Get the name for this group.
   *
   * @returns {string|null} The name for this group
   */
  getName () {
    return this.#name
  }

  /**
   * Set the stage name.
   *
   * @param {string} name The new name for the stage
   */
  setName (name) {
    this.#name = name
  }

  /**
   * Get the notes for this group.
   *
   * @returns {string|null} The notes for this group
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Set the notes for this stage.
   *
   * @param {string|null} notes The notes for this stage
   */
  setNotes (notes) {
    this.#notes = notes
  }

  /**
   * Get the description for this stage.
   *
   * @returns {Array<string>|null} The description for this stage
   */
  getDescription () {
    return this.#description
  }

  /**
   * Set the description for this stage.
   *
   * @param {Array<string>|null} description The description for this stage
   */
  setDescription (description) {
    this.#description = description
  }

  /**
   * Get the IfUnknown object for this stage.
   *
   * @returns {IfUnknown|null} The IfUnknown object for this stage
   */
  getIfUnknown () {
    return this.#ifUnknown
  }

  /**
   * Set the IfUnknown object for this stage.
   *
   * @param {IfUnknown|null} ifUnknown The IfUnknown object for this stage
   */
  setIfUnknown (ifUnknown) {
    this.#ifUnknown = ifUnknown
    return ifUnknown
  }

  /**
   * Check if matches in groups of the same stage contain duplicate teams.
   *
   * @throws {Error} If duplicate teams are found in groups of the same stage
   */
  #checkMatches () {
    for (let i = 0; i < this.#groups.length - 1; i++) {
      const thisGroupsTeamIDs = this.#groups[i].getTeamIDs(Competition.VBC_TEAMS_PLAYING)
      for (let j = i + 1; j < this.#groups.length; j++) {
        const thatGroupsTeamIDs = this.#groups[j].getTeamIDs(Competition.VBC_TEAMS_PLAYING)
        const intersectingIDs = thisGroupsTeamIDs.filter(id => thatGroupsTeamIDs.includes(id))
        if (intersectingIDs.length > 0) {
          throw new Error('Groups in the same stage cannot contain the same team. Groups {' +
                  `${this.#id}:${this.#groups[i].getID()}} and {${this.#id}:${this.#groups[j].getID()}} both contain ` +
                  `the following team IDs: "${intersectingIDs.join('", "')}"`)
        }
      }
    }
  }

  /**
   * Returns a list of matches from this Stage, where the list depends on the input parameters and on the type of the MatchContainer.
   *
   * @param {string} teamID When provided, return the matches where this team is playing, otherwise all matches are returned
   *                        (and flags is ignored).  This must be a resolved team ID and not a reference.
   *                        A team ID of CompetitionTeam.UNKNOWN_TEAM_ID is interpreted as null
   * @param {number} flags Controls what gets returned
   *                   <ul>
   *                     <li><code>Competition.VBC_MATCH_ALL_IN_GROUP</code> - If a team plays any matches in a group then include all matches from that group</li>
   *                     <li><code>Competition.VBC_MATCH_PLAYING</code> - Include matches that a team plays in</li>
   *                     <li><code>Competition.VBC_MATCH_OFFICIATING</code> - Include matches that a team officiates in</li>
   *                   </ul>
   * @return {array<MatchInterface>}
   */
  getMatches (teamID = null, flags = 0) {
    /*
      TODO when should we include breaks?
      TODO how do we handle duplicate breaks?
    */

    if (teamID === null || teamID === CompetitionTeam.UNKNOWN_TEAM_ID || teamID.startsWith('{')) {
      return this.#getAllMatchesInStage()
    }

    return this.#getMatchesForTeam(teamID, flags)
  }

  /**
   * Returns a list of teams from this match container
   *
   * @param {int} flags Controls what gets returned (MAYBE overrides KNOWN overrides FIXED_ID)
   *                   <ul>
   *                     <li><code>Competition.VBC_TEAMS_FIXED_ID</code> (default) returns teams with a defined team ID (no references)</li>
   *                     <li><code>Competition.VBC_TEAMS_KNOWN</code> returns teams that are known (references that are resolved)</li>
   *                     <li><code>Competition.VBC_TEAMS_MAYBE</code> returns teams that might be in this container (references that may resolve to a team)</li>
   *                     <li><code>Competition.VBC_TEAMS_ALL</code> returns all team IDs, including unresolved references</li>
   *                   </ul>
   * @returns {Array<string>} All team IDs participating in this stage
   */
  getTeamIDs (flags = Competition.VBC_TEAMS_FIXED_ID) {
    let teamIDs = []

    this.#groups.forEach(group => {
      teamIDs = teamIDs.concat(group.getTeamIDs(flags))
    })

    return [...new Set(teamIDs)]
  }

  /**
   * Get all matches in this stage.
   *
   * @returns {Array} All matches in this stage
   */
  #getAllMatchesInStage () {
    if (Array.isArray(this.#allMatches)) {
      return this.#allMatches
    }

    this.#allMatches = []
    this.#groups.forEach(group => {
      this.#allMatches = this.#allMatches.concat(group.getMatches())
    })
    this.#allMatches.sort((a, b) => {
      // Both GroupBreak and GroupMatch may have "start" and may have "date", or may have neither
      const aDate = a.getDate() === null ? '2023-02-12' : a.getDate()
      const bDate = b.getDate() === null ? '2023-02-12' : b.getDate()
      const aStart = a.getStart() === null ? '10:00' : a.getStart()
      const bStart = b.getStart() === null ? '10:00' : b.getStart()

      return `${aDate}${aStart}`.localeCompare(`${bDate}${bStart}`)
    })

    return this.#allMatches
  }

  /**
   * Return the group in this stage with the given ID.
   *
   * @param {string} groupID The ID of the group to get
   * @throws {Error} If the group with the given ID is not found
   * @returns {Group} The Group object if found, null otherwise
   */
  getGroupByID (groupID) {
    if (!Object.hasOwn(this.#groupLookup, groupID)) {
      throw new Error(`Group with ID ${groupID} not found in stage with ID ${this.#id}`)
    }
    return this.#groupLookup[groupID]
  }

  /**
   * Check if a group with a given ID exists in this stage.
   *
   * @param {string} groupID The ID to check
   * @returns {boolean} True if the group exists, false otherwise
   */
  hasGroupWithID (groupID) {
    return Object.hasOwn(this.#groupLookup, groupID)
  }

  /**
   * Check if all matches in the stage are complete.
   *
   * @return {bool} True if all matches in the stage are complete, false otherwise
   */
  isComplete () {
    for (let i = 0; i < this.#groups.length; i++) {
      if (!this.#groups[i].isComplete()) {
        return false
      }
    }

    return true
  }

  /**
   * Get matches for a specific team in this stage.
   *
   * @param {string} teamID The ID of the team
   * @param {number} flags Flags to filter the matches
   * @return {array} An array of matches for the specified team
   */
  #getMatchesForTeam (teamID, flags) {
    let matches = []

    this.#groups.forEach(group => {
      if (group.teamHasMatches(teamID)) {
        matches = matches.concat(group.getMatches(teamID, flags))
      } else if (flags & Competition.VBC_MATCH_OFFICIATING && group.teamHasOfficiating(teamID)) {
        matches = matches.concat(group.getMatches(teamID, Competition.VBC_MATCH_OFFICIATING))
      }
    })

    matches.sort((a, b) => {
      // Both GroupBreak and GroupMatch may have "start" and may have "date", or may have neither
      const aDate = a.getDate() === null ? '2023-02-12' : a.getDate()
      const bDate = b.getDate() === null ? '2023-02-12' : b.getDate()
      const aStart = a.getStart() === null ? '10:00' : a.getStart()
      const bStart = b.getStart() === null ? '10:00' : b.getStart()

      return `${aDate}${aStart}`.localeCompare(`${bDate}${bStart}`)
    })

    return matches
  }

  /**
   * Check if matches in any group within this stage have courts assigned.
   *
   * @return {bool} True if matches have courts assigned, false otherwise
   */
  matchesHaveCourts () {
    for (let i = 0; i < this.#groups.length; i++) {
      if (this.#groups[i].matchesHaveCourts()) {
        return true
      }
    }
    return false
  }

  /**
   * Check if matches in any group within this stage have dates assigned.
   *
   * @return {bool} True if matches have dates assigned, false otherwise
   */
  matchesHaveDates () {
    for (let i = 0; i < this.#groups.length; i++) {
      if (this.#groups[i].matchesHaveDates()) {
        return true
      }
    }
    return false
  }

  /**
   * Check if matches in any group within this stage have durations assigned.
   *
   * @return {bool} True if matches have durations assigned, false otherwise
   */
  matchesHaveDurations () {
    for (let i = 0; i < this.#groups.length; i++) {
      if (this.#groups[i].matchesHaveDurations()) {
        return true
      }
    }
    return false
  }

  /**
   * Check if matches in any group within this stage have MVPs assigned.
   *
   * @return {bool} True if matches have MVPs assigned, false otherwise
   */
  matchesHaveMVPs () {
    for (let i = 0; i < this.#groups.length; i++) {
      if (this.#groups[i].matchesHaveMVPs()) {
        return true
      }
    }
    return false
  }

  /**
   * Check if matches in any group within this stage have managers assigned.
   *
   * @return {bool} True if matches have managers assigned, false otherwise
   */
  matchesHaveManagers () {
    for (let i = 0; i < this.#groups.length; i++) {
      if (this.#groups[i].matchesHaveManagers()) {
        return true
      }
    }
    return false
  }

  /**
   * Check if matches in any group within this stage have notes assigned.
   *
   * @return {bool} True if matches have notes assigned, false otherwise
   */
  matchesHaveNotes () {
    for (let i = 0; i < this.#groups.length; i++) {
      if (this.#groups[i].matchesHaveNotes()) {
        return true
      }
    }
    return false
  }

  /**
   * Check if matches in any group within this stage have officials assigned.
   *
   * @return {bool} True if matches have officials assigned, false otherwise
   */
  matchesHaveOfficials () {
    for (let i = 0; i < this.#groups.length; i++) {
      if (this.#groups[i].matchesHaveOfficials()) {
        return true
      }
    }
    return false
  }

  /**
   * Check if matches in any group within this stage have start times assigned.
   *
   * @return {bool} True if matches have start times assigned, false otherwise
   */
  matchesHaveStarts () {
    for (let i = 0; i < this.#groups.length; i++) {
      if (this.#groups[i].matchesHaveStarts()) {
        return true
      }
    }
    return false
  }

  /**
   * Check if matches in any group within this stage have venues assigned.
   *
   * @return {bool} True if matches have venues assigned, false otherwise
   */
  matchesHaveVenues () {
    for (let i = 0; i < this.#groups.length; i++) {
      if (this.#groups[i].matchesHaveVenues()) {
        return true
      }
    }
    return false
  }

  /**
   * Check if matches in any group within this stage have warmup information assigned.
   *
   * @return {bool} True if matches have warmup information assigned, false otherwise
   */
  matchesHaveWarmups () {
    for (let i = 0; i < this.#groups.length; i++) {
      if (this.#groups[i].matchesHaveWarmups()) {
        return true
      }
    }
    return false
  }

  /**
   * Check if a team has matches scheduled in any group within this stage.
   *
   * @param {string} teamID The ID of the team
   * @return {bool} True if the team has matches scheduled, false otherwise
   */
  teamHasMatches (teamID) {
    for (let i = 0; i < this.#groups.length; i++) {
      if (this.#groups[i].teamHasMatches(teamID)) {
        return true
      }
    }
    return false
  }

  /**
   * Check if a team has officiating duties assigned in any group within this stage.
   *
   * @param {string} teamID The ID of the team
   * @return {bool} True if the team has officiating duties assigned, false otherwise
   */
  teamHasOfficiating (teamID) {
    for (let i = 0; i < this.#groups.length; i++) {
      if (this.#groups[i].teamHasOfficiating(teamID)) {
        return true
      }
    }
    return false
  }

  /**
   * Check if a team may have matches scheduled in any group within this stage. Note that this has undefined behaviour if a team definitely has matches,
   * i.e. if you want to know if a team definitely has matches in this stage then call teamHasMatches(), but if you want to know if there are any
   * references that might point to this team (e.g. a reference to a team in a league position in an incomplete league) then call this function.  This
   * is essentially so we know whether we still need to consider displaying a stage to the competitors as they <i>might</i> still be able to reach that stage.
   *
   * @param {string} teamID The ID of the team to check
   * @return {bool} True if the team may have matches scheduled, false otherwise
   */
  teamMayHaveMatches (teamID) {
    /* TODO Do we need to rewrite this?

    assert - we only call this after calling "teamHasMatches()".  In other words, this has ?undefined return? if you definitely have matches?
    maybe consider when we know they _don't_ have matches?

    Need to be able to say STG1:GRP1:league:#
      - if STG1:GRP1 complete then we know all league positions and all references to STG1:GRP1:* so result is defined and "teamHasMatches()" should catch it
      - else then league:# is not defined, so we're down to "does teamID have any matches in STG1:GRP1?"  Or even "could the have any" (remember STG1:GRP1 might also have references to earlier stages)
    */

    if (this.isComplete()) {
      // If the stage is complete then there are no "maybes"; everything is known so you should call teamHasMatches()
      return false
    }

    // Get all unresolved references {STG:GRP:...}
    if (this.#teamStgGrpLookup === null) {
      this.#teamStgGrpLookup = {}
      this.#groups.forEach(group => {
        group.getMatches().forEach(match => {
          if (match instanceof GroupMatch && this.#competition.getTeamByID(teamID).getID() !== CompetitionTeam.UNKNOWN_TEAM_ID) {
            const homeTeamParts = match.getHomeTeam().getID().substr(1).split(':', 3)
            if (homeTeamParts.length > 2) {
              const key = `${homeTeamParts[0]}:${homeTeamParts[1]}`
              if (!Object.hasOwn(this.#teamStgGrpLookup, key)) {
                this.#teamStgGrpLookup[key] = {
                  stage: homeTeamParts[0],
                  group: homeTeamParts[1]
                }
              }
            }

            const awayTeamParts = match.getAwayTeam().getID().substr(1).split(':', 3)
            if (awayTeamParts.length > 2) {
              const key = `${awayTeamParts[0]}:${awayTeamParts[1]}`
              if (!Object.hasOwn(this.#teamStgGrpLookup, key)) {
                this.#teamStgGrpLookup[key] = {
                  stage: awayTeamParts[0],
                  group: awayTeamParts[1]
                }
              }
            }

            if (match.getOfficials() !== null && match.getOfficials().isTeam()) {
              const refereeTeamParts = match.getOfficials().getTeamID().substr(1).split(':', 3)
              if (refereeTeamParts.length > 2) {
                const key = `${refereeTeamParts[0]}:${refereeTeamParts[1]}`
                if (!Object.hasOwn(this.#teamStgGrpLookup, key)) {
                  this.#teamStgGrpLookup[key] = {
                    stage: refereeTeamParts[0],
                    group: refereeTeamParts[1]
                  }
                }
              }
            }
          }
        })
      })
    }

    // Look up each reference to see if it leads back to this team
    const teamStgGrpLookupValues = Object.values(this.#teamStgGrpLookup)
    for (let i = 0; i < teamStgGrpLookupValues.length; i++) {
      const group = this.#competition.getStageByID(teamStgGrpLookupValues[i].stage).getGroupByID(teamStgGrpLookupValues[i].group)
      if ((!group.isComplete() && group.teamHasMatches(teamID)) || group.teamMayHaveMatches(teamID)) {
        return true
      }
    }
    return false
  }

  /**
   * Returns a list of match dates in this Stage.  If a team ID is given then return dates for just that team.
   *
   * @param {string} teamID This must be a resolved team ID and not a reference
   * @param {number} flags Controls what gets returned
   *                   <ul>
   *                     <li><code>Competition.VBC_MATCH_ALL</code> - Include all matches</li>
   *                     <li><code>Competition.VBC_MATCH_PLAYING</code> - Include matches that a team plays in</li>
   *                     <li><code>Competition.VBC_MATCH_OFFICIATING</code> - Include matches that a team officiates in</li>
   *                   </ul>
   * @return array<string>
   */
  getMatchDates (teamID = null, flags = Competition.VBC_MATCH_PLAYING) {
    let matchDates = []
    this.#groups.forEach(group => {
      const groupMatchDates = group.getMatchDates(teamID, flags)
      matchDates = matchDates.concat(groupMatchDates)
    })
    matchDates.sort()
    return matchDates
  }

  /**
   * Returns a list of matches on the specified date in this Stage.  If a team ID is given then return matches for just that team.
   * The returned list includes breaks when that break has a date value
   *
   * @param {string} date The requested date in the format YYYY-MM-DD
   * @param {string} teamID This must be a resolved team ID and not a reference
   * @param {number} flags Controls what gets returned
   *                   <ul>
   *                     <li><code>Competition.VBC_MATCH_ALL</code> - Include all matches</li>
   *                     <li><code>Competition.VBC_MATCH_PLAYING</code> - Include matches that a team plays in</li>
   *                     <li><code>Competition.VBC_MATCH_OFFICIATING</code> - Include matches that a team officiates in</li>
   *                   </ul>
   * @return array<MatchInterface>
   */
  getMatchesOnDate (date, teamID = null, flags = Competition.VBC_MATCH_ALL) {
    let matches = []
    this.#groups.forEach(group => {
      const groupMatches = group.getMatchesOnDate(date, teamID, flags)
      matches = matches.concat(groupMatches)
    })
    matches.sort((a, b) => {
      // matches may have "start" or may not
      const aStart = a.getStart() === null ? '10:00' : a.getStart()
      const bStart = b.getStart() === null ? '10:00' : b.getStart()

      return `${aStart}`.localeCompare(`${bStart}`)
    })
    return matches
  }
}

export default Stage
