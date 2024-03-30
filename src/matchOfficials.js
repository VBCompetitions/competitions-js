import IfUnknownMatch from './ifUnknownMatch.js'

/**
 * Represents the officials for a match in a competition.
 */
class MatchOfficials {
  /**
   * The first referee
   * @type {string|null}
   * @private
   */
  #first

  /**
   * The second referee
   * @type {string|null}
   * @private
   */
  #second

  /**
   * The challenge referee, responsible for resolving challenges from the teams
   * @type {string|null}
   * @private
   */
  #challenge

  /**
   * The assistant challenge referee, who assists the challenge referee
   * @type {string|null}
   * @private
   */
  #assistantChallenge

  /**
   * The reserve referee
   * @type {string|null}
   * @private
   */
  #reserve

  /**
   * The scorer
   * @type {string|null}
   * @private
   */
  #scorer

  /**
   * The assistant scorer
   * @type {string|null}
   * @private
   */
  #assistantScorer

  /**
   * The list of linespersons
   * @type {string[]}
   * @private
   */
  #linespersons

  /**
   * The list of people in charge of managing the game balls
   * @type {string[]}
   * @private
   */
  #ballCrew

  /**
   * The team assigned to referee the match.
   * @type {string|null}
   * @private
   */
  #officialsTeam

  /**
   * The match these Officials are in
   * @type {MatchInterface}
   * @private
   */
  #match

  /**
   * Contains the officials data.
   *
   * @param {MatchInterface} match The Match these Officials are in
   * @param {string|null} teamID The ID of the team officiating the match
   * @param {string|null} first The name of the first referee
   * @param {boolean|null} isUnknown Whether the team ID is unknown
   * @throws {Error} If Match Officials must be either a team or a person
   */
  constructor (match, teamID, first = null, isUnknown = false) {
    this.#match = match
    if (teamID !== null) {
      this.setTeamID(teamID, isUnknown === true)
      this.#first = null
    } else if (first !== null) {
      this.setFirstRef(first)
      this.#officialsTeam = null
    } else {
      throw new Error('Match Officials must be either a team or a person')
    }
    this.#second = null
    this.#challenge = null
    this.#assistantChallenge = null
    this.#reserve = null
    this.#scorer = null
    this.#assistantScorer = null
    this.#linespersons = []
    this.#ballCrew = []
  }

  /**
   * Load match officials data from a given object.
   *
   * @param {MatchInterface} match The match these Officials are in
   * @param {object} officialsData The data defining this match's Officials
   * @return {MatchOfficials} The match officials instance
   */
  static loadFromData (match, officialsData) {
    let officials
    if (typeof officialsData === 'object' && officialsData.team !== undefined) {
      officials = new MatchOfficials(match, officialsData.team, null, match instanceof IfUnknownMatch)
    } else {
      officials = new MatchOfficials(match, null, officialsData.first, match instanceof IfUnknownMatch)
      if (officialsData.second !== undefined) {
        officials.setSecondRef(officialsData.second)
      }
      if (officialsData.challenge !== undefined) {
        officials.setChallengeRef(officialsData.challenge)
      }
      if (officialsData.assistantChallenge !== undefined) {
        officials.setAssistantChallengeRef(officialsData.assistantChallenge)
      }
      if (officialsData.reserve !== undefined) {
        officials.setReserveRef(officialsData.reserve)
      }
      if (officialsData.scorer !== undefined) {
        officials.setScorer(officialsData.scorer)
      }
      if (officialsData.assistantScorer !== undefined) {
        officials.setAssistantScorer(officialsData.assistantScorer)
      }
      if (officialsData.linespersons !== undefined) {
        officials.setLinespersons(officialsData.linespersons)
      }
      if (officialsData.ballCrew !== undefined) {
        officials.setBallCrew(officialsData.ballCrew)
      }
    }

    return officials
  }

  /**
   * Return the match officials definition in a form suitable for serializing
   *
   * @return {Object|string} The serialized match officials data
   */
  serialize () {
    const officials = {}
    if (this.#officialsTeam !== null) {
      officials.team = this.#officialsTeam
      return officials
    }

    officials.first = this.#first
    if (this.#second !== null) {
      officials.second = this.#second
    }
    if (this.#challenge !== null) {
      officials.challenge = this.#challenge
    }
    if (this.#assistantChallenge !== null) {
      officials.assistantChallenge = this.#assistantChallenge
    }
    if (this.#reserve !== null) {
      officials.reserve = this.#reserve
    }
    if (this.#scorer !== null) {
      officials.scorer = this.#scorer
    }
    if (this.#assistantScorer !== null) {
      officials.assistantScorer = this.#assistantScorer
    }
    if (this.#linespersons.length > 0) {
      officials.linespersons = this.#linespersons
    }
    if (this.#ballCrew.length > 0) {
      officials.ballCrew = this.#ballCrew
    }

    return officials
  }

  /**
   * Get the match this manager is managing.
   *
   * @return {MatchInterface} The match being managed
   */
  getMatch () {
    return this.#match
  }

  /**
   * Get whether the match official is a team or not.
   *
   * @return {boolean} Whether the official is a team or not
   */
  isTeam () {
    return this.#officialsTeam !== null
  }

  /**
   * Get the ID of the team officiating the match.
   *
   * @return {string|null} The team ID
   */
  getTeamID () {
    return this.#officialsTeam
  }

