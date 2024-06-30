import LeagueTable from './leagueTable.js'
import LeagueTableEntry from './leagueTableEntry.js'
import Group from './group.js'
import GroupBreak from './groupBreak.js'
import GroupType from './groupType.js'

/**
 * A group within this stage of the competition. Leagues expect all teams to play each other at least once, and have a league table
 */
class League extends Group {
  /**
   * The table for this group, if the group type is league
   * @type {LeagueTable}
   * @private
   */
  #table

  /**
   * Constructs a new League instance.
   *
   * @param {Stage} stage A link back to the Stage this Group is in
   * @param {string} id The unique ID of this Group
   * @param {MatchType} matchType Whether matches are continuous or played to sets
   * @param {boolean} drawsAllowed Indicates whether draws are allowed in matches
   */
  constructor (stage, id, matchType, drawsAllowed) {
    super(stage, id, matchType)
    this._type = GroupType.LEAGUE
    this._drawsAllowed = drawsAllowed
  }

  /**
   * Processes matches to update the league table.
   *
   * @returns {void}
   */
  processMatches () {
    if (this._matchesProcessed) {
      return
    }
    this._matchesProcessed = true

    this.#table = new LeagueTable(this)

    const teamResults = []

    this._matches.forEach(match => {
      if (match instanceof GroupBreak || match.isFriendly()) {
        return
      }

      const homeTeamID = match.getHomeTeam().getID()
      const awayTeamID = match.getAwayTeam().getID()

      if (!teamResults[homeTeamID]) {
        teamResults[homeTeamID] = new LeagueTableEntry(this, homeTeamID, this._competition.getTeam(homeTeamID).getName())
      }

      if (!teamResults[awayTeamID]) {
        teamResults[awayTeamID] = new LeagueTableEntry(this, awayTeamID, this._competition.getTeam(awayTeamID).getName())
      }

      if (match.isComplete()) {
        // Handle draws
        if (!match.isDraw()) {
          teamResults[match.getWinnerTeamID()].setWins(teamResults[match.getWinnerTeamID()].getWins() + 1)
          teamResults[match.getLoserTeamID()].setLosses(teamResults[match.getLoserTeamID()].getLosses() + 1)

          teamResults[match.getWinnerTeamID()].getH2H()[match.getLoserTeamID()] = (teamResults[match.getWinnerTeamID()].getH2H()[match.getLoserTeamID()] || 0) + 1
          teamResults[match.getLoserTeamID()].getH2H()[match.getWinnerTeamID()] = (teamResults[match.getLoserTeamID()].getH2H()[match.getWinnerTeamID()] || 0) - 1
        } else {
          if (!teamResults[homeTeamID].getH2H()[awayTeamID]) {
            teamResults[homeTeamID].getH2H()[awayTeamID] = 0
          }
          if (!teamResults[awayTeamID].getH2H()[homeTeamID]) {
            teamResults[awayTeamID].getH2H()[homeTeamID] = 0
          }
        }

        teamResults[homeTeamID].setPlayed(teamResults[homeTeamID].getPlayed() + 1)
        teamResults[awayTeamID].setPlayed(teamResults[awayTeamID].getPlayed() + 1)

        if (this.#table.hasSets()) {
          let homeTeamSets = 0
          let awayTeamSets = 0
          for (let i = 0; i < match.getHomeTeam().getScores().length; i++) {
            if (match.getHomeTeam().getScores()[i] < this._sets.getMinPoints() && match.getAwayTeam().getScores()[i] < this._sets.getMinPoints()) {
              continue
            }
            teamResults[homeTeamID].setPF(teamResults[homeTeamID].getPF() + match.getHomeTeam().getScores()[i])
            teamResults[homeTeamID].setPA(teamResults[homeTeamID].getPA() + match.getAwayTeam().getScores()[i])

            teamResults[awayTeamID].setPF(teamResults[awayTeamID].getPF() + match.getAwayTeam().getScores()[i])
            teamResults[awayTeamID].setPA(teamResults[awayTeamID].getPA() + match.getHomeTeam().getScores()[i])

            if (match.getHomeTeam().getScores()[i] > match.getAwayTeam().getScores()[i]) {
              homeTeamSets++
            } else if (match.getHomeTeam().getScores()[i] < match.getAwayTeam().getScores()[i]) {
              awayTeamSets++
            }
          }
          teamResults[homeTeamID].setSF(teamResults[homeTeamID].getSF() + homeTeamSets)
          teamResults[homeTeamID].setSA(teamResults[homeTeamID].getSA() + awayTeamSets)
          teamResults[awayTeamID].setSF(teamResults[awayTeamID].getSF() + awayTeamSets)
          teamResults[awayTeamID].setSA(teamResults[awayTeamID].getSA() + homeTeamSets)

          teamResults[homeTeamID].setPTS(teamResults[homeTeamID].getPTS() + (this._leagueConfig.getPoints().getPerSet() * homeTeamSets))
          teamResults[awayTeamID].setPTS(teamResults[awayTeamID].getPTS() + (this._leagueConfig.getPoints().getPerSet() * awayTeamSets))
          if (match.isDraw()) {
            teamResults[homeTeamID].setDraws(teamResults[homeTeamID].getDraws() + 1)
            teamResults[awayTeamID].setDraws(teamResults[awayTeamID].getDraws() + 1)
          } else {
            if (Math.abs(homeTeamSets - awayTeamSets) === 1) {
              teamResults[match.getWinnerTeamID()].setPTS(teamResults[match.getWinnerTeamID()].getPTS() + this._leagueConfig.getPoints().getWinByOne())
              teamResults[match.getLoserTeamID()].setPTS(teamResults[match.getLoserTeamID()].getPTS() + this._leagueConfig.getPoints().getLoseByOne())
            } else {
              teamResults[match.getWinnerTeamID()].setPTS(teamResults[match.getWinnerTeamID()].getPTS() + this._leagueConfig.getPoints().getWin())
              teamResults[match.getLoserTeamID()].setPTS(teamResults[match.getLoserTeamID()].getPTS() + this._leagueConfig.getPoints().getLose())
            }
          }
        } else {
          teamResults[homeTeamID].setPF(teamResults[homeTeamID].getPF() + match.getHomeTeam().getScores()[0])
          teamResults[homeTeamID].setPA(teamResults[homeTeamID].getPA() + match.getAwayTeam().getScores()[0])

          teamResults[awayTeamID].setPF(teamResults[awayTeamID].getPF() + match.getAwayTeam().getScores()[0])
          teamResults[awayTeamID].setPA(teamResults[awayTeamID].getPA() + match.getHomeTeam().getScores()[0])
          if (match.isDraw()) {
            teamResults[homeTeamID].setDraws(teamResults[homeTeamID].getDraws() + 1)
            teamResults[awayTeamID].setDraws(teamResults[awayTeamID].getDraws() + 1)
          } else {
            teamResults[match.getWinnerTeamID()].setPTS(teamResults[match.getWinnerTeamID()].getPTS() + this._leagueConfig.getPoints().getWin())
            teamResults[match.getLoserTeamID()].setPTS(teamResults[match.getLoserTeamID()].getPTS() + this._leagueConfig.getPoints().getLose())
          }
        }

        if (match.getHomeTeam().getForfeit()) {
          teamResults[homeTeamID].setPTS(teamResults[homeTeamID].getPTS() - this._leagueConfig.getPoints().getForfeit())
        }
        if (match.getAwayTeam().getForfeit()) {
          teamResults[awayTeamID].setPTS(teamResults[awayTeamID].getPTS() - this._leagueConfig.getPoints().getForfeit())
        }
        teamResults[homeTeamID].setBP(teamResults[homeTeamID].getBP() + match.getHomeTeam().getBonusPoints())
        teamResults[homeTeamID].setPP(teamResults[homeTeamID].getPP() + match.getHomeTeam().getPenaltyPoints())

        teamResults[awayTeamID].setBP(teamResults[awayTeamID].getBP() + match.getAwayTeam().getBonusPoints())
        teamResults[awayTeamID].setPP(teamResults[awayTeamID].getPP() + match.getAwayTeam().getPenaltyPoints())
      }
    })

    Object.values(teamResults).forEach(teamLine => {
      teamLine.setPD(teamLine.getPF() - teamLine.getPA())
      teamLine.setSD(teamLine.getSF() - teamLine.getSA())
      teamLine.setPTS(teamLine.getPTS() + (teamLine.getPlayed() * this._leagueConfig.getPoints().getPlayed()) + teamLine.getBP() - teamLine.getPP())
      this.#table.entries.push(teamLine)
    })

    this.#table.entries.sort((a, b) => this.#sortLeagueTable(a, b))
  }

