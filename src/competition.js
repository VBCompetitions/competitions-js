import Ajv from 'ajv'
import addFormats from 'ajv-formats'

import { competitionSchema } from './schema.js'
import CompetitionTeam from './competitionTeam.js'
import Club from './club.js'
import Player from './player.js'
import Stage from './stage.js'

/**
 * The Ajv schema validator
 * @type {Ajv}
 * @private
 */
let validator = null

/**
 * Perform schema validation on the JSON data
 *
 * @param {object} competitionData The object representation of the parsed JSON data
 *
 * @throws Error An exception containing a list of schema validation errors
 */
async function validateJSON (competitionData) {
  if (validator === null) {
    const ajv = new Ajv()
    addFormats(ajv)
    validator = ajv.compile(competitionSchema)
  }

  if (!validator(competitionData)) {
    let errors = ''
    validator.errors.forEach(e => {
      errors += `[${e.schemaPath}] [${e.instancePath}] ${e.message}\n`
    })
    throw new Error(`Competition data failed schema validation:\n${errors}`)
  }
}

class Competition {
  /**
   * The version of schema that the document conforms to. Defaults to 1.0.0
   * @type {string}
   * @private
   */
  #version

  /**
   * A list of key-value pairs representing metadata about the competition, where each key must be unique. This can be used for functionality such as associating a competition with a season, and searching for competitions with matching metadata
   * @type {array}
   * @private
   */
  #metadata

  /**
   * A name for the competition
   * @type {string}
   * @private
   */
  #name

  /**
   * Free form string to add notes about the competition.  This can be used for arbitrary content that various implementations can use
   * @type {string|null}
   * @private
   */
  #notes

  /**
   *  A list of clubs that the teams are in
   * @type {array}
   * @private
   */
  #clubs

  /**
   * The list of all teams in this competition
   * @type {array}
   * @private
   */
  #teams

  /**
   * A list of players in the competition
   * @type {array}
   * @private
   */
  #players

  /**
   * The stages of the competition. Stages are phases of a competition that happen in order.  There may be only one stage (e.g. for a flat league) or multiple in sequence
   * (e.g. for a tournament with pools, then crossovers, then finals)
   * @type {array}
   * @private
   */
  #stages

  /**
   * A Lookup table from team IDs (including references) to the team
   * @type {object}
   * @private
   */
  #teamLookup

  /**
   * A Lookup table from player IDs to the player
   * @type {object}
   * @private
   */
  #playerLookup

  /**
   * A Lookup table from stage IDs to the stage
   * @type {object}
   * @private
   */
  #stageLookup

  /**
   * A Lookup table from club IDs to the club
   * @type {object}
   * @private
   */
  #clubLookup

  /**
   * The "unknown" team, typically for matching against
   * @type {CompetitionTeam}
   * @private
   */
  #unknownTeam

  static VBC_MATCH_ALL_IN_GROUP = 1
  static VBC_MATCH_ALL = 2
  static VBC_MATCH_PLAYING = 4
  static VBC_MATCH_OFFICIATING = 8

  static VBC_TEAMS_FIXED_ID = 1
  static VBC_TEAMS_KNOWN = 2
  static VBC_TEAMS_MAYBE = 4
  static VBC_TEAMS_ALL = 8
  static VBC_TEAMS_PLAYING = 16
  static VBC_TEAMS_OFFICIATING = 32

  /**
   * Takes in the Competition name creates an empty Competition object with that name
   *
   * @param {string} name The name of the competition
   *
   * @throws {Error} thrown when the name is invalid
   */
  constructor (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid competition name: must be between 1 and 1000 characters long')
    }

    this.#name = name
    this.#version = '1.0.0'
    this.#metadata = []
    this.#notes = null
    this.#clubs = []
    this.#teams = []
    this.#players = []
    this.#stages = []
    this.#teamLookup = {}
    this.#playerLookup = {}
    this.#stageLookup = {}
    this.#clubLookup = {}