  /**
   * Set the officiating team.
   *
   * @param {string|null} officialsTeam The ID of the officiating team
   */
  setTeamID (officialsTeam, isUnknown = false) {
    if (!isUnknown) {
      this.#match.getGroup().getCompetition().validateTeamID(officialsTeam, this.#match.getID(), 'officials')
    }
    this.#officialsTeam = officialsTeam
    this.#first = null
    this.#second = null
    this.#challenge = null
    this.#assistantChallenge = null
    this.#reserve = null
    this.#scorer = null
    this.#assistantScorer = null
    this.#linespersons = []
    this.#ballCrew = []
  }

  /**
   * Get the first referee
   *
   * @return {string|null} the name of the first referee
   */
  getFirstRef () {
    return this.#first
  }

  /**
   * Set the first referee.
   *
   * @param {string|null} first The name of the first referee
   */
  setFirstRef (first) {
    this.#first = first
    this.#officialsTeam = null
  }

  /**
   * Get whether the match has a second referee.
   *
   * @return {boolean} Whether the match has a second referee
   */
  hasSecondRef () {
    return this.#second !== null
  }

  /**
   * Get the second referee.
   *
   * @return {string|null} The name of the second referee
   */
  getSecondRef () {
    return this.#second
  }

  /**
   * Set the second referee.
   *
   * @param {string|null} second The name of the second referee
   */
  setSecondRef (second) {
    this.#second = second
    this.#officialsTeam = null
  }

  /**
   * Get whether the match has a challenge referee.
   *
   * @return {boolean} Whether the match has a challenge referee
   */
  hasChallengeRef () {
    return this.#challenge !== null
  }

  /**
   * Get the challenge referee's name.
   *
   * @return {string|null} The name of the challenge referee
   */
  getChallengeRef () {
    return this.#challenge
  }

  /**
   * Set the challenge referee's name.
   *
   * @param {string|null} challenge The name of the challenge referee
   */
  setChallengeRef (challenge) {
    this.#challenge = challenge
    this.#officialsTeam = null
  }

  /**
   * Check if the match has an assistant challenge referee.
   *
   * @return {boolean} Whether the match has an assistant challenge referee
   */
  hasAssistantChallengeRef () {
    return this.#assistantChallenge !== null
  }

  /**
   * Get the name of the assistant challenge referee.
   *
   * @return {string|null} The name of the assistant challenge referee
   */
  getAssistantChallengeRef () {
    return this.#assistantChallenge
  }

  /**
   * Set the name of the assistant challenge referee.
   *
   * @param {string|null} assistantChallenge The name of the assistant challenge referee
   */
  setAssistantChallengeRef (assistantChallenge) {
    this.#assistantChallenge = assistantChallenge
    this.#officialsTeam = null
  }

  /**
   * Check if the match has a reserve referee.
   *
   * @return {boolean} Whether the match has a reserve referee
   */
  hasReserveRef () {
    return this.#reserve !== null
  }

  /**
   * Get the name of the reserve referee.
   *
   * @return {string|null} The name of the reserve referee
   */
  getReserveRef () {
    return this.#reserve
  }

  /**
   * Set the name of the reserve referee.
   *
   * @param {string|null} reserve The name of the reserve referee
   */
  setReserveRef (reserve) {
    this.#reserve = reserve
    this.#officialsTeam = null
  }

  /**
   * Check if the match has a scorer.
   *
   * @return {boolean} Whether the match has a scorer
   */
  hasScorer () {
    return this.#scorer !== null
  }

  /**
   * Get the name of the scorer.
   *
   * @return {string|null} The name of the scorer
   */
  getScorer () {
    return this.#scorer
  }

  /**
   * Set the name of the scorer.
   *
   * @param {string|null} scorer The name of the scorer
   */
  setScorer (scorer) {
    this.#scorer = scorer
    this.#officialsTeam = null
  }

  /**
   * Check if the match has an assistant scorer.
   *
   * @return {boolean} Whether the match has an assistant scorer
   */
  hasAssistantScorer () {
    return this.#assistantScorer !== null
  }

  /**
   * Get the name of the assistant scorer.
   *
   * @return {string|null} The name of the assistant scorer
   */
  getAssistantScorer () {
    return this.#assistantScorer
  }

  /**
   * Set the name of the assistant scorer.
   *
   * @param {string|null} assistantScorer The name of the assistant scorer
   */
  setAssistantScorer (assistantScorer) {
    this.#assistantScorer = assistantScorer
    this.#officialsTeam = null
  }

  /**
   * Check if the match has any linespersons.
   *
   * @return {boolean} Whether the match has any linespersons
   */
  hasLinespersons () {
    return this.#linespersons.length > 0
  }

  /**
   * Get the list of linespersons.
   *
   * @return {string[]} The list of linespersons
   */
  getLinespersons () {
    return this.#linespersons
  }

  /**
   * Set the list of linespersons.
   *
   * @param {string[]} linespersons The list of linespersons
   */
  setLinespersons (linespersons) {
    this.#linespersons = linespersons
    this.#officialsTeam = null
  }

  /**
   * Check if the match has a ball crew.
   *
   * @return {boolean} Whether the match has a ball crew
   */
  hasBallCrew () {
    return this.#ballCrew.length > 0
  }

  /**
   * Get the list of ball crew members.
   *
   * @return {string[]} The list of ball crew members
   */
  getBallCrew () {
    return this.#ballCrew
  }

  /**
   * Set the list of ball crew members.
   *
   * @param {string[]} ballCrew The list of ball crew members
   */
  setBallCrew (ballCrew) {
    this.#ballCrew = ballCrew
    this.#officialsTeam = null
  }
}

export default MatchOfficials