  /**
   * Sorts the league table entries based on the configured ordering.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the first argument is considered to be respectively less than, equal to, or greater than the second.
   */
  #sortLeagueTable (a, b) {
    const ordering = this._leagueConfig.getOrdering()
    for (let i = 0; i < ordering.length; i++) {
      let compareResult = 0
      switch (ordering[i]) {
        case 'PTS':
          compareResult = League.#compareLeaguePoints(a, b)
          break
        case 'WINS':
          compareResult = League.#compareWins(a, b)
          break
        case 'LOSSES':
          compareResult = League.#compareLosses(a, b)
          break
        case 'H2H':
          compareResult = League.#compareHeadToHead(a, b)
          break
        case 'PF':
          compareResult = League.#comparePointsFor(a, b)
          break
        case 'PA':
          compareResult = League.#comparePointsAgainst(a, b)
          break
        case 'PD':
          compareResult = League.#comparePointsDifference(a, b)
          break
        case 'SF':
          compareResult = League.#compareSetsFor(a, b)
          break
        case 'SA':
          compareResult = League.#compareSetsAgainst(a, b)
          break
        case 'SD':
          compareResult = League.#compareSetsDifference(a, b)
          break
        case 'BP':
          compareResult = League.#compareBonusPoints(a, b)
          break
        case 'PP':
          compareResult = League.#comparePenaltyPoints(a, b)
          break
      }
      if (compareResult !== 0) {
        return compareResult
      }
    }
    return League.#compareTeamName(a, b)
  }

  /**
   * Compares two LeagueTableEntry objects based on their team names.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the team name of the first entry is considered to be respectively less than, equal to, or greater than the team name of the second entry.
   */
  static #compareTeamName (a, b) {
    return a.getTeam().localeCompare(b.getTeam())
  }

  /**
   * Compares two LeagueTableEntry objects based on their league points.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the team name of the first entry is considered to be respectively less than, equal to, or greater than the team name of the second entry.
   */
  static #compareLeaguePoints (a, b) {
    return b.getPTS() - a.getPTS()
  }

  /**
   * Compares two LeagueTableEntry objects based on their wins.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the team name of the first entry is considered to be respectively less than, equal to, or greater than the team name of the second entry.
   */
  static #compareWins (a, b) {
    return b.getWins() - a.getWins()
  }

  /**
   * Compares two LeagueTableEntry objects based on their losses.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the team name of the first entry is considered to be respectively less than, equal to, or greater than the team name of the second entry.
   */
  static #compareLosses (a, b) {
    return b.getLosses() - a.getLosses()
  }

  /**
   * Compares two LeagueTableEntry objects based on their head to head record.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the team name of the first entry is considered to be respectively less than, equal to, or greater than the team name of the second entry.
   */
  static #compareHeadToHead (a, b) {
    if (!Object.hasOwn(a.getH2H(), b.getTeamID()) || !Object.hasOwn(b.getH2H(), a.getTeamID())) {
      return 0
    }
    return b.getH2H()[a.getTeamID()] - a.getH2H()[b.getTeamID()]
  }

  /**
   * Compares two LeagueTableEntry objects based on their points scored.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the team name of the first entry is considered to be respectively less than, equal to, or greater than the team name of the second entry.
   */
  static #comparePointsFor (a, b) {
    return b.getPF() - a.getPF()
  }

  /**
   * Compares two LeagueTableEntry objects based on their points conceded.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the team name of the first entry is considered to be respectively less than, equal to, or greater than the team name of the second entry.
   */
  static #comparePointsAgainst (a, b) {
    return a.getPA() - b.getPA()
  }

  /**
   * Compares two LeagueTableEntry objects based on their points difference.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the team name of the first entry is considered to be respectively less than, equal to, or greater than the team name of the second entry.
   */
  static #comparePointsDifference (a, b) {
    return b.getPD() - a.getPD()
  }

  /**
   * Compares two LeagueTableEntry objects based on their sets won.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the team name of the first entry is considered to be respectively less than, equal to, or greater than the team name of the second entry.
   */
  static #compareSetsFor (a, b) {
    return b.getSF() - a.getSF()
  }

  /**
   * Compares two LeagueTableEntry objects based on their sets lost.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the team name of the first entry is considered to be respectively less than, equal to, or greater than the team name of the second entry.
   */
  static #compareSetsAgainst (a, b) {
    return a.getSA() - b.getSA()
  }

  /**
   * Compares two LeagueTableEntry objects based on their set difference.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the team name of the first entry is considered to be respectively less than, equal to, or greater than the team name of the second entry.
   */
  static #compareSetsDifference (a, b) {
    return b.getSD() - a.getSD()
  }

  /**
   * Compares two LeagueTableEntry objects based on their bonus points.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the team name of the first entry is considered to be respectively less than, equal to, or greater than the team name of the second entry.
   */
  static #compareBonusPoints (a, b) {
    return b.getBP() - a.getBP()
  }

  /**
   * Compares two LeagueTableEntry objects based on their penalty points.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the team name of the first entry is considered to be respectively less than, equal to, or greater than the team name of the second entry.
   */
  static #comparePenaltyPoints (a, b) {
    return a.getPP() - b.getPP()
  }

  /**
   * Gets the league table for this group.
   *
   * @throws {Error} If the league table cannot be retrieved
   * @returns {LeagueTable} The league table
   */
  getLeagueTable () {
    this.processMatches()
    return this.#table
  }

  /**
   * Returns the configuration object for the league.
   *
   * @returns {LeagueConfig} The league configuration object
   */
  getLeagueConfig () {
    return this._leagueConfig
  }

  /**
   * Gets the team by ID based on the type of entity.
   *
   * @param {string} type The type part of the team reference ('MATCH-ID' or 'league')
   * @param {string} entity The entity (e.g., 'winner' or 'loser')
   * @returns {CompetitionTeam} The CompetitionTeam instance
   * @throws {Error} If the entity is invalid
   */
  getTeam (type, entity) {
    if (type === 'league') {
      this.processMatches()
      if (!this.isComplete()) {
        throw new Error('Cannot get the team in a league position on an incomplete league')
      }
      if (parseInt(entity) > this.#table.entries.length) {
        throw new Error('Invalid League position: position is bigger than the number of teams')
      }
      return this._competition.getTeam(this.#table.entries[parseInt(entity) - 1].getTeamID())
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
}

export default League