    this.#unknownTeam = new CompetitionTeam(this, CompetitionTeam.UNKNOWN_TEAM_ID, CompetitionTeam.UNKNOWN_TEAM_NAME)
  }

  /**
   * Loads a Competition object from competition JSON data
   *
   * @param {string} competitionJSON The competition JSON data
   *
   * @returns {Promise<Competition>} a loaded Competition, rejects when the JSON data is invalid
   */
  static async loadFromCompetitionJSON (competitionJSON) {
    let competitionData
    try {
      competitionData = JSON.parse(competitionJSON)
    } catch (_) {
      throw new Error('Document does not contain valid JSON')
    }

    if (typeof competitionData.version === 'string') {
      // This supports only version 1.0.0 (and all documents without an explicit version are assumed to be at version 1.0.0)
      if (competitionData.version !== '1.0.0') {
        throw new Error(`Document version ${competitionData.version} not supported`)
      }
    } else {
      competitionData.version = '1.0.0'
    }

    await validateJSON(competitionData)

    const competition = new Competition(competitionData.name)
    competition.setVersion(competitionData.version)

    if (Array.isArray(competitionData.metadata)) {
      competitionData.metadata.forEach(kv => {
        if (competition.hasMetadataByKey(kv.key)) {
          throw new Error(`Metadata with key "${kv.key}" already exists in the competition`)
        }
        competition.setMetadataByKey(kv.key, kv.value)
      })
    }

    if (typeof competitionData.notes === 'string') {
      competition.setNotes(competitionData.notes)
    }

    if (Array.isArray(competitionData.clubs)) {
      competitionData.clubs.forEach(clubData => {
        competition.addClub(new Club(competition, clubData.id, clubData.name).loadFromData(clubData))
      })
    }

    competitionData.teams.forEach(teamData => {
      competition.addTeam(new CompetitionTeam(competition, teamData.id, teamData.name).loadFromData(teamData))
    })

    if (Array.isArray(competitionData.players)) {
      competitionData.players.forEach(playerData => {
        competition.addPlayer(new Player(competition, playerData.id, playerData.name).loadFromData(playerData))
      })
    }

    competitionData.stages.forEach(stageData => {
      const stage = new Stage(competition, stageData.id)
      competition.addStage(stage)
      stage.loadFromData(stageData)
    })

    return competition
  }

  /**
   * Return the competition definition in a form suitable for serializing
   *
   * @returns {object} The competition as an object suitable for serializing into JSON
   */
  serialize () {
    const competition = {
      version: this.#version
    }

    if (this.#metadata.length > 0) {
      competition.metadata = this.#metadata
    }

    competition.name = this.#name

    if (this.#notes !== null) {
      competition.notes = this.#notes
    }

    if (this.#clubs.length > 0) {
      competition.clubs = []
      this.#clubs.forEach(club => {
        competition.clubs.push(club.serialize())
      })
    }

    competition.teams = []
    this.#teams.forEach(team => {
      competition.teams.push(team.serialize())
    })

    if (this.#players.length > 0) {
      competition.players = []
      this.#players.forEach(player => {
        competition.players.push(player.serialize())
      })
    }

    competition.stages = []
    this.#stages.forEach(stage => {
      competition.stages.push(stage.serialize())
    })

    return competition
  }

  /**
   * Process matches for all stages in the competition
   */
  #processMatches () {
    this.#stages.forEach(stage => {
      stage.getGroups().forEach(group => {
        if (!group.isProcessed()) {
          group.processMatches()
        }
      })
    })
  }

  /**
   * Get the schema version for this competition, as a semver string
   *
   * @returns {string} the schema version
   */
  getVersion () {
    return this.#version
  }

  /**
   * Set the competition version
   *
   * @param {string} version the version for the competition data
   *
   * @returns {Competition} the competition
   */
  setVersion (version) {
    this.#version = version
    return this
  }

  /**
   * Get the name for this competition
   *
   * @returns {string} the competition name
   */
  getName () {
    return this.#name
  }

  /**
   * Set the competition Name
   *
   * @param {string} name the new name for the competition
   *
   * @returns {Competition} the competition
   */
  setName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid competition name: must be between 1 and 1000 characters long')
    }
    this.#name = name
    return this
  }

  /**
   * Add metadata to the competition.
   *
   * This function adds metadata to the competition using the provided key-value pair.
   *
   * @param {string} key The key of the metadata
   * @param {string} value The value of the metadata
   * @returns {Competition} Returns the current Competition instance for method chaining
   * @throws {Error} If the key or value is invalid
   */
  setMetadataByKey (key, value) {
    if (key.length > 100 || key.length < 1) {
      throw new Error('Invalid metadata key: must be between 1 and 100 characters long')
    }

    if (value.length > 1000 || value.length < 1) {
      throw new Error('Invalid metadata value: must be between 1 and 1000 characters long')
    }

    for (let i = 0; i < this.#metadata.length; i++) {
      if (this.#metadata[i].key === key) {
        this.#metadata[i].value = value
        return this
      }
    }

    const kv = { key, value }
    this.#metadata.push(kv)
    return this
  }

  /**
   * Check if the competition has metadata with the given key.
   *
   * This function checks if the competition has metadata with the specified key.
   *
   * @param {string} key The key to check
   * @returns {bool} Returns true if the metadata value exists, false otherwise
   */
  hasMetadataByKey (key) {
    for (let i = 0; i < this.#metadata.length; i++) {
      if (this.#metadata[i].key === key) {
        return true
      }
    }
    return false
  }

  /**
   * Check if the competition has any metadata defined.
   *
   * @returns {bool} Returns true if the metadata exists, false otherwise
   */
  hasMetadata () {
    return this.#metadata.length > 0
  }

  /**
   * Get the value of metadata with the specified key.
   *
   * This function retrieves the value of the metadata associated with the provided key.
   *
   * @param {string} key The key of the metadata
   * @returns {string|null} Returns the value of the metadata if found, otherwise null
   */
  getMetadataByKey (key) {
    for (let i = 0; i < this.#metadata.length; i++) {
      if (this.#metadata[i].key === key) {
        return this.#metadata[i].value
      }
    }
    return null
  }

  /**
   * Get the whole metadata array.
   *
   * This function retrieves the value of the metadata associated with the provided key.
   *
   * @returns {array|null} Returns the metadata array or null if no metadata is defined
   */
  getMetadata () {
    if (this.hasMetadata()) {
      return this.#metadata
    }
    return null
  }

  /**
   * Delete metadata with the specified key from the competition.
   *
   * This function deletes the metadata with the provided key from the competition.
   *
   * @param {string} key The key of the metadata to delete
   * @returns {Competition} Returns the current Competition instance for method chaining
   */
  deleteMetadataByKey (key) {
    this.#metadata = this.#metadata.filter(el => el.key !== key)
    return this
  }

  /**
   * Get the notes for this competition
   *
   * @returns {string|null} the notes for this competition
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Set the notes for this competition
   *
   * @param {string|null} notes the notes for this competition
   *
   * @returns {Competition} the competition
   */
  setNotes (notes) {
    if (notes.length < 1) {
      throw new Error('Invalid competition notes: must be at least 1 character long')
    }
    this.#notes = notes
    return this
  }

  /**
   * Add a new team to the competition
   *
   * @param {CompetitionTeam} team The team to add to the competition
   *
   * @throws {Error} If the input parameters are invalid or if a team with the requested ID already exists
   *
   * @returns {Competition} This competition
   */
  addTeam (team) {
    if (team.getCompetition() !== this) {
      throw new Error('Team was initialised with a different Competition')
    }
    if (this.hasTeam(team.getID())) {
      return this
    }
    this.#teams.push(team)
    this.#teamLookup[team.getID()] = team
    return this
  }

  /**
   * Get the teams in this competition
   *
   * @returns {array} The teams in this competition
   */
  getTeams () {
    return this.#teams
  }

  /**
   * Gets the Team for the given team ID
   *
   * @param {string} id The team ID to look up. This may be a pure ID, a reference, or a ternary
   *
   * @returns {CompetitionTeam} The team
   */
  getTeam (id) {
    this.#processMatches()

    if (!id.startsWith('{')) {
      if (Object.hasOwn(this.#teamLookup, id)) {
        return this.#teamLookup[id]
      }
    }

    /*
     * Check for ternaries like {teamID1}=={teamID2}?{teamIDTrue}:{teamIDFalse}
     * Note that we only allow one level of ternary, i.e. this does not resolve:
     *  { {ta}=={tb}?{tTrue}:{tFalse} }=={T2}?{TTrue}:{TFalse}
     */
    const lrMatches = id.match(/^([^=]*)==([^?]*)\?(.*)/)
    if (lrMatches !== null) {
      const leftTeam = this.getTeam(lrMatches[1])
      const rightTeam = this.getTeam(lrMatches[2])
      let trueTeam = null

      let tfMatches
      let falseTeam
      if ((tfMatches = lrMatches[3].match(/^({[^}]*}):(.*)/)) !== null) {
        trueTeam = this.getTeam(tfMatches[1])
        falseTeam = this.getTeam(tfMatches[2])
      } else if ((tfMatches = lrMatches[3].match(/^([^:]*):(.*)/)) !== null) {
        trueTeam = this.getTeam(tfMatches[1])
        falseTeam = this.getTeam(tfMatches[2])
      }

      if (trueTeam !== null) {
        return leftTeam === rightTeam ? trueTeam : falseTeam
      }
    }

    const teamRefParts = id.match(/^{([^:]*):([^:]*):([^:]*):([^:]*)}/)
    if (teamRefParts !== null) {
      try {
        return this.getStage(teamRefParts[1]).getGroup(teamRefParts[2]).getTeam(teamRefParts[3], teamRefParts[4])
      } catch (_) {
        return this.#unknownTeam
      }
    }

    return this.#unknownTeam
  }

  /**
   * Check if a team with the given ID exists in the competition
   *
   * @param {string} id The ID of the team to check
   *
   * @returns {bool} True if the team exists, false otherwise
   */
  hasTeam (id) {
    return Object.hasOwn(this.#teamLookup, id)
  }

  /**
   * Delete a team from the competition
   *
   * @param {string} id The ID of the team to delete
   *
   * @returns {Competition} This competition
   */
  deleteTeam (id) {
    if (!this.hasTeam(id)) {
      return this
    }

    let teamMatches = []
    this.#stages.forEach(stage => {
      const stageMatches = stage.getMatches(id, Competition.VBC_MATCH_PLAYING | Competition.VBC_MATCH_OFFICIATING)
      teamMatches = teamMatches.concat(stageMatches)
    })

    if (teamMatches.length > 0) {
      const collapseMatches = m => `{${m.getGroup().getStage().getID()}:${m.getGroup().getID()}:${m.getID()}}`
      throw new Error(`Team still has matches with IDs: ${teamMatches.map(collapseMatches).join(', ')}`)
    }

    // Also remove team from any club's list
    this.#clubs.forEach(club => {
      club.deleteTeam(id)
    })

    // Then delete the team
    delete this.#teamLookup[id]
    this.#teams = this.#teams.filter(team => team.getID() !== id)

    return this
  }

  /**
   * Add a player to this competition
   *
   * @param {Player} player The player to add to this competition
   *
   * @returns {Competition} This Competition instance
   *
   * @throws {Error} If a player with a duplicate ID within the competition is added
   */
  addPlayer (player) {
    if (player.getID() !== Player.UNREGISTERED_PLAYER_ID && this.hasPlayer(player.getID())) {
      throw new Error('players with duplicate IDs within a competition not allowed')
    }

    this.#players.push(player)
    this.#playerLookup[player.getID()] = player
    return this
  }

  /**
   * Get the players in this competition
   *
   * @returns {array<Player>} The players in this competition
   */
  getPlayers () {
    return this.#players
  }

  /**
   * Get the players in the team with the given ID
   *
   * @param {string} id the ID of the team to get the players for
   *
   * @returns {array<Player>} The players in the team with the given ID
   */
  getPlayersInTeam (id) {
    return this.#players.filter(player => player.getLatestTeamEntry()?.getID() === id)
  }

  /**
   * Returns the Player with the requested ID, or throws if the ID is not found
   *
   * @param {string} id The ID of the player in this competition to return
   *
   * @throws {Error} If a Player with the requested ID was not found
   *
   * @returns {Player} The requested player for this competition
   */
  getPlayer (id) {
    if (!Object.hasOwn(this.#playerLookup, id)) {
      throw new Error(`Player with ID "${id}" not found`)
    }
    return this.#playerLookup[id]
  }

  /**
   * Check if this competition has any players
   *
   * @returns {bool} True if the competition has players, otherwise false
   */
  hasPlayers () {
    return this.#players.length > 0
  }

  /**
   * Check if a player with the given ID exists in this competition
   *
   * @param {string} id The ID of the player to check
   *
   * @returns {bool} True if the player exists, otherwise false
   */
  hasPlayer (id) {
    return Object.hasOwn(this.#playerLookup, id)
  }

  /**
   * Check if the team with the given ID has any players defined
   *
   * @param {string} id the ID of the team to check
   *
   * @returns {boolean} True if the team with the given ID has any players defined
   */
  hasPlayersInTeam (id) {
    return this.#players.some(player => player.getLatestTeamEntry()?.getID() === id)
  }

  /**
   * Check if the player with the given ID exists in the team with the given ID
   *
   * @param {string} playerID the ID of the player to check
   * @param {string} teamID the ID of the team to check
   *
   * @returns {boolean} True if the player with the given ID exists in the team with the given ID
   */
  hasPlayerInTeam (playerID, teamID) {
    return this.hasPlayer(playerID) && this.getPlayer(playerID).getLatestTeamEntry()?.getID() === teamID
  }

  /**
   * Delete a player from the competition
   *
   * @param {string} id The ID of the player to delete
   *
   * @returns {Competition} This Competition instance
   */
  deletePlayer (id) {
    // TODO check if this player is in any matches
    if (!this.hasPlayer(id)) {
      return this
    }

    delete this.#playerLookup[id]
    this.#players = this.#players.filter(el => el.getID() !== id)
    return this
  }

  /**
   * Add a new stage to the competition
   *
   * @param {Stage} stage The stage to add to the competition
   *
   * @throws {Error} If a stage with the requested ID already exists
   *
   * @returns {Competition} This competition
   */
  addStage (stage) {
    if (stage.getCompetition() !== this) {
      throw new Error('Stage was initialised with a different Competition')
    }
    this.#stages.push(stage)
    this.#stageLookup[stage.getID()] = stage
    return this
  }

  /**
   * Get the stages in this competition
   *
   * @returns array The stages in this competition
   */
  getStages () {
    return this.#stages
  }

  /**
   * Returns the Stage with the requested ID, or throws if the ID is not found
   *
   * @param {string} id The ID of the stage to return
   *
   * @throws {Error} When no stage with the provided ID is found
   *
   * @returns {Stage} The requested stage
   */
  getStage (id) {
    if (!Object.hasOwn(this.#stageLookup, id)) {
      throw new Error(`Stage with ID ${id} not found`)
    }
    return this.#stageLookup[id]
  }

  /**
   * Check if a stage with the given ID exists in the competition
   *
   * @param {string} id The ID of the stage to check
   *
   * @returns {bool} True if the stage exists, false otherwise
   */
  hasStage (id) {
    return Object.hasOwn(this.#stageLookup, id)
  }

  /**
   * Delete a stage from the competition
   *
   * @param {string} id The ID of the stage to delete
   *
   * @returns {Competition} This competition
   */
  deleteStage (id) {
    let stageFound = false
    this.#stages.forEach(stage => {
      if (stageFound) {
        stage.getGroups().forEach(group => {
          group.getMatches().forEach(match => {
            let teamReferences = []
            teamReferences = teamReferences.concat(this.#stripTeamReferences(match.getHomeTeam().getID()))
            teamReferences = teamReferences.concat(this.#stripTeamReferences(match.getAwayTeam().getID()))

            const officials = match.getOfficials()
            if (officials !== null && officials.isTeam()) {
              teamReferences = teamReferences.concat(this.#stripTeamReferences(match.getOfficials().getTeamID()))
            }

            teamReferences.forEach(reference => {
              let parts
              if ((parts = reference.match(/^{([^:]*):.*}/)) !== null) {
                if (parts[1] === id) {
                  throw new Error(`Cannot delete stage with id "${id}" as it is referenced in match {${stage.getID()}:${group.getID()}:${match.getID()}}`)
                }
              }
            })
          })
        })
      } else if (stage.getID() === id) {
        stageFound = true
      }
    })

    if (!stageFound) {
      return this
    }

    delete this.#stageLookup[id]
    this.#stages = this.#stages.filter(el => el.getID() !== id)

    return this
  }

  /**
   * Add a new club to the competition
   *
   * @param {Club} club The club to add to the competition
   *
   * @throws {Error} If the input parameters are invalid or if a club with the requested ID already exists
   *
   * @returns {Competition} This competition
   */
  addClub (club) {
    if (club.getCompetition() !== this) {
      throw new Error('Club was initialised with a different Competition')
    }
    this.#clubs.push(club)
    this.#clubLookup[club.getID()] = club
    return this
  }

  /**
   * Get the clubs in this competition
   *
   * @returns {array} The clubs in this competition
   */
  getClubs () {
    return this.#clubs
  }

  /**
   * Returns the Club with the requested ID, or throws if the ID is not found
   *
   * @param {string} id The ID of the club to return
   *
   * @throws {Error} When no club with the provided ID is found
   *
   * @returns {Club} The requested club
   */
  getClub (id) {
    if (!Object.hasOwn(this.#clubLookup, id)) {
      throw new Error(`Club with ID "${id}" not found`)
    }
    return this.#clubLookup[id]
  }

  /**
   * Check if this competition has any clubs
   *
   * @returns {bool} True if the competition has clubs, otherwise false
   */
  hasClubs () {
    return this.#clubs.length > 0
  }

  /**
   * Check if a club with the given ID exists in the competition
   *
   * @param {string} id The ID of the club to check
   *
   * @returns {bool} True if the club exists, false otherwise
   */
  hasClub (id) {
    return Object.hasOwn(this.#clubLookup, id)
  }

  /**
   * Delete a club from the competition
   *
   * @param {string} id The ID of the club to delete
   *
   * @returns {Competition} This competition
   */
  deleteClub (id) {
    if (!this.hasClub(id)) {
      return this
    }

    const club = this.getClub(id)
    const teamsInClub = club.getTeams()
    if (teamsInClub.length > 0) {
      throw new Error(`Club still contains teams with IDs: ${teamsInClub.map(t => `{${t.getID()}}`).join(', ')}`)
    }

    delete this.#clubLookup[id]
    this.#clubs = this.#clubs.filter(club => club.getID() !== id)

    return this
  }

  /**
   * Validates a team ID, throwing an exception if it isn't and returning if the team ID is valid
   *
   * @param {string} teamID The team ID to check. This may be a team ID, a team reference, or a ternary
   * @param {string} matchID The match that the team is a part of (for the exception message)
   * @param {string} field The field the team is active in, e.g. "homeTeam", "officials > team" (for the exception message)
   *
   * @throws {Error} An exception stating that the team ID is invalid
   */
  validateTeamID (teamID, matchID, field) {
    let lrMatches

    // If it looks like a team ID
    if (!teamID.startsWith('{')) {
      try {
        this.#validateTeamExists(teamID)
      } catch (_) {
        throw new Error(`Invalid team ID for ${field} in match with ID "${matchID}"`)
      }
      // If it looks like a ternary
    } else if ((lrMatches = teamID.match(/^([^=]*)==([^?]*)\?(.*)/)) !== null) {
      // Check the "left" part is a team reference
      try {
        this.#validateTeamReference(lrMatches[1])
      } catch (_) {
        throw new Error(`Invalid ternary left part reference for ${field} in match with ID "${matchID}": "${lrMatches[1]}"`)
      }

      // Check the "right" part is a team reference
      try {
        this.#validateTeamReference(lrMatches[2])
      } catch (_) {
        throw new Error(`Invalid ternary right part reference for ${field} in match with ID "${matchID}": "${lrMatches[2]}"`)
      }

      let tfMatches
      if ((tfMatches = lrMatches[3].match(/^({[^}]*}):(.*)/)) !== null) {
        // If "true" team is a reference...
        try {
          this.#validateTeamReference(tfMatches[1])
        } catch (_) {
          throw new Error(`Invalid ternary true team reference for ${field} in match with ID "${matchID}": "${tfMatches[1]}"`)
        }

        try {
          if (!tfMatches[2].startsWith('{')) {
            this.#validateTeamExists(tfMatches[2])
          } else {
            this.#validateTeamReference(tfMatches[2])
          }
        } catch (_) {
          throw new Error(`Invalid ternary false team reference for ${field} in match with ID "${matchID}": "${tfMatches[2]}"`)
        }
      } else if ((tfMatches = lrMatches[3].match(/^([^:]*):(.*)/)) !== null) {
        try {
          this.#validateTeamExists(tfMatches[1])
        } catch (_) {
          throw new Error(`Invalid ternary true team reference for ${field} in match with ID "${matchID}": "${tfMatches[1]}"`)
        }

        try {
          if (!tfMatches[2].startsWith('{')) {
            this.#validateTeamExists(tfMatches[2])
          } else {
            this.#validateTeamReference(tfMatches[2])
          }
        } catch (_) {
          throw new Error(`Invalid ternary false team reference for ${field} in match with ID "${matchID}": "${tfMatches[2]}"`)
        }
      }
      // If it looks like an invalid team ref
    } else if (teamID.match(/^{[^}]*$/) !== null) {
      throw new Error(`Invalid team reference for ${field} in match with ID "${matchID}": "${teamID}"`)
      // It must be a team reference
    } else {
      this.#validateTeamReference(teamID)
    }
  }

  /**
   * Takes in an exact, resolved team ID and checks that the team exists
   *
   * @param {string} id The team ID to check. This must be a resolved team ID, not a team reference or a ternary
   *
   * @throws {Error} An exception if the team does not exist
   */
  #validateTeamExists (id) {
    if (!this.hasTeam(id)) {
      throw new Error(`Team with ID "${id}" does not exist`)
    }
  }

  /**
   * Takes in a team reference and validates that it is valid.  This performs the following checks
   * <ul>
   *   <li>Is the reference syntax valid</li>
   *   <li>Does the referenced Stage exist</li>
   *   <li>Does the referenced Group exist</li>
   *   <li>For a League position reference, is the position a valid integer</li>
   *   <li>For a League position reference in a <em>completed</em> League, is the position in the bounds of the number of teams</li>
   *   <li>Does the referenced Match exist</li>
   *   <li>For a Match winner/loser, is the result reference valid</li>
   * </ul>
   *
   * @param {string} teamRef The team reference to check
   *
   * @throws {Error} An exception if the team reference is invalid
   */
  #validateTeamReference (teamRef) {
    let parts
    if ((parts = teamRef.match(/^{([^:]*):([^:]*):([^:]*):(.*)}/)) !== null) {
      let stage
      let group

      try {
        stage = this.getStage(parts[1])
      } catch (_) {
        throw new Error(`Invalid Stage part: Stage with ID "${parts[1]}" does not exist`)
      }

      try {
        group = stage.getGroup(parts[2])
      } catch (_) {
        throw new Error(`Invalid Group part: Group with ID "${parts[2]}" does not exist in stage with ID "${parts[1]}"`)
      }

      if (parts[3] === 'league') {
        if (isNaN(parseInt(parts[4]))) {
          throw new Error('Invalid League position: reference must be an integer')
        }
        if (parseInt(parts[4]) < 1) {
          throw new Error('Invalid League position: reference must be a positive integer')
        }
        if (group.isComplete()) {
          const teamsInGroup = group.getTeamIDs(Competition.VBC_TEAMS_KNOWN)
          if (teamsInGroup.length < parseInt(parts[4])) {
            throw new Error('Invalid League position: position is bigger than the number of teams')
          }
        }
      } else {
        try {
          group.getMatch(parts[3])
        } catch (_) {
          throw new Error(`Invalid Match part in reference ${teamRef} : Match with ID "${parts[3]}" does not exist in stage:group with IDs "${parts[1]}:${parts[2]}"`)
        }
        if (parts[4] !== 'winner' && parts[4] !== 'loser') {
          throw new Error(`Invalid Match result in reference ${teamRef}: reference must be one of "winner"|"loser" in stage:group:match with IDs "${parts[1]}:${parts[2]}:${parts[3]}"`)
        }
      }
    } else {
      throw new Error(`Invalid team reference format "${teamRef}", must be "{STAGE-ID:GROUP-ID:TYPE-INDICATOR:ENTITY-INDICATOR}"`)
    }
  }

  /**
   * This function recursively extracts team references from the team ID, including
   * stripping out team references in a ternary statement
   *
   * @param {string} teamReference The string containing team references.
   *
   * @returns {Array<string>} An array containing unique team references extracted from the input string.
   */
  #stripTeamReferences (teamReference) {
    let references = []
    let lrMatches
    if (!teamReference.startsWith('{')) {
      return []
    } else if ((lrMatches = teamReference.match(/^([^=]*)==([^?]*)\?(.*)/)) !== null) {
      references = references.concat(this.#stripTeamReferences(lrMatches[1]))
      references = references.concat(this.#stripTeamReferences(lrMatches[2]))
      let tfMatches
      if ((tfMatches = lrMatches[3].match(/^({[^}]*}):(.*)/)) !== null) {
        references = references.concat(this.#stripTeamReferences(tfMatches[1]))
        references = references.concat(this.#stripTeamReferences(tfMatches[2]))
      }
    } else {
      references.push(teamReference)
    }

    return [...new Set(references)]
  }

  /**
   * Check whether all stages are complete, i.e. all matches in all stages have results
   * and the competition results can be fully calculated
   *
   * @returns {bool} Whether the competition is complete or not
   */
  isComplete () {
    for (let i = 0; i < this.#stages.length; i++) {
      if (!this.#stages[i].isComplete()) {
        return false
      }
    }

    return true
  }
}

export default Competition
