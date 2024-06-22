'use strict';

var Ajv = require('ajv');
var addFormats = require('ajv-formats');

class Club {
  /**
   * A unique ID for the club, e.g. 'CLUB1'.  This must be unique within the competition.  It must only contain letters (upper or lowercase), and numbers
   * @type {string}
   * @private
   */
  #id

  /**
   * The name for the club
   * @type {string}
   * @private
   */
  #name

  /**
   * Free form string to add notes about a club.  This can be used for arbitrary content that various implementations can use
   * @type {string|null}
   * @private
   */
  #notes

  /**
   * The Competition this club is in
   * @type {Competition}
   * @private
   */
  #competition

  /**
   * A Lookup table from team IDs (including references) to the team
   * @type {Object}
   * @private
   */
  /** @var object  */
  #teamLookup

  static UNKNOWN_CLUB_ID = 'UNKNOWN'
  static UNKNOWN_CLUB_NAME = 'UNKNOWN'

  /**
   * Contains the club data of a competition, creating any metadata needed
   *
   * @param {Competition} competition A link back to the Competition this Stage is in
   * @param {string} clubID The ID of this Team
   * @param {string} clubName The name of this Team
   * @throws {Error} When the provided club ID is invalid or already exists in the competition
   */
  constructor (competition, clubID, clubName) {
    if (clubID.length > 100 || clubID.length < 1) {
      throw new Error('Invalid club ID: must be between 1 and 100 characters long')
    }

    if (!/^((?![":{}?=])[\x20-\x7F])+$/.test(clubID)) {
      throw new Error('Invalid club ID: must contain only ASCII printable characters excluding " : { } ? =')
    }

    if (competition.hasClubWithID(clubID)) {
      throw new Error(`Club with ID "${clubID}" already exists in the competition`)
    }

    this.#competition = competition;
    this.#id = clubID;
    this.setName(clubName);
    this.#notes = null;
    this.#teamLookup = {};
  }

  /**
   * Assumes this is a freshly made Club object and loads it with the data extracted
   * from the Competitions JSON file for this club
   *
   * @param {object} clubData Data from a Competitions JSON file for a single club
   * @return {Club} the updated club object
   */
  loadFromData (clubData) {
    if (Object.hasOwn(clubData, 'notes')) {
      this.setNotes(clubData.notes);
    }
    return this
  }

  /**
   * Return the club definition in a form suitable for serializing
   *
   * @return {Object}
   */
  serialize () {
    const team = {
      id: this.#id,
      name: this.#name
    };

    if (this.#notes !== null) {
      team.notes = this.#notes;
    }

    return team
  }

  /**
   * Get the competition this club is in
   *
   * @return {Competition}
   */
  getCompetition () {
    return this.#competition
  }

  /**
   * Get the ID for this club
   *
   * @return {string} the id for this club
   */
  getID () {
    return this.#id
  }

  /**
   * Set the name for this club
   *
   * @param {string} name the name for this club
   * @return {Club} this Club
   * @throws {Error} When the provided club name is invalid
   */
  setName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid club name: must be between 1 and 1000 characters long')
    }
    this.#name = name;
    return this
  }

  /**
   * Get the name for this club
   *
   * @return {string} the name for this club
   */
  getName () {
    return this.#name
  }

  /**
   * Set the notes for this club
   *
   * @param {string|null} notes the notes for this club
   * @return {Club} this Club
   */
  setNotes (notes) {
    this.#notes = notes;
    return this
  }

  /**
   * Get the notes for this club
   *
   * @return {string|null} the notes for this club
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Does this club have any notes attached
   *
   * @return {bool} True if the club has notes, otherwise false
   */
  hasNotes () {
    return this.#notes !== null
  }

  /**
   * Add a team to this club
   *
   * @param {CompetitionTeam} team the team to add
   * @return {Club} this Club
   */
  addTeam (team) {
    if (this.hasTeamWithID(team.getID())) {
      return this
    }
    this.#teamLookup[team.getID()] = team;
    team.setClubID(this.getID());
    return this
  }

  /**
   * Get the teams in this club
   *
   * @return {array<CompetitionTeam>}
   */
  getTeams () {
    return Object.values(this.#teamLookup)
  }

  /**
   * Check if the club has a team with the specified ID
   *
   * @param {string} teamID The ID of the team
   * @return {bool}
   */
  hasTeamWithID (teamID) {
    return Object.hasOwn(this.#teamLookup, teamID)
  }

  /**
   * Delete a team from this club
   *
   * @param {string} teamID The ID of the team to delete
   * @return void
   */
  deleteTeam (teamID) {
    if (this.hasTeamWithID(teamID)) {
      const team = this.#teamLookup[teamID];
      delete this.#teamLookup[teamID];
      team.setClubID(null);
    }
    return this
  }
}

var e={d:(t,i)=>{for(var n in i)e.o(i,n)&&!e.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:i[n]});},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},t={};e.d(t,{f:()=>i});const i=JSON.parse('{"$schema":"http://json-schema.org/draft-07/schema#","$id":"https://github.com/monkeysppp/VBCompetitions-schema/tree/1.0.0","title":"Definition of a competition in VolleyTourney","description":"This document contains the teams, the competition structure, the matches and the results of a volleyball competition","type":"object","properties":{"version":{"description":"The version of schema that the document conforms to.  Defaults to 1.0.0","type":"string","default":"1.0.0","enum":["1.0.0"]},"metadata":{"description":"A list of key-value pairs representing metadata about the competition, where each key must be unique. This can be used for functionality such as associating a competition with a season, and searching for competitions with matching metadata","type":"array","minItems":1,"maxItems":1000,"items":{"description":"A key-value pair","type":"object","additionalProperties":false,"properties":{"key":{"description":"The key for a metadata entry","type":"string","minLength":1,"maxLength":100},"value":{"description":"The value for a metadata entry.  Note that this must be a string, so values such as \\"true\\", \\"false\\" or \\"null\\" must be represented as a string","type":"string","minLength":1,"maxLength":1000}},"required":["key","value"]}},"name":{"description":"A name for the competition","type":"string","minLength":1,"maxLength":10000},"notes":{"description":"Free form string to add notes about the competition.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1},"clubs":{"description":"A list of clubs that the teams are in","type":"array","items":{"description":"A club definition","type":"object","additionalProperties":false,"properties":{"id":{"description":"An ID for the club, e.g. \'CLUB1\'.  This must be unique within the competition.  It must contain only ASCII printable characters excluding \\" : { } ? =","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"name":{"description":"The name for the club","type":"string","minLength":1,"maxLength":1000},"notes":{"description":"Free form string to add notes about a club.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1}},"required":["id","name"]}},"teams":{"description":"The list of all teams in this competition","type":"array","items":{"description":"A team definition","type":"object","additionalProperties":false,"properties":{"id":{"description":"An ID for the team, e.g. \'TM1\'.  This is used in the rest of the instance document to specify the team so must be unique within the competition.  It must contain only ASCII printable characters excluding \\" : { } ? =","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"name":{"description":"The name for the team","type":"string","minLength":1,"maxLength":1000},"contacts":{"description":"A list of contact details for a team","type":"array","items":{"description":"A single contact for a team","type":"object","additionalProperties":false,"properties":{"id":{"description":"A unique ID for this contact, e.g. \'TM1Contact1\'.  This must be unique within the team.  It must contain only ASCII printable characters excluding \\" : { } ? =","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"name":{"description":"The name of this contact","type":"string","minLength":1,"maxLength":1000},"roles":{"description":"The roles of this contact within the team","type":"array","minItems":1,"uniqueItems":true,"items":{"description":"A role of this contact","type":"string","default":"secretary","enum":["secretary","treasurer","manager","captain","coach","assistantCoach","medic"]}},"emails":{"description":"The email addresses for this contact","type":"array","minItems":1,"uniqueItems":true,"items":{"description":"An email address for this contact","type":"string","format":"email","minLength":3}},"phones":{"description":"The telephone numbers for this contact","type":"array","minItems":1,"uniqueItems":true,"items":{"description":"A telephone number for this contact","type":"string","minLength":1,"maxLength":50}}},"required":["id","roles"]}},"players":{"description":"A list of players for a team","type":"array","items":{"description":"A single player in a team","type":"object","additionalProperties":false,"properties":{"id":{"description":"A unique ID for this player. This may be the player\'s registration number.  This must be unique within the team.  It must contain only ASCII printable characters excluding \\" : { } ? =","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"name":{"description":"The name of this contact","type":"string","minLength":1,"maxLength":1000},"number":{"description":"The player\'s shirt number","type":"integer","minimum":1},"notes":{"description":"Free form string to add notes about the player.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1}},"required":["id","name"]}},"club":{"description":"The ID of the club this team is in","type":"string","minLength":1,"maxLength":100},"notes":{"description":"Free form string to add notes about a team.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1}},"required":["id","name"]}},"stages":{"description":"The stages of the competition.  Stages are phases of a competition that happen in order.  There may be only one stage (e.g. for a flat league) or multiple in sequence (e.g. for a tournament with pools, then crossovers, then finals)","type":"array","items":{"description":"A single competition stage","type":"object","additionalProperties":false,"properties":{"id":{"description":"A unique ID for this stage, e.g. \'LG\'.  It must contain only ASCII printable characters excluding \\" : { } ? =","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"name":{"description":"Descriptive title for the stage, e.g. \'Pools\'","type":"string","minLength":1,"maxLength":1000},"notes":{"description":"Free form string to add notes about this stage.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1},"description":{"description":"An array of string values as a verbose description of the nature of the stage, e.g. \'The first stage of the competition will consist of separate pools, where....\'","type":"array","items":{"description":"A part of the description of this stage","type":"string","minLength":1}},"groups":{"description":"The groups within a stage of the competition.  There may be only one group (e.g. for a flat league) or multiple in parallel (e.g. pool 1, pool 2)","type":"array","items":{"description":"A group within this stage of the competition","type":"object","additionalProperties":false,"properties":{"id":{"description":"A unique ID for this group, e.g. \'P1\'.  It must contain only ASCII printable characters excluding \\" : { } ? =","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"name":{"description":"Descriptive title for the group, e.g. \'Pool 1\'","type":"string","minLength":1,"maxLength":1000},"notes":{"description":"Free form string to add notes about this group.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1},"description":{"description":"An array of string values as a verbose description of the nature of the group, e.g. \'For the pool stage, teams will play each other once, with the top 2 teams going through to....\'","type":"array","items":{"description":"A part of the description of this stage","type":"string","minLength":1}},"type":{"description":"The type of competition applying to this group, which may dictate how the results are processed.  If this has the value \'league\' then the property \'league\' must be defined","type":"string","enum":["league","crossover","knockout"]},"knockout":{"description":"Configuration for the knockout group","type":"object","additionalProperties":false,"properties":{"standing":{"description":"Configuration for the knockout group","type":"array","items":{"description":"An ordered mapping from a position to a team ID","type":"object","additionalProperties":false,"properties":{"position":{"description":"The text description of the position, e.g. \\"1st\\", \\"2nd\\".  Having this field allows multiple teams to have the same \\"position\\", for example if there are no play-off games then two entries can have the value \\"3rd\\"","type":"string","minLength":1},"id":{"description":"The identifier for the team.  This must be a team reference (see the documentation), for example for the team in \\"1st\\", this would refer to the winner of the final in this stage->group","type":"string","minLength":1}},"required":["position","id"]},"minItems":1}},"required":["standing"]},"league":{"description":"Configuration for the league","type":"object","additionalProperties":false,"properties":{"ordering":{"description":"An array of parameters that define how the league positions are worked out, where the array position determines the precedence of that parameter, e.g. [ \\"PTS\\", \\"SD\\" ] means that league position is determined by league points, with ties decided by set difference.  Valid parameters are \'PTS\'=league points, \'WINS\'=wins, \'LOSSES\'=losses, \'H2H\'=head to head, PF\'=points for, \'PA\'=points against, \'PD\'=points difference, \'SF\'=sets for, \'SA\'=sets against, \'SD\'=set difference, \'BP\'=bonus points, \'PP\'=penalty points.  When comparing teams, a higher value for a parameter results in a higher league position except when comparing \'LOSSES\', \'PA\', \'SA\', and \'PP\' (where a lower value results in a higher league position).  Note that \'H2H\' only considers wins and losses between two teams; this means that, depending on whether draws are allowed or whether teams play each other multiple times, the head to head comparison may not be able to distinguish between two teams","type":"array","items":{"description":"A parameter that defines the league position","type":"string","enum":["PTS","WINS","LOSSES","H2H","PF","PA","PD","SF","SA","SD","BP","PP"]},"minItems":1},"points":{"description":"Properties defining how to calculate the league points based on match results","type":"object","additionalProperties":false,"properties":{"played":{"description":"Number of league points for playing the match.  Note that a forfeit counts as a \\"played\\" match, so if this has a non-zero value and the desire is for a forfeit to yield zero points then the \\"forfeit\\" value should be set to the same as this value","type":"integer","default":0},"perSet":{"description":"Number of league points for each set won","type":"integer","default":0},"win":{"description":"Number of league points for winning (by 2 sets or more if playing sets)","type":"integer","default":3},"winByOne":{"description":"Number of league points for winning by 1 set","type":"integer","default":0},"lose":{"description":"Number of league points for losing (by 2 sets or more if playing sets)","type":"integer","default":0},"loseByOne":{"description":"Number of league points for losing by 1 set","type":"integer","default":0},"forfeit":{"description":"Number of league penalty points for forfeiting a match.  This should be a positive number and will be subtracted from a team\'s league points for each forfeited match","type":"integer","default":0}}}},"required":["ordering","points"]},"matchType":{"description":"Are the matches played in sets or continuous points.  If this has the value \'sets\' then the property \'sets\' must be defined","type":"string","enum":["sets","continuous"]},"sets":{"description":"Configuration defining the nature of a set","type":"object","additionalProperties":false,"properties":{"maxSets":{"description":"The maximum number of sets that could be played, often known as \'best of\', e.g. if this has the value \'5\' then the match is played as \'best of 5 sets\'","type":"integer","default":5,"minimum":1},"setsToWin":{"description":"The number of sets that must be won to win the match.  This is usually one more than half the \'maxSets\', but may be needed if draws are allowed, e.g. if a competition dictates that exactly 2 sets must be played (by setting \'maxSets\' to \'2\') and that draws are allowed, then \'setsToWin\' should still be set to \'2\' to indicate that 2 sets are needed to win the match","type":"integer","default":3,"minimum":1},"clearPoints":{"description":"The number of points lead that the winning team must have, e.g. if this has the value \'2\' then teams must \'win by 2 clear points\'.  Note that if \'maxPoints\' has a value then that takes precedence, i.e. if \'maxPoints\' is set to \'35\' then a team can win \'35-34\' irrespective of the value of \'clearPoints\'","type":"integer","default":2,"minimum":1},"minPoints":{"description":"The minimum number of points that either team must score for a set to count as valid.  Usually only used for time-limited matches","type":"integer","default":1,"minimum":1},"pointsToWin":{"description":"The minimum number of points required to win all but the last set","type":"integer","default":25,"minimum":1},"lastSetPointsToWin":{"description":"The minimum number of points required to win the last set","type":"integer","default":15,"minimum":1},"maxPoints":{"description":"The upper limit of points that can be scored in a set","type":"integer","default":1000,"minimum":1},"lastSetMaxPoints":{"description":"The upper limit of points that can be scored in the last set","type":"integer","default":1000,"minimum":1}}},"drawsAllowed":{"description":"Sets whether drawn matches are allowed","default":false,"type":"boolean"},"matches":{"$ref":"#/$defs/matches"}},"allOf":[{"if":{"properties":{"type":{"const":"league"}},"required":["type"]},"then":{"required":["league"]}},{"if":{"properties":{"type":{"const":"crossover"}},"required":["type"]},"then":{"anyOf":[{"properties":{"drawsAllowed":{"enum":[false]}}},{"not":{"required":["drawsAllowed"]}}]}},{"if":{"properties":{"type":{"const":"knockout"}},"required":["type"]},"then":{"anyOf":[{"properties":{"drawsAllowed":{"enum":[false]}}},{"not":{"required":["drawsAllowed"]}}]}},{"if":{"properties":{"matchType":{"const":"continuous"}},"required":["matchType"]},"then":{"properties":{"matches":{"type":"array","items":{"type":"object","properties":{"homeTeam":{"type":"object","properties":{"scores":{"type":"array","maxItems":1}}},"awayTeam":{"type":"object","properties":{"scores":{"type":"array","maxItems":1}}}}}}},"allOf":[{"not":{"required":["sets"]}}]}},{"if":{"properties":{"matchType":{"const":"continuous"}},"required":["matchType"]},"then":{"allOf":[{"not":{"required":["sets"]}}]}},{"if":{"properties":{"matchType":{"const":"continuous"},"matches":{"type":"array","items":{"type":"object","properties":{"type":{"const":"match"}}}}},"required":["matchType"]},"then":{"properties":{"matches":{"type":"array","items":{"type":"object","required":["complete"]}}}}}],"required":["id","type","matchType","matches"]}},"ifUnknown":{"description":"It can be useful to still present something to the user about the later stages of a competition, even if the teams playing in that stage is not yet known.  This defines what should be presented in any application handling this competition\'s data in such cases","type":"object","additionalProperties":false,"properties":{"description":{"description":"An array of string values to be presented in the case that the teams in this stage are not yet known, typically as an explanation of what this stage will contain (e.g. \'The crossover games will be between the top two teams in each pool\')","type":"array","items":{"description":"A part of the description of this stage","type":"string","minLength":1}},"matches":{"$ref":"#/$defs/matches"}},"required":["description"]}},"required":["id","groups"]}}},"required":["name","teams","stages"],"$defs":{"team":{"description":"A team playing in the match","type":"object","additionalProperties":false,"properties":{"id":{"description":"The identifier for the team.  This can either be a team ID or a team reference (see the documentation)","type":"string","minLength":1,"maxLength":1000},"scores":{"description":"The array of set scores.  If the matchType is \'continuous\' then only the first value in the array is used","type":"array","items":{"description":"The set score","type":"integer","minimum":0}},"mvp":{"description":"This team\'s most valuable player award.  This can either be a name or a player reference","type":"string","minLength":1},"forfeit":{"description":"Did this team forfeit the match","type":"boolean","default":false},"bonusPoints":{"description":"Does this team get any bonus points in the league.  This is separate from any league points calculated from the match result, and is added to their league points","type":"integer","default":0,"minimum":0},"penaltyPoints":{"description":"Does this team receive any penalty points in the league.  This is separate from any league points calculated from the match result, and is subtracted from their league points","type":"integer","default":0,"minimum":0},"notes":{"description":"Free form string to add notes about the team relating to this match.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1},"players":{"description":"The list of players from this team that played in this match","type":"array","items":{"description":"The ID of the player as a player reference","type":"string","minLength":1}}},"required":["id","scores"]},"matches":{"description":"An array of matches (or breaks in play) in this group.  Note that a team ID and each unique team references can ony appear in one group, i.e. a team cannot play in multiple groups in a stage; if they did then those two groups would technically be the same group","type":"array","items":{"oneOf":[{"description":"A match between two teams","type":"object","additionalProperties":false,"properties":{"id":{"description":"An identifier for this match, i.e. a match number.  It must contain only ASCII printable characters excluding \\" : { } ? =","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"court":{"description":"The court that a match takes place on","type":"string","minLength":1,"maxLength":1000},"venue":{"description":"The venue that a match takes place at","type":"string","minLength":1,"maxLength":10000},"type":{"description":"The type of match, i.e. \'match\'","type":"string","enum":["match"]},"date":{"description":"The date of the match in the format YYYY-MM-DD","type":"string","format":"date"},"warmup":{"description":"The start time for the warmup in the format HH:mm using a 24 hour clock","type":"string","pattern":"^([0-1][0-9]|2[0-3]):[0-5][0-9]$"},"start":{"description":"The start time for the match in the format HH:mm using a 24 hour clock","type":"string","pattern":"^([0-1][0-9]|2[0-3]):[0-5][0-9]$"},"duration":{"description":"The maximum duration of the match in the format HH:mm","type":"string","pattern":"^[0-9]+:[0-5][0-9]$"},"complete":{"description":"Whether the match is complete.  This must be set when a match has a \\"duration\\" or when the matchType is \\"continuous\\".  What about a \\"continuous\\" match with no \\"duration\\" and a target score?  This can be represented by a \\"sets\\" match with \\"maxSets\\" = 1","type":"boolean"},"homeTeam":{"$ref":"#/$defs/team","description":"The \'home\' team for the match"},"awayTeam":{"$ref":"#/$defs/team","description":"The \'away\' team for the match"},"officials":{"oneOf":[{"description":"The officials for this match","type":"object","additionalProperties":false,"properties":{"team":{"description":"The team assigned to referee the match.  This can either be a team ID or a team reference","type":"string","minLength":1,"maxLength":1000}},"required":["team"]},{"description":"The officials for this match","type":"object","additionalProperties":false,"properties":{"first":{"description":"The first referee","type":"string","minLength":1},"second":{"description":"The second referee","type":"string","minLength":1},"challenge":{"description":"The challenge referee, responsible for resolving challenges from the teams","type":"string","minLength":1},"assistantChallenge":{"description":"The assistant challenge referee, who assists the challenge referee","type":"string","minLength":1},"reserve":{"description":"The reserve referee","type":"string","minLength":1},"scorer":{"description":"The scorer","type":"string","minLength":1},"assistantScorer":{"description":"The assistant scorer","type":"string","minLength":1},"linespersons":{"description":"The list of linespersons","type":"array","maxItems":4,"items":{"description":"A linesperson","type":"string","minLength":1}},"ballCrew":{"description":"The list of people in charge of managing the game balls","type":"array","maxItems":100,"items":{"description":"A ball person","type":"string","minLength":1}}},"required":["first"]}]},"mvp":{"description":"A most valuable player award for the match. This can either be a name a player reference of the form {TEAM-ID:PLAYER-ID}","type":"string","minLength":1,"maxLength":203},"manager":{"oneOf":[{"description":"The court manager in charge of this match","type":"string","minLength":1,"maxLength":1000},{"description":"The court managers for this match","type":"object","additionalProperties":false,"properties":{"team":{"description":"The team assigned to manage the match.  This can either be a team ID or a team reference","type":"string","minLength":1,"maxLength":1000}},"required":["team"]}]},"friendly":{"description":"Whether the match is a friendly.  These matches do not contribute toward a league position.  If a team only participates in friendly matches then they are not included in the league table at all","type":"boolean","default":false},"notes":{"description":"Free form string to add notes about a match","type":"string","minLength":1}},"dependencies":{"duration":["complete"]},"required":["id","type","homeTeam","awayTeam"]},{"description":"A break in play, possibly while other matches are going on in other competitions running in parallel","type":"object","additionalProperties":false,"properties":{"type":{"description":"The type of match, i.e. \'break\'","type":"string","enum":["break"]},"start":{"description":"The start time for the break in the format HH:mm using a 24 hour clock","type":"string","pattern":"^([0-1][0-9]|2[0-3]):[0-5][0-9]$"},"date":{"description":"The date of the break in the format YYYY-MM-DD","type":"string","format":"date"},"duration":{"description":"The duration of the break","type":"string","pattern":"^[0-9]+:[0-5][0-9]$"},"name":{"description":"The name for the break, e.g. \'Lunch break\'","default":"Break","type":"string","minLength":1,"maxLength":1000}},"required":["type"]}]}}}}');var n=t.f;

class ContactRole {
  static TREASURER = 'treasurer'
  static SECRETARY = 'secretary'
  static MANAGER = 'manager'
  static CAPTAIN = 'captain'
  static COACH = 'coach'
  static ASSISTANT_COACH = 'assistantCoach'
  static MEDIC = 'medic'
}

/**
 * A single contact for a team
 */
class Contact {
  /**
   * A unique ID for this contact, e.g. 'TM1Contact1'. This must be unique within the team
   * @type {string}
   * @private
   */
  #id

  /**
   * The name of this contact
   * @type {string|null}
   * @private
   */
  #name = null

  /**
   * The roles of this contact within the team
   * @type {array}
   * @private
   */
  #roles

  /**
   * The email addresses for this contact
   * @type {array}
   * @private
   */
  #emails

  /**
   * A telephone number for this contact. If a contact has multiple phone numbers then add them as another contact
   * @type {array}
   * @private
   */
  #phones

  /**
   * The team this contact belongs to
   * @type {CompetitionTeam}
   * @private
   */
  #team

  /**
   * Defines a Team Contact
   * @param {CompetitionTeam} team The team this contact belongs to
   * @param {string} id The unique ID for this contact
   * @param {Array<string>} roles The roles of this contact within the team
   */
  constructor (team, id, roles) {
    if (id.length > 100 || id.length < 1) {
      throw new Error('Invalid contact ID: must be between 1 and 100 characters long')
    }

    if (!/^((?![":{}?=])[\x20-\x7F])+$/.test(id)) {
      throw new Error('Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? =')
    }

    if (team.hasContactWithID(id)) {
      throw new Error(`Contact with ID "${id}" already exists in the team`)
    }

    this.#team = team;
    this.#id = id;
    this.#roles = [];
    roles.forEach(role => {
      switch (role) {
        case ContactRole.TREASURER:
          this.addRole(ContactRole.TREASURER);
          break
        case ContactRole.SECRETARY:
          this.addRole(ContactRole.SECRETARY);
          break
        case ContactRole.MANAGER:
          this.addRole(ContactRole.MANAGER);
          break
        case ContactRole.CAPTAIN:
          this.addRole(ContactRole.CAPTAIN);
          break
        case ContactRole.COACH:
          this.addRole(ContactRole.COACH);
          break
        case ContactRole.ASSISTANT_COACH:
          this.addRole(ContactRole.ASSISTANT_COACH);
          break
        case ContactRole.MEDIC:
          this.addRole(ContactRole.MEDIC);
          break
      }
    });
    this.#name = null;
    this.#emails = [];
    this.#phones = [];
  }

  /**
   * Loads contact data from an object
   * @param {Object} contactData The data defining this Contact
   * @returns {Contact} The updated Contact instance
   */
  loadFromData (contactData) {
    if (Object.hasOwn(contactData, 'name')) {
      this.setName(contactData.name);
    }

    if (Object.hasOwn(contactData, 'emails')) {
      contactData.emails.forEach(email => {
        this.addEmail(email);
      });
    }
    if (Object.hasOwn(contactData, 'phones')) {
      contactData.phones.forEach(phone => {
        this.addPhone(phone);
      });
    }

    return this
  }

  /**
   * Return the contact definition in a form suitable for serializing
   *
   * @return {Object}
   */
  serialize () {
    const contact = {
      id: this.#id
    };

    if (this.#name !== null) {
      contact.name = this.#name;
    }

    contact.roles = [];
    this.#roles.forEach(role => {
      contact.roles.push(role);
    });

    if (this.#emails.length > 0) {
      contact.emails = [];
      this.#emails.forEach(email => {
        contact.emails.push(email);
      });
    }

    if (this.#phones.length > 0) {
      contact.phones = [];
      this.#phones.forEach(phone => {
        contact.phones.push(phone);
      });
    }

    return contact
  }

  /**
   * Get the team this contact belongs to
   * @returns {CompetitionTeam} The team this contact belongs to
   */
  getTeam () {
    return this.#team
  }

  /**
   * Get the ID for this contact
   * @returns {string} The ID for this contact
   */
  getID () {
    return this.#id
  }

  /**
   * Set the name for this contact
   * @param {string} name The name for this contact
   * @returns {Contact} This contact
   * @throws {Error} If the name is invalid
   */
  setName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid contact name: must be between 1 and 1000 characters long')
    }
    this.#name = name;
    return this
  }

  /**
   * Get the name for this contact
   * @returns {string|null} The name for this contact
   */
  getName () {
    return this.#name
  }

  /**
   * Get the roles for this contact
   * @returns {Array<ContactRole>} The roles for this contact
   */
  getRoles () {
    return this.#roles
  }

  /**
   * Add a role to this contact
   * @param {string} role The role to add to this contact
   * @returns {Contact} Returns this contact for method chaining
   */
  addRole (role) {
    if (!this.hasRole(role)) {
      this.#roles.push(role);
    }
    return this
  }

  /**
   * Check if this contact has the specified role
   * @param {string} role The role to check for
   * @returns {boolean} Whether the contact has the specified role
   */
  hasRole (role) {
    return this.#roles.includes(role)
  }

  /**
   * Get the email addresses for this contact
   * @returns {Array<string>} The email addresses for this contact
   */
  getEmails () {
    return this.#emails
  }

  /**
   * Add an email address to this contact
   * @param {string} email The email address to add
   * @returns {Contact} Returns this contact for method chaining
   */
  addEmail (email) {
    if (!this.#emails.includes(email)) {
      this.#emails.push(email);
    }
    return this
  }

  /**
   * Get the phone numbers for this contact
   * @returns {Array<string>} The phone numbers for this contact
   */
  getPhones () {
    return this.#phones
  }

  /**
   * Add a phone number to this contact
   * @param {string} phone The phone number to add
   * @returns {Contact} Returns this contact for method chaining
   */
  addPhone (phone) {
    if (!this.#phones.includes(phone)) {
      this.#phones.push(phone);
    }
    return this
  }
}

/**
 * Represents a player in a team.
 */
class Player {
  /**
   * Free form string to add notes about this stage.
   * @type {string|null}
   * @private
   **/

  /**
   * A unique ID for this player. This may be the player's registration number. This must be unique within the team
   * @type {string}
   * @private
   **/
  #id

  /**
   * The name of this player
   * @type {string}
   * @private
   **/
  #name

  /**
   * The player's shirt number
   * @type {int|null}
   * @private
   **/
  #number

  /**
   * Free form string to add notes about the player. This can be used for arbitrary content that various implementations can use
   * @type {string|null}
   * @private
   **/
  #notes

  /**
   * The team this player belongs to
   * @type {CompetitionTeam}
   * @private
   **/
  #team

  /**
   * @param {CompetitionTeam} team The team to which this player belongs
   * @param {string} id The ID of the player
   * @param {string} name The name of the player
   * @throws {Error} If the ID is invalid or already exists in the team
   */
  constructor (team, id, name) {
    if (id.length > 100 || id.length < 1) {
      throw new Error('Invalid player ID: must be between 1 and 100 characters long')
    }

    if (!/^((?![":{}?=])[\x20-\x7F])+$/.test(id)) {
      throw new Error('Invalid player ID: must contain only ASCII printable characters excluding " : { } ? =')
    }

    if (team.hasPlayerWithID(id)) {
      throw new Error(`Player with ID "${id}" already exists in the team`)
    }

    this.#team = team;
    this.#id = id;
    this.setName(name);
    this.#number = null;
    this.#notes = null;
  }

  /**
   * Load player data from an object.
   *
   * @param {object} playerData The data defining this Player
   * @return {Player} The updated Player object
   */
  loadFromData (playerData) {
    if (playerData.number !== undefined) {
      this.setNumber(playerData.number);
    }

    if (playerData.notes !== undefined) {
      this.setNotes(playerData.notes);
    }

    return this
  }

  /**
   * Return the list of player data in a form suitable for serializing
   *
   * @return {object}
   */
  serialize () {
    const player = {
      id: this.#id,
      name: this.#name
    };

    if (this.#number !== null) {
      player.number = this.#number;
    }

    if (this.#notes !== null) {
      player.notes = this.#notes;
    }

    return player
  }

  /**
   * Get the team this player belongs to
   * @returns {CompetitionTeam} The team this player belongs to
   */
  getTeam () {
    return this.#team
  }

  /**
   * Get the ID for this player.
   *
   * @return {string} The ID for this player
   */
  getID () {
    return this.#id
  }

  /**
   * Get the name for this player.
   *
   * @return {string} The name for this player
   */
  getName () {
    return this.#name
  }

  /**
   * Set the name for this player.
   *
   * @param {string} name The name for this player
   * @throws {Error} If the name is invalid
   */
  setName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid player name: must be between 1 and 1000 characters long')
    }
    this.#name = name;
  }

  /**
   * Get the shirt number for this player.
   *
   * @return {number|null} The shirt number for this player
   */
  getNumber () {
    return this.#number
  }

  /**
   * Set the shirt number for this player.
   *
   * @param {number|null} number The shirt number for this player
   * @throws {Error} If the number is invalid
   */
  setNumber (number) {
    if (number !== null && number < 1) {
      throw new Error(`Invalid player number "${number}": must be greater than 1`)
    }
    this.#number = number;
  }

  /**
   * Get the notes for this player.
   *
   * @return {string|null} The notes for this player
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Set the notes for this player.
   *
   * @param {string|null} notes The notes for this player
   */
  setNotes (notes) {
    this.#notes = notes;
  }
}

class CompetitionTeam {
  static UNKNOWN_TEAM_ID = 'UNKNOWN'
  static UNKNOWN_TEAM_NAME = 'UNKNOWN'

  /**
   * A unique ID for the team, e.g. 'TM1'. This is used in the rest of the instance document to specify the team
   * @type {string}
   * @private
   */
  #id

  /**
   * The name for the team
   * @type {string}
   * @private
   */
  #name

  /**
   * The contacts for the Team
   * @type {array}
   * @private
   */
  #contacts

  /**
   * A list of players for a team
   * @type {array}
   * @private
   */
  #players

  /**
   * The club this team is in
   * @type {Club|null}
   * @private
   */
  #club

  /**
   * Free form string to add notes about a team.  This can be used for arbitrary content that various implementations can use
   * @type {string|null}
   * @private
   */
  #notes

  /**
   * The Competition this team is in
   * @type {Competition}
   * @private
   */
  #competition

  /**
   * A Lookup table from contact IDs to the contact
   * @type {object}
   * @private
   */
  #contactLookup

  /**
   * A Lookup table from player IDs to the contact
   * @type {object}
   * @private
   */
  #playerLookup

  /**
   * Contains the team data of a competition, creating any metadata needed
   *
   * @param {Competition} competition A link back to the Competition this Team is in
   * @param {string} id The unique ID for the team
   * @param {string} name The name for the team
   */
  constructor (competition, id, name) {
    if (id.length > 100 || id.length < 1) {
      throw new Error('Invalid team ID: must be between 1 and 100 characters long')
    }

    if (!/^((?![":{}?=])[\x20-\x7F])+$/.test(id)) {
      throw new Error('Invalid team ID: must contain only ASCII printable characters excluding " : { } ? =')
    }

    if (competition.hasTeamWithID(id)) {
      throw new Error(`Team with ID "${id}" already exists in the competition`)
    }

    this.#competition = competition;
    this.#id = id;
    this.setName(name);
    this.#contacts = [];
    this.#players = [];
    this.#club = null;
    this.#notes = null;
    this.#contactLookup = {};
    this.#playerLookup = {};
  }

  /**
   * Load team data from an object
   *
   * @param {object} teamData The data defining this Team
   *
   * @return {CompetitionTeam}
   */
  loadFromData (teamData) {
    if (Object.hasOwn(teamData, 'contacts')) {
      teamData.contacts.forEach(contactData => {
        const roles = [];
        contactData.roles.forEach(contactRole => {
          switch (contactRole) {
            case ContactRole.SECRETARY:
              roles.push(ContactRole.SECRETARY);
              break
            case ContactRole.TREASURER:
              roles.push(ContactRole.TREASURER);
              break
            case ContactRole.MANAGER:
              roles.push(ContactRole.MANAGER);
              break
            case ContactRole.CAPTAIN:
              roles.push(ContactRole.CAPTAIN);
              break
            case ContactRole.COACH:
              roles.push(ContactRole.COACH);
              break
            case ContactRole.ASSISTANT_COACH:
              roles.push(ContactRole.ASSISTANT_COACH);
              break
            case ContactRole.MEDIC:
              roles.push(ContactRole.MEDIC);
              break
          }
        });
        this.addContact((new Contact(this, contactData.id, roles)).loadFromData(contactData));
      });
    }

    if (Object.hasOwn(teamData, 'players')) {
      teamData.players.forEach(playerData => {
        this.addPlayer((new Player(this, playerData.id, playerData.name)).loadFromData(playerData));
      });
    }

    if (Object.hasOwn(teamData, 'club')) {
      this.setClubID(teamData.club);
      this.getClub().addTeam(this);
    }

    if (Object.hasOwn(teamData, 'notes')) {
      this.#notes = teamData.notes;
    }

    return this
  }

  /**
   * Return the list of team definition in a form suitable for serializing
   *
   * @return {Object}
   */
  serialize () {
    const team = {
      id: this.#id,
      name: this.#name
    };
    if (this.#contacts.length > 0) {
      team.contacts = [];
      this.#contacts.forEach(contacts => {
        team.contacts.push(contacts.serialize());
      });
    }
    if (this.#players.length > 0) {
      team.players = [];
      this.#players.forEach(players => {
        team.players.push(players.serialize());
      });
    }
    if (this.#club !== null) {
      team.club = this.#club.getID();
    }
    if (this.#notes !== null) {
      team.notes = this.#notes;
    }

    return team
  }

  /**
   * Get the competition this team is in
   *
   * @return {Competition}
   */
  getCompetition () {
    return this.#competition
  }

  /**
   * Get the ID for this team
   *
   * @return {string} The ID for this team
   */
  getID () {
    return this.#id
  }

  /**
   * Set the name for this team
   *
   * @param {string} name The name for this team
   *
   * @return {CompetitionTeam} This CompetitionTeam
   */
  setName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid team name: must be between 1 and 1000 characters long')
    }
    this.#name = name;
    return this
  }

  /**
   * Get the name for this team
   *
   * @return {string} The name for this team
   */
  getName () {
    return this.#name
  }

  /**
   * Set the club ID for this team
   *
   * @param {string|null} clubID The ID of the club this team is in
   *
   * @return CompetitionTeam This competition team
   */
  setClubID (clubID) {
    if (clubID === null) {
      if (this.#club.hasTeamWithID(this.#id)) {
        this.#club.deleteTeam(this.#id);
      }
      this.#club = null;
      return this
    }

    if (this.#club !== null && clubID === this.#club.getID()) {
      return this
    }

    if (!this.#competition.hasClubWithID(clubID)) {
      throw new Error(`No club with ID "${clubID}" exists`)
    }

    this.#club = this.#competition.getClubByID(clubID);
    this.#club.addTeam(this);

    return this
  }

  /**
   * Get the club for this team
   *
   * @return {Club|null} The club this team is in
   */
  getClub () {
    return this.#club
  }

  /**
   * Does this team have a club that it belongs to
   *
   * @return {bool} True if the team belongs to a club, otherwise false
   */
  hasClub () {
    return this.#club !== null
  }

  /**
   * Get the notes for this team
   *
   * @return {string|null} the notes for this team
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Set the notes for this team
   *
   * @param {string|nul} notes the notes for this team
   *
   * @return {CompetitionTeam} This competition team
   */
  setNotes (notes) {
    this.#notes = notes;
    return this
  }

  /**
   * Does this team have any notes attached
   *
   * @return {bool} True if the team has notes, otherwise false
   */
  hasNotes () {
    return this.#notes !== null
  }

  /**
   * Add a contact to this team
   *
   * @param {Contact} contact The contact to add to this team
   *
   * @return {CompetitionTeam} This CompetitionTeam instance
   *
   * @throws {Error} If a contact with a duplicate ID within the team is added
   */
  addContact (contact) {
    if (this.hasContactWithID(contact.getID())) {
      throw new Error('team contacts with duplicate IDs within a team not allowed')
    }
    this.#contacts.push(contact);
    this.#contactLookup[contact.getID()] = contact;
    return this
  }

  /**
   * Returns an array of Contacts for this team
   *
   * @return {array<Contact>|null} The contacts for this team
   */
  getContacts () {
    return this.#contacts
  }

  /**
   * Returns the Contact with the requested ID, or throws if the ID is not found
   *
   * @param {string} contactID The ID of the contact in this team to return
   *
   * @throws {Error} If a Contact with the requested ID was not found
   *
   * @return {Contact} The requested contact for this team
   */
  getContactByID (contactID) {
    if (!Object.hasOwn(this.#contactLookup, contactID)) {
      throw new Error(`Contact with ID "${contactID}" not found`)
    }
    return this.#contactLookup[contactID]
  }

  /**
   * Check if a contact with the given ID exists in this team
   *
   * @param {string} contactID The ID of the contact to check
   *
   * @return {bool} True if the contact exists, otherwise false
   */
  hasContactWithID (contactID) {
    return Object.hasOwn(this.#contactLookup, contactID)
  }

  /**
   * Check if this team has any contacts
   *
   * @return bool True if the team has contacts, otherwise false
   */
  hasContacts () {
    return this.#contacts.length > 0
  }

  /**
   * Delete a contact from the team
   *
   * @param {string} contactID The ID of the contact to delete
   *
   * @return {CompetitionTeam} This CompetitionTeam instance
   */
  deleteContact (contactID) {
    if (!this.hasContactWithID(contactID)) {
      return this
    }

    delete this.#contactLookup[contactID];
    this.#contacts = this.#contacts.filter(el => el.getID() !== contactID);
    return this
  }

  /**
   * Add a player to this team
   *
   * @param {Player} player The player to add to this team
   *
   * @return {CompetitionTeam} This CompetitionTeam instance
   *
   * @throws {Error} If a player with a duplicate ID within the team is added
   */
  addPlayer (player) {
    if (this.hasPlayerWithID(player.getID())) {
      throw new Error('team players with duplicate IDs within a team not allowed')
    }

    this.#players.push(player);
    this.#playerLookup[player.getID()] = player;
    return this
  }

  /**
   * Get the players for this team
   *
   * @return {array<Player>|null} The players for this team
   */
  getPlayers () {
    return this.#players
  }

  /**
   * Returns the Player with the requested ID, or throws if the ID is not found
   *
   * @param {string} playerID The ID of the player in this team to return
   *
   * @throws {Error} If a Player with the requested ID was not found
   *
   * @return {Player} The requested player for this team
   */
  getPlayerByID (playerID) {
    if (!Object.hasOwn(this.#playerLookup, playerID)) {
      throw new Error(`Player with ID "${playerID}" not found`)
    }
    return this.#playerLookup[playerID]
  }

  /**
   * Check if a player with the given ID exists in this team
   *
   * @param {string} playerID The ID of the player to check
   *
   * @return {bool} True if the player exists, otherwise false
   */
  hasPlayerWithID (playerID) {
    return Object.hasOwn(this.#playerLookup, playerID)
  }

  /**
   * Check if this team has any players
   *
   * @return {bool} True if the team has players, otherwise false
   */
  hasPlayers () {
    return this.#players.length > 0
  }

  /**
   * Delete a player from the team
   *
   * @param {string} playerID The ID of the player to delete
   *
   * @return {CompetitionTeam} This CompetitionTeam instance
   */
  deletePlayer (playerID) {
    if (!this.hasPlayerWithID(playerID)) {
      return this
    }

    delete this.#playerLookup[playerID];
    this.#players = this.#players.filter(el => el.getID() !== playerID);
    return this
  }
}

/**
 * A break in play, possibly while other matches are going on in other competitions running in parallel
 * @implements {JsonSerializable}
 * @implements {BreakInterface}
 */
class GroupBreak {
  /**
   * The start time for the break
   * @type {string|null}
   * @private
   */
  #start

  /**
   * The date of the break
   * @type {string|null}
   * @private
   */
  #date

  /**
   * The duration of the break
   * @type {string|null}
   * @private
   */
  #duration

  /**
   * The name for the break, e.g. 'Lunch break'
   * @type {string|null}
   * @private
   */
  #name

  /**
   * The Group this break is in
   * @type {Group}
   * @private
   */
  #group

  /**
   * Contains the match break data
   * @param {Group} group The Group this break is in
   */
  constructor (group) {
    this.#group = group;
    this.#start = null;
    this.#date = null;
    this.#duration = null;
    this.#name = null;
  }

  /**
   * Load the match break data from an object
   * @param {object} breakData The data defining this Break
   * @return {GroupBreak} This GroupBreak instance
   */
  loadFromData (breakData) {
    if (breakData.start !== undefined) {
      this.setStart(breakData.start);
    }
    if (breakData.date !== undefined) {
      this.setDate(breakData.date);
    }
    if (breakData.duration !== undefined) {
      this.setDuration(breakData.duration);
    }
    if (breakData.name !== undefined) {
      this.setName(breakData.name);
    }
    return this
  }

  /**
   * Return the match break data in a form suitable for serializing
   *
   * @return {object} The match break data
   */
  serialize () {
    const breakData = { type: 'break' };
    if (this.#start !== null) {
      breakData.start = this.#start;
    }
    if (this.#date !== null) {
      breakData.date = this.#date;
    }
    if (this.#duration !== null) {
      breakData.duration = this.#duration;
    }
    if (this.#name !== null) {
      breakData.name = this.#name;
    }
    return breakData
  }

  /**
   * Get the Group this break is in
   * @return {Group} The group this break is in
   */
  getGroup () {
    return this.#group
  }

  /**
   * Set the start time for this break
   * @param {string|null} start The start time for this break
   * @return {GroupBreak} This GroupBreak instance
   */
  setStart (start) {
    this.#start = start;
    return this
  }

  /**
   * Get the start time for this break
   * @return {string|null} The start time for this break
   */
  getStart () {
    return this.#start
  }

  /**
   * Set the date for this break
   * @param {string|null} date The date for this break
   * @return {GroupBreak} This GroupBreak instance
   */
  setDate (date) {
    this.#date = date;
    return this
  }

  /**
   * Get the date for this break
   * @return {string|null} The date for this break
   */
  getDate () {
    return this.#date
  }

  /**
   * Set the duration for this break
   * @param {string|null} duration The duration for this break
   * @return {GroupBreak} This GroupBreak instance
   */
  setDuration (duration) {
    this.#duration = duration;
    return this
  }

  /**
   * Get the duration for this break
   * @return {string|null} The duration for this break
   */
  getDuration () {
    return this.#duration
  }

  /**
   * Set the name for this break
   * @param {string|null} name The name for this break
   * @return {GroupBreak} This GroupBreak instance
   */
  setName (name) {
    this.#name = name;
    return this
  }

  /**
   * Get the name for this break
   * @return {string|null} The name for this break
   */
  getName () {
    return this.#name
  }
}

/**
 * Represents a manager for a match in a competition.
 */
class MatchManager {
  /**
   *  The court manager in charge of this match
   * @type {string|null}
   * @private
   */
  #managerName = null

  /**
   *  The team assigned to manage the match.
   * @type {string|null}
   * @private
   */
  #managerTeam = null

  /**
   * The match this Manager is managing
   * @type {MatchInterface}
   * @private
   */
  #match

  /**
   * Constructor.
   *
   * Defines the match/court manager of a match, which may be an individual or a team.
   *
   * @param {MatchInterface} match The match this Manager is managing
   * @param {string|null} teamID The ID of the team managing the match
   * @param {string|null} manager The name of the manager managing the match
   * @throws {Error} If Match Managers must be either a team or a person
   */
  constructor (match, teamID, manager = null) {
    this.#match = match;
    if (teamID !== null) {
      this.setTeamID(teamID);
    } else if (manager !== null) {
      this.setManagerName(manager);
    } else {
      throw new Error('Match Managers must be either a team or a person')
    }
  }

  /**
   * Load match manager data from a given object.
   *
   * @param {MatchInterface} match The match this Manager is managing
   * @param {string|object} managerData The data for the match manager
   * @return {MatchManager} The match manager instance
   */
  static loadFromData (match, managerData) {
    let manager;
    if (typeof managerData === 'object' && managerData.team !== undefined) {
      manager = new MatchManager(match, managerData.team, null);
    } else {
      manager = new MatchManager(match, null, managerData);
    }
    return manager
  }

  /**
   * Return the match manager definition in a form suitable for serializing
   *
   * @return {Object|string} The serialized match manager data
   */
  serialize () {
    if (this.#managerTeam !== null) {
      return { team: this.#managerTeam }
    }
    return this.#managerName
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
   * Check whether the match manager is a team or not.
   *
   * @return {boolean} True if the manager is a team, false otherwise
   */
  isTeam () {
    return this.#managerTeam !== null
  }

  /**
   * Get the ID of the team managing the match.
   *
   * @return {string|null} The team ID
   */
  getTeamID () {
    return this.#managerTeam
  }

  /**
   * Set the ID for the team managing the match. Note that this unsets any manager name.
   *
   * @param {string} teamID The ID for the team managing the match
   * @throws {Error} If the team ID is invalid
   */
  setTeamID (teamID) {
    this.#match.getGroup().getStage().getCompetition().validateTeamID(teamID, this.#match.getID(), 'manager');
    this.#managerTeam = teamID;
    this.#managerName = null;
  }

  /**
   * Get the name of the manager.
   *
   * @return {string|null} The name of the manager
   */
  getManagerName () {
    return this.#managerName
  }

  /**
   * Set the name of the manager managing the match. Note that this unsets any team ID.
   *
   * @param {string} name The name of the manager managing the match
   * @throws {Error} If the manager name is invalid
   */
  setManagerName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid manager name: must be between 1 and 1000 characters long')
    }
    this.#managerName = name;
    this.#managerTeam = null;
  }
}

/**
 * Represents a team that plays in a match.
 */
class MatchTeam {
  /**
   * The identifier for the team. This may be an exact identifier or a team reference.
   * @type {string}
   * @private
   */
  #id

  /**
   * This team's most valuable player award.
   * @type {string|null}
   * @private
   */
  #mvp

  /**
   * Did this team forfeit the match.
   * @type {boolean}
   * @private
   */
  #forfeit

  /**
   * Does this team get any bonus points in the league.
   * This is separate from any league points calculated from the match result, and is added to their league points.
   * @type {number}
   * @private
   */
  #bonusPoints

  /**
   * Does this team receive any penalty points in the league.
   * This is separate from any league points calculated from the match result, and is subtracted from their league points.
   * @type {number}
   * @private
   */
  #penaltyPoints

  /**
   * Free form string to add notes about the team relating to this match.
   * This can be used for arbitrary content that various implementations can use.
   * @type {string|null}
   * @private
   */
  #notes

  /**
   * The list of players from this team that played in this match.
   * @type {string[]}
   * @private
   */
  #players

  /**
   * The match this team is playing in.
   * @type {MatchInterface}
   * @private
   */
  #match

  /**
   * Contains the team data of a match, creating any metadata needed.
   * @param {MatchInterface} match The match this team is playing in.
   * @param {string} id The identifier for the team.
   */
  constructor (match, id) {
    this.#match = match;
    this.#id = id;
    this.#mvp = null;
    this.#forfeit = false;
    this.#bonusPoints = 0;
    this.#penaltyPoints = 0;
    this.#notes = null;
    this.#players = [];
  }

  /**
   * Load team data from a given object.
   * @param {MatchInterface} match The match this team is playing in.
   * @param {object} teamData The data defining this Team.
   * @return {MatchTeam} The match team instance.
   */
  static loadFromData (match, teamData) {
    const team = new MatchTeam(match, teamData.id);
    if (Object.hasOwn(teamData, 'mvp')) {
      team.setMVP(teamData.mvp);
    }
    if (Object.hasOwn(teamData, 'forfeit')) {
      team.setForfeit(teamData.forfeit);
    }
    if (Object.hasOwn(teamData, 'bonusPoints')) {
      team.setBonusPoints(teamData.bonusPoints);
    }
    if (Object.hasOwn(teamData, 'penaltyPoints')) {
      team.setPenaltyPoints(teamData.penaltyPoints);
    }
    if (Object.hasOwn(teamData, 'notes')) {
      team.setNotes(teamData.notes);
    }
    if (Object.hasOwn(teamData, 'players')) {
      team.setPlayers(teamData.players);
    }
    return team
  }

  /**
   * Return the team data in a form suitable for serializing
   *
   * @return {object} The serialized team data.
   */
  serialize () {
    const matchTeam = {
      id: this.#id,
      scores: this.getScores(),
      forfeit: this.#forfeit,
      bonusPoints: this.#bonusPoints,
      penaltyPoints: this.#penaltyPoints,
      players: this.#players
    };

    if (this.#mvp !== null) {
      matchTeam.mvp = this.#mvp;
    }
    if (this.#notes !== null) {
      matchTeam.notes = this.#notes;
    }

    return matchTeam
  }

  /**
   * Get the match the team is playing in.
   * @return {MatchInterface} The match this team plays in.
   */
  getMatch () {
    return this.#match
  }

  /**
   * Get the ID of the team.
   * @return {string} The team ID.
   */
  getID () {
    return this.#id
  }

  /**
   * Set whether the team forfeited the match.
   * @param {boolean} forfeit Whether the team forfeited the match.
   * @return {MatchTeam} The MatchTeam instance.
   */
  setForfeit (forfeit) {
    this.#forfeit = forfeit;
    return this
  }

  /**
   * Get whether the team forfeited the match.
   * @return {boolean} Whether the team forfeited the match.
   */
  getForfeit () {
    return this.#forfeit
  }

  /**
   * Get the array of scores for this team in this match.
   * @return {number[]} The team's scores.
   */
  getScores () {
    if (this.#match.getHomeTeam().getID() === this.#id) {
      return this.#match.getHomeTeamScores()
    }
    return this.#match.getAwayTeamScores()
  }

  /**
   * Set the bonus points for the team.
   * @param {number} bonusPoints The bonus points for the team.
   * @return {MatchTeam} The MatchTeam instance.
   */
  setBonusPoints (bonusPoints) {
    this.#bonusPoints = bonusPoints;
    return this
  }

  /**
   * Get the bonus points for the team.
   * @return {number} The bonus points for the team.
   */
  getBonusPoints () {
    return this.#bonusPoints
  }

  /**
   * Set the penalty points for the team.
   * @param {number} penaltyPoints The penalty points for the team.
   * @return {MatchTeam} The MatchTeam instance.
   */
  setPenaltyPoints (penaltyPoints) {
    this.#penaltyPoints = penaltyPoints;
    return this
  }

  /**
   * Get the penalty points for the team.
   * @return {number} The penalty points for the team.
   */
  getPenaltyPoints () {
    return this.#penaltyPoints
  }

  /**
   * Set the most valuable player for the team.
   * @param {?string} mvp The most valuable player for the team.
   * @return {MatchTeam} The MatchTeam instance.
   */
  setMVP (mvp) {
    this.#mvp = mvp;
    return this
  }

  /**
   * Get the most valuable player for the team.
   * @return {?string} The most valuable player for the team.
   */
  getMVP () {
    return this.#mvp
  }

  /**
   * Set notes for the team.
   * @param {?string} notes The notes for the team.
   * @return {MatchTeam} The MatchTeam instance.
   */
  setNotes (notes) {
    this.#notes = notes;
    return this
  }

  /**
   * Get notes for the team.
   * @return {?string} The notes for the team.
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Set the players for the team.
   * @param {string[]} players The players for the team.
   * @return {MatchTeam} The MatchTeam instance.
   */
  setPlayers (players) {
    this.#players = players;
    return this
  }

  /**
   * Get the players for the team.
   * @return {string[]} The players for the team.
   */
  getPlayers () {
    return this.#players
  }
}

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

    this.#ifUnknown = ifUnknown;
    this.#id = id;
    this.#court = null;
    this.#venue = null;
    this.#date = null;
    this.#warmup = null;
    this.#start = null;
    this.#duration = null;
    this.#homeTeam = null;
    this.#awayTeam = null;
    this.#officials = null;
    this.#mvp = null;
    this.#manager = null;
    this.#friendly = null;
    this.#notes = null;
  }

  /**
   * Loads data from an object into the IfUnknownMatch instance
   * @param {object} matchData The data defining this Match
   * @returns {IfUnknownMatch} The updated IfUnknownMatch instance
   */
  loadFromData (matchData) {
    if (Object.hasOwn(matchData, 'court')) {
      this.setCourt(matchData.court);
    }
    if (Object.hasOwn(matchData, 'venue')) {
      this.setVenue(matchData.venue);
    }
    if (Object.hasOwn(matchData, 'date')) {
      this.setDate(matchData.date);
    }
    if (Object.hasOwn(matchData, 'warmup')) {
      this.setWarmup(matchData.warmup);
    }
    if (Object.hasOwn(matchData, 'start')) {
      this.setStart(matchData.start);
    }
    if (Object.hasOwn(matchData, 'duration')) {
      this.setDuration(matchData.duration);
    }
    if (Object.hasOwn(matchData, 'complete')) {
      this.setComplete(matchData.complete);
    }

    this.setHomeTeam(MatchTeam.loadFromData(this, matchData.homeTeam));
    this.setAwayTeam(MatchTeam.loadFromData(this, matchData.awayTeam));

    if (Object.hasOwn(matchData, 'officials')) {
      this.setOfficials(MatchOfficials$1.loadFromData(this, matchData.officials));
    }
    if (Object.hasOwn(matchData, 'mvp')) {
      this.setMVP(matchData.mvp);
    }
    if (Object.hasOwn(matchData, 'manager')) {
      this.setManager(MatchManager.loadFromData(this, matchData.manager));
    }
    if (Object.hasOwn(matchData, 'notes')) {
      this.setNotes(matchData.notes);
    }

    return this
  }

  /**
   * Returns the match data in a form suitable for serializing
   *
   * @returns {object} The match data
   */
  serialize () {
    const match = {};

    match.id = this.#id;
    match.type = 'match';

    if (this.#court !== null) {
      match.court = this.#court;
    }
    if (this.#venue !== null) {
      match.venue = this.#venue;
    }

    if (this.#date !== null) {
      match.date = this.#date;
    }
    if (this.#warmup !== null) {
      match.warmup = this.#warmup;
    }
    if (this.#start !== null) {
      match.start = this.#start;
    }
    if (this.#duration !== null) {
      match.duration = this.#duration;
    }
    match.complete = false;

    match.homeTeam = this.#homeTeam.serialize();
    match.awayTeam = this.#awayTeam.serialize();

    if (this.#officials !== null) {
      match.officials = this.#officials.serialize();
    }
    if (this.#mvp !== null) {
      match.mvp = this.#mvp;
    }
    if (this.#manager !== null) {
      match.manager = this.#manager.serialize();
    }
    if (this.#notes !== null) {
      match.notes = this.#notes;
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
    this.#court = court;
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
    this.#venue = venue;
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

    const d = new Date(date);
    if (`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${(d.getDate()).toString().padStart(2, '0')}` !== date) {
      throw new Error(`Invalid date "${date}": date does not exist`)
    }

    this.#date = date;
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
    this.#warmup = warmup;
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
    this.#duration = duration;
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
    this.#start = start;
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
    this.#manager = manager;
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
    this.#mvp = mvp;
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
    this.#notes = notes;
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
    this.#friendly = friendly;
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
    this.#officials = officials;
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
    this.#awayTeam = awayTeam;
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
    this.#homeTeam = homeTeam;
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
    this.#match = match;
    if (teamID !== null) {
      this.setTeamID(teamID, isUnknown === true);
      this.#first = null;
    } else if (first !== null) {
      this.setFirstRef(first);
      this.#officialsTeam = null;
    } else {
      throw new Error('Match Officials must be either a team or a person')
    }
    this.#second = null;
    this.#challenge = null;
    this.#assistantChallenge = null;
    this.#reserve = null;
    this.#scorer = null;
    this.#assistantScorer = null;
    this.#linespersons = [];
    this.#ballCrew = [];
  }

  /**
   * Load match officials data from a given object.
   *
   * @param {MatchInterface} match The match these Officials are in
   * @param {object} officialsData The data defining this match's Officials
   * @return {MatchOfficials} The match officials instance
   */
  static loadFromData (match, officialsData) {
    let officials;
    if (typeof officialsData === 'object' && officialsData.team !== undefined) {
      officials = new MatchOfficials(match, officialsData.team, null, match instanceof IfUnknownMatch);
    } else {
      officials = new MatchOfficials(match, null, officialsData.first, match instanceof IfUnknownMatch);
      if (officialsData.second !== undefined) {
        officials.setSecondRef(officialsData.second);
      }
      if (officialsData.challenge !== undefined) {
        officials.setChallengeRef(officialsData.challenge);
      }
      if (officialsData.assistantChallenge !== undefined) {
        officials.setAssistantChallengeRef(officialsData.assistantChallenge);
      }
      if (officialsData.reserve !== undefined) {
        officials.setReserveRef(officialsData.reserve);
      }
      if (officialsData.scorer !== undefined) {
        officials.setScorer(officialsData.scorer);
      }
      if (officialsData.assistantScorer !== undefined) {
        officials.setAssistantScorer(officialsData.assistantScorer);
      }
      if (officialsData.linespersons !== undefined) {
        officials.setLinespersons(officialsData.linespersons);
      }
      if (officialsData.ballCrew !== undefined) {
        officials.setBallCrew(officialsData.ballCrew);
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
    const officials = {};
    if (this.#officialsTeam !== null) {
      officials.team = this.#officialsTeam;
      return officials
    }

    officials.first = this.#first;
    if (this.#second !== null) {
      officials.second = this.#second;
    }
    if (this.#challenge !== null) {
      officials.challenge = this.#challenge;
    }
    if (this.#assistantChallenge !== null) {
      officials.assistantChallenge = this.#assistantChallenge;
    }
    if (this.#reserve !== null) {
      officials.reserve = this.#reserve;
    }
    if (this.#scorer !== null) {
      officials.scorer = this.#scorer;
    }
    if (this.#assistantScorer !== null) {
      officials.assistantScorer = this.#assistantScorer;
    }
    if (this.#linespersons.length > 0) {
      officials.linespersons = this.#linespersons;
    }
    if (this.#ballCrew.length > 0) {
      officials.ballCrew = this.#ballCrew;
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
      this.#match.getGroup().getCompetition().validateTeamID(officialsTeam, this.#match.getID(), 'officials');
    }
    this.#officialsTeam = officialsTeam;
    this.#first = null;
    this.#second = null;
    this.#challenge = null;
    this.#assistantChallenge = null;
    this.#reserve = null;
    this.#scorer = null;
    this.#assistantScorer = null;
    this.#linespersons = [];
    this.#ballCrew = [];
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
    this.#first = first;
    this.#officialsTeam = null;
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
    this.#second = second;
    this.#officialsTeam = null;
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
    this.#challenge = challenge;
    this.#officialsTeam = null;
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
    this.#assistantChallenge = assistantChallenge;
    this.#officialsTeam = null;
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
    this.#reserve = reserve;
    this.#officialsTeam = null;
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
    this.#scorer = scorer;
    this.#officialsTeam = null;
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
    this.#assistantScorer = assistantScorer;
    this.#officialsTeam = null;
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
    this.#linespersons = linespersons;
    this.#officialsTeam = null;
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
    this.#ballCrew = ballCrew;
    this.#officialsTeam = null;
  }
}

var MatchOfficials$1 = MatchOfficials;

class MatchType {
  static CONTINUOUS = 'continuous'
  static SETS = 'sets'
}

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
    this.#group = group;
    this.#id = id;
    this.#court = null;
    this.#venue = null;
    this.#date = null;
    this.#warmup = null;
    this.#start = null;
    this.#duration = null;
    this.#complete = null;
    this.#officials = null;
    this.#mvp = null;
    this.#manager = null;
    this.#friendly = false;
    this.#notes = null;
    this.#isComplete = false;
    this.#isDraw = false;
    this.#homeTeamSets = 0;
    this.#awayTeamSets = 0;
    this.#homeTeamScores = [];
    this.#awayTeamScores = [];
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
      this.setCourt(matchData.court);
    }
    if (matchData.venue) {
      this.setVenue(matchData.venue);
    }
    if (matchData.date) {
      this.setDate(matchData.date);
    }
    if (matchData.warmup) {
      this.setWarmup(matchData.warmup);
    }
    if (matchData.start) {
      this.setStart(matchData.start);
    }
    if (matchData.duration) {
      this.setDuration(matchData.duration);
    }
    if (matchData.complete !== undefined) {
      this.setComplete(matchData.complete);
    } else {
      if (this.#group.getMatchType() === MatchType.CONTINUOUS) {
        throw new Error(`Group {${this.#group.getStage().getID()}:${this.#group.getID()}}, match ID {${matchData.id}}, missing field "complete"`)
      }
    }

    this.setHomeTeam(MatchTeam.loadFromData(this, matchData.homeTeam));
    this.setAwayTeam(MatchTeam.loadFromData(this, matchData.awayTeam));

    this.#homeTeamScores = matchData.homeTeam.scores;
    this.#awayTeamScores = matchData.awayTeam.scores;

    if (matchData.officials) {
      const officials = MatchOfficials$1.loadFromData(this, matchData.officials);
      if (officials.isTeam() && (officials.getTeamID() === this.getHomeTeam().getID() || officials.getTeamID() === this.getAwayTeam().getID())) {
        throw new Error(`Refereeing team (in match {${this.#group.getStage().getID()}:${this.#group.getID()}:${this.getID()}}) cannot be the same as one of the playing teams`)
      }
      this.setOfficials(officials);
    }
    if (matchData.mvp) {
      this.setMVP(matchData.mvp);
    }
    if (matchData.manager) {
      this.setManager(MatchManager.loadFromData(this, matchData.manager));
    }
    if (matchData.notes) {
      this.setNotes(matchData.notes);
    }
    if (matchData.friendly !== undefined) {
      this.setFriendly(matchData.friendly);
    }

    this.#calculateResult();

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
    };

    if (this.#court !== null) {
      match.court = this.#court;
    }
    if (this.#venue !== null) {
      match.venue = this.#venue;
    }

    match.type = 'match';

    if (this.#date !== null) {
      match.date = this.#date;
    }
    if (this.#warmup !== null) {
      match.warmup = this.#warmup;
    }
    if (this.#start !== null) {
      match.start = this.#start;
    }
    if (this.#duration !== null) {
      match.duration = this.#duration;
    }
    if (this.#complete !== null) {
      match.complete = this.#complete;
    }

    match.homeTeam = this.#homeTeam.serialize();
    match.awayTeam = this.#awayTeam.serialize();

    if (this.#officials !== null) {
      match.officials = this.#officials.serialize();
    }
    if (this.#mvp !== null) {
      match.mvp = this.#mvp;
    }
    if (this.#manager !== null) {
      match.manager = this.#manager.serialize();
    }
    match.friendly = this.#friendly;
    if (this.#notes !== null) {
      match.notes = this.#notes;
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
    this.#court = court;
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
    this.#venue = venue;
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
    this.#date = date;
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
    this.#warmup = warmup;
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
    this.#start = start;
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
    this.#duration = duration;
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
    this.#complete = complete;
    this.#isComplete = complete;
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
    this.#homeTeam = homeTeam;
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
    this.#awayTeam = awayTeam;
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
    this.#officials = officials;
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
    this.#mvp = mvp;
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
    this.#manager = manager;
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
    this.#notes = notes;
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
    this.#friendly = friendly;
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
      GroupMatch.assertContinuousScoresValid(homeTeamScores, awayTeamScores, this.#group);
      this.setComplete(complete);
    } else {
      GroupMatch.assertSetScoresValid(homeTeamScores, awayTeamScores, this.#group.getSetConfig());
      if (this.#duration !== null && complete === null) {
        throw new Error('Invalid results: match type is sets and match has a duration, but the match completeness is not set')
      }
      if (complete !== null) {
        this.setComplete(complete);
      }
    }
    this.#homeTeamScores = homeTeamScores;
    this.#awayTeamScores = awayTeamScores;
    this.#calculateResult();
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
      this.#calculateContinuousResult();
    } else {
      if (this.#homeTeam.getScores().length > this.#group.getSetConfig().getMaxSets()) {
        throw new Error(`Invalid match information (in match {${this.#group.getStage().getID()}:${this.#group.getID()}:${this.#id}}): team scores have more sets than the maximum allowed length`)
      }
      try {
        this.#calculateSetsResult();
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
        this.#winnerTeamID = this.#homeTeam.getID();
        this.#loserTeamID = this.#awayTeam.getID();
      } else if (this.#homeTeam.getScores()[0] < this.#awayTeam.getScores()[0]) {
        this.#winnerTeamID = this.#awayTeam.getID();
        this.#loserTeamID = this.#homeTeam.getID();
      } else if (this.#group.getDrawsAllowed()) {
        this.#isDraw = true;
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
    const scoreLength = homeTeamScores.length;
    if (scoreLength > 1) {
      throw new Error('Invalid results: match type is continuous, but score length is greater than one')
    }
    if (groupConfig instanceof Group$1) {
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
    this.constructor.assertSetScoresValid(this.#homeTeam.getScores(), this.#awayTeam.getScores(), this.#group.getSetConfig());

    const maxSets = this.#group.getSetConfig().getMaxSets();
    const setsToWin = this.#group.getSetConfig().getSetsToWin();
    const scoreLength = this.#homeTeam.getScores().length;

    this.#homeTeamSets = 0;
    this.#awayTeamSets = 0;
    for (let setNumber = 0; setNumber < scoreLength; setNumber++) {
      if (this.#homeTeam.getScores()[setNumber] < this.#group.getSetConfig().getMinPoints() && this.#awayTeam.getScores()[setNumber] < this.#group.getSetConfig().getMinPoints()) {
        continue
      }
      if (this.#isComplete || GroupMatch.#isSetComplete(setNumber, this.#homeTeam.getScores()[setNumber], this.#awayTeam.getScores()[setNumber], this.#group.getSetConfig())) {
        if (this.#homeTeam.getScores()[setNumber] > this.#awayTeam.getScores()[setNumber]) {
          this.#homeTeamSets++;
        } else if (this.#homeTeam.getScores()[setNumber] < this.#awayTeam.getScores()[setNumber]) {
          this.#awayTeamSets++;
        }
      }
    }

    if (this.#duration === null &&
        (this.#homeTeamSets + this.#awayTeamSets === maxSets || this.#homeTeamSets >= setsToWin || this.#awayTeamSets >= setsToWin)) {
      this.#isComplete = true;
    }

    if (this.#isComplete) {
      if (this.#homeTeamSets > this.#awayTeamSets) {
        this.#winnerTeamID = this.#homeTeam.getID();
        this.#loserTeamID = this.#awayTeam.getID();
      } else if (this.#homeTeamSets < this.#awayTeamSets) {
        this.#winnerTeamID = this.#awayTeam.getID();
        this.#loserTeamID = this.#homeTeam.getID();
      } else if (this.#group.getDrawsAllowed()) {
        this.#isDraw = true;
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
    const homeScoreLength = homeTeamScores.length;
    const awayScoreLength = awayTeamScores.length;

    if (homeScoreLength !== awayScoreLength) {
      throw new Error('Invalid set scores: score arrays are different lengths')
    }

    if (homeScoreLength > setConfig.getMaxSets()) {
      throw new Error('Invalid set scores: score arrays are longer than the maximum number of sets allowed')
    }

    let seenIncompleteSet = false;
    for (let setNumber = 0; setNumber < homeScoreLength; setNumber++) {
      if (seenIncompleteSet && (homeTeamScores[setNumber] !== 0 || awayTeamScores[setNumber] !== 0)) {
        throw new Error('Invalid set scores: data contains non-zero scores for a set after an incomplete set')
      }

      const deciderSet = (setNumber === setConfig.getMaxSets() - 1);
      const clearByPoints = Math.abs(homeTeamScores[setNumber] - awayTeamScores[setNumber]);
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
          seenIncompleteSet = true;
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
    const deciderSet = (setNumber === setConfig.getMaxSets() - 1);
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
    const hasEnoughPoints = homeScore >= setConfig.getPointsToWin() || awayScore >= setConfig.getPointsToWin();
    const isClearByEnoughPoints = clearByPoints >= setConfig.getClearPoints();
    const hasScoredMaximumPoints = (homeScore === setConfig.getMaxPoints() || awayScore === setConfig.getMaxPoints());
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
    const hasEnoughPoints = homeScore >= setConfig.getLastSetPointsToWin() || awayScore >= setConfig.getLastSetPointsToWin();
    const isClearByEnoughPoints = clearByPoints >= setConfig.getClearPoints();
    const hasScoredMaximumPoints = (homeScore === setConfig.getLastSetMaxPoints() || awayScore === setConfig.getLastSetMaxPoints());
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

class GroupType {
  static LEAGUE = 'league'
  static CROSSOVER = 'crossover'
  static KNOCKOUT = 'knockout'
}

/**
 * Represents a knockout configuration for a competition.
 */
class KnockoutConfig {
  /**
   * An ordered mapping from a position to a team ID
   * @type {array}
   * @private
   */
  #standing

  /**
   * The knockout group this configuration is associated with
   * @type {Group}
   * @private
   */
  #group

  /**
   * Constructs a new KnockoutConfig instance.
   *
   * @param {Group} group The group associated with this knockout configuration.
   */
  constructor (group) {
    this.#standing = [];
    this.#group = group;
  }

  /**
   * Loads knockout configuration data from an object.
   *
   * @param {object} knockoutData The data object containing knockout configuration information.
   * @returns {KnockoutConfig} The updated KnockoutConfig instance.
   */
  loadFromData (knockoutData) {
    this.setStanding(knockoutData.standing);
    return this
  }

  /**
   * The knockout configuration in a form suitable for serializing
   *
   * @returns {object} The serialized knockout configuration data.
   */
  serialize () {
    const knockout = {};
    knockout.standing = this.#standing;
    return knockout
  }

  /**
   * Gets the group associated with this knockout configuration.
   *
   * @returns {Group} The group associated with this knockout configuration.
   */
  getGroup () {
    return this.#group
  }

  /**
   * Sets the standing array for this knockout configuration.
   *
   * @param {Array<object>} standing The array of standing maps.
   * @returns {KnockoutConfig} The KnockoutConfig instance with the updated standing array.
   */
  setStanding (standing) {
    this.#standing = standing;
    return this
  }

  /**
   * Gets the standing array for this knockout configuration.
   *
   * @returns {Array<object>} The array of standing maps for this knockout configuration.
   */
  getStanding () {
    return this.#standing
  }
}

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
    this.#played = 0;
    this.#perSet = 0;
    this.#win = 3;
    this.#winByOne = 0;
    this.#lose = 0;
    this.#loseByOne = 0;
    this.#forfeit = 0;
    this.#leagueConfig = leagueConfig;
  }

  /**
   * Load league points configuration data from a provided object.
   *
   * @param {object} leagueConfigData The league points configuration data to load
   * @return {LeagueConfigPoints} Returns the LeagueConfigPoints instance after loading the data
   */
  loadFromData (leagueConfigData) {
    if (leagueConfigData.played !== undefined) {
      this.setPlayed(leagueConfigData.played);
    }
    if (leagueConfigData.perSet !== undefined) {
      this.setPerSet(leagueConfigData.perSet);
    }
    if (leagueConfigData.win !== undefined) {
      this.setWin(leagueConfigData.win);
    }
    if (leagueConfigData.winByOne !== undefined) {
      this.setWinByOne(leagueConfigData.winByOne);
    }
    if (leagueConfigData.lose !== undefined) {
      this.setLose(leagueConfigData.lose);
    }
    if (leagueConfigData.loseByOne !== undefined) {
      this.setLoseByOne(leagueConfigData.loseByOne);
    }
    if (leagueConfigData.forfeit !== undefined) {
      this.setForfeit(leagueConfigData.forfeit);
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
    this.#played = played;
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
    this.#perSet = perSet;
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
    this.#win = win;
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
    this.#winByOne = winByOne;
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
    this.#lose = lose;
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
    this.#loseByOne = loseByOne;
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
    this.#forfeit = forfeit;
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

/**
 * Configuration for a league within a competition.
 */
class LeagueConfig {
  /**
   * An array of parameters that define how the league positions are determined
   * @type {array}
   * @private
   */
  #ordering

  /**
   * Properties defining how to calculate the league points based on match results
   * @type {LeagueConfigPoints}
   * @private
   */
  #points

  /**
   * The league this config is for
   * @type {League}
   * @private
   */
  #league

  /**
   * Constructs a new LeagueConfig instance.
   *
   * @param {League} league The league this configuration is associated with
   */
  constructor (league) {
    this.#league = league;
    this.#ordering = [];
    this.#points = {};
  }

  /**
   * Load league configuration data from a provided object.
   *
   * @param {object} leagueData The league configuration data to load
   * @return {LeagueConfig} Returns the LeagueConfig instance after loading the data
   */
  loadFromData (leagueData) {
    const leagueConfigPoints = (new LeagueConfigPoints(this)).loadFromData(leagueData.points);
    this.setOrdering(leagueData.ordering).setPoints(leagueConfigPoints);
    return this
  }

  /**
   * The league configuration in a form suitable for serializing
   *
   * @return {object} The serialized league configuration data
   */
  serialize () {
    const leagueConfig = {
      ordering: this.#ordering,
      points: this.#points.serialize()
    };
    return leagueConfig
  }

  /**
   * Get the league associated with this configuration.
   *
   * @return {League} The league associated with this configuration
   */
  getLeague () {
    return this.#league
  }

  /**
   * Set the ordering configuration for the league.
   *
   * @param {array} ordering The ordering configuration for the league
   * @return {LeagueConfig} Returns the LeagueConfig instance for method chaining
   */
  setOrdering (ordering) {
    this.#ordering = ordering;
    return this
  }

  /**
   * Get the ordering configuration for the league.
   *
   * @return {array} The ordering configuration for the league
   */
  getOrdering () {
    return this.#ordering
  }

  /**
   * Get the points configuration for the league.
   *
   * @return {LeagueConfigPoints} The points configuration for the league
   */
  getPoints () {
    return this.#points
  }

  /**
   * Set the points configuration for the league.
   *
   * @param {LeagueConfigPoints} points The points configuration for the league
   * @return {LeagueConfig} Returns the LeagueConfig instance for method chaining
   */
  setPoints (points) {
    this.#points = points;
    return this
  }
}

/**
 * Configuration defining the nature of a set.
 */
class SetConfig {
  /**
   * The maximum number of sets that could be played, often known as 'best of', e.g., if this has the value '5' then the match is played as 'best of 5 sets'
   * @var {int}
   * @private
   **/
  #maxSets

  /**
    * The number of sets that must be won to win the match.
    * @var {int}
    * @private
    **/
  #setsToWin

  /**
    * The number of points lead that the winning team must have.
    * @var {int}
    * @private
    **/
  #clearPoints

  /**
    * The minimum number of points that either team must score for a set to count as valid.
    * @var {int}
    * @private
    **/
  #minPoints

  /**
    * The minimum number of points required to win all but the last set.
    * @var {int}
    * @private
    **/
  #pointsToWin

  /**
    * The minimum number of points required to win the last set.
    * @var {int}
    * @private
    **/
  #lastSetPointsToWin

  /**
    * The upper limit of points that can be scored in a set.
    * @var {int}
    * @private
    **/
  #maxPoints

  /**
    * The upper limit of points that can be scored in the last set.
    * @var {int}
    * @private
    **/
  #lastSetMaxPoints

  /**
    * The group that this SetConfig belongs to
    * @var {Group}
    * @private
    **/
  #group

  /**
   * @param {Group} group The group that this SetConfig belongs to
   */
  constructor (group) {
    this.#maxSets = 5;
    this.#setsToWin = 3;
    this.#clearPoints = 2;
    this.#minPoints = 1;
    this.#pointsToWin = 25;
    this.#lastSetPointsToWin = 15;
    this.#maxPoints = 1000;
    this.#lastSetMaxPoints = 1000;
    this.#group = group;
  }

  /**
   * Load set configuration data from an object.
   *
   * @param {Object} setData The set configuration data
   * @return {SetConfig} The updated SetConfig object
   */
  loadFromData (setData) {
    if (Object.hasOwn(setData, 'maxSets')) {
      this.setMaxSets(setData.maxSets);
    }

    if (Object.hasOwn(setData, 'setsToWin')) {
      this.setSetsToWin(setData.setsToWin);
    }

    if (Object.hasOwn(setData, 'clearPoints')) {
      this.setClearPoints(setData.clearPoints);
    }

    if (Object.hasOwn(setData, 'minPoints')) {
      this.setMinPoints(setData.minPoints);
    }

    if (Object.hasOwn(setData, 'pointsToWin')) {
      this.setPointsToWin(setData.pointsToWin);
    }

    if (Object.hasOwn(setData, 'lastSetPointsToWin')) {
      this.setLastSetPointsToWin(setData.lastSetPointsToWin);
    }

    if (Object.hasOwn(setData, 'maxPoints')) {
      this.setMaxPoints(setData.maxPoints);
    }

    if (Object.hasOwn(setData, 'lastSetMaxPoints')) {
      this.setLastSetMaxPoints(setData.lastSetMaxPoints);
    }

    return this
  }

  /**
   * Get the group that this SetConfig belongs to.
   *
   * @return {Group} The group that this SetConfig belongs to
   */
  getGroup () {
    return this.#group
  }

  /**
   * The set configuration data in a form suitable for serializing
   *
   * @return {Object} The serialized set configuration data
   */
  serialize () {
    return {
      maxSets: this.#maxSets,
      setsToWin: this.#setsToWin,
      clearPoints: this.#clearPoints,
      minPoints: this.#minPoints,
      pointsToWin: this.#pointsToWin,
      lastSetPointsToWin: this.#lastSetPointsToWin,
      maxPoints: this.#maxPoints,
      lastSetMaxPoints: this.#lastSetMaxPoints
    }
  }

  /**
   * Set the maximum number of sets that could be played.
   *
   * @param {number} maxSets The maximum number of sets
   */
  setMaxSets (maxSets) {
    this.#maxSets = maxSets;
  }

  /**
   * Get the maximum number of sets that could be played.
   *
   * @return {number} The maximum number of sets
   */
  getMaxSets () {
    return this.#maxSets
  }

  /**
   * Set the number of sets that must be won to win the match.
   *
   * @param {number} setsToWin The number of sets to win
   */
  setSetsToWin (setsToWin) {
    this.#setsToWin = setsToWin;
  }

  /**
   * Get the number of sets that must be won to win the match.
   *
   * @return {number} The number of sets to win
   */
  getSetsToWin () {
    return this.#setsToWin
  }

  /**
   * Set the number of points lead that the winning team must have.
   *
   * @param {number} clearPoints The number of clear points
   */
  setClearPoints (clearPoints) {
    this.#clearPoints = clearPoints;
  }

  /**
   * Get the number of points lead that the winning team must have.
   *
   * @return {number} The number of clear points
   */
  getClearPoints () {
    return this.#clearPoints
  }

  /**
   * Set the minimum number of points that either team must score for a set to count as valid.
   *
   * @param {number} minPoints The minimum number of points
   */
  setMinPoints (minPoints) {
    this.#minPoints = minPoints;
  }

  /**
   * Get the minimum number of points that either team must score for a set to count as valid.
   *
   * @return {number} The minimum number of points
   */
  getMinPoints () {
    return this.#minPoints
  }

  /**
   * Set the minimum number of points required to win all but the last set.
   *
   * @param {number} pointsToWin The minimum number of points to win
   */
  setPointsToWin (pointsToWin) {
    this.#pointsToWin = pointsToWin;
  }

  /**
   * Get the minimum number of points required to win all but the last set.
   *
   * @return {number} The minimum number of points to win
   */
  getPointsToWin () {
    return this.#pointsToWin
  }

  /**
   * Set the minimum number of points required to win the last set.
   *
   * @param {number} lastSetPointsToWin The minimum number of points to win the last set
   */
  setLastSetPointsToWin (lastSetPointsToWin) {
    this.#lastSetPointsToWin = lastSetPointsToWin;
  }

  /**
   * Get the minimum number of points required to win the last set.
   *
   * @return {number} The minimum number of points to win the last set
   */
  getLastSetPointsToWin () {
    return this.#lastSetPointsToWin
  }

  /**
   * Set the upper limit of points that can be scored in a set.
   *
   * @param {number} maxPoints The upper limit of points in a set
   */
  setMaxPoints (maxPoints) {
    this.#maxPoints = maxPoints;
  }

  /**
   * Get the upper limit of points that can be scored in a set.
   *
   * @return {number} The upper limit of points in a set
   */
  getMaxPoints () {
    return this.#maxPoints
  }

  /**
   * Set the upper limit of points that can be scored in the last set.
   *
   * @param {number} lastSetMaxPoints The upper limit of points in the last set
   */
  setLastSetMaxPoints (lastSetMaxPoints) {
    this.#lastSetMaxPoints = lastSetMaxPoints;
  }

  /**
   * Get the upper limit of points that can be scored in the last set.
   *
   * @return {number} The upper limit of points in the last set
   */
  getLastSetMaxPoints () {
    return this.#lastSetMaxPoints
  }
}

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
    this._id = id;
    this._stage = stage;
    this._competition = stage.getCompetition();
    this._matchType = matchType;
    this._name = null;
    this._notes = null;
    this._description = null;
    this.#matchLookup = {};
    this.#teamHasMatchesLookup = {};
    this.#teamHasOfficiatingLookup = {};
    this.#teamReferences = [];
    this.#playingTeamIDs = [];
    this.#officiatingTeamIDs = [];
    this.#teamIDs = [];
    this._isComplete = true;
    this._isCompleteKnown = false;
    this._matches = [];
    this._sets = null;
    this._knockoutConfig = null;
    this._leagueConfig = null;
    this._type = null;
    this._drawsAllowed = false;
    this.#stgGrpLookup = null;
    this.#maybeTeams = null;
    this.#matchesHaveCourts = false;
    this.#matchesHaveDates = false;
    this.#matchesHaveDurations = false;
    this.#matchesHaveMVPs = false;
    this.#matchesHaveManagers = false;
    this.#matchesHaveNotes = false;
    this.#matchesHaveOfficials = false;
    this.#matchesHaveStarts = false;
    this.#matchesHaveVenues = false;
    this.#matchesHaveWarmups = false;
  }

  /**
   * Load group data from object
   *
   * @param {object} groupData The data defining this Group
   * @return {Group} The loaded group instance
   */
  loadFromData (groupData) {
    if (groupData.name !== undefined) {
      this.setName(groupData.name);
    }

    if (groupData.notes !== undefined) {
      this.setNotes(groupData.notes);
    }

    if (groupData.description !== undefined) {
      this.setDescription(groupData.description);
    }

    if (groupData.sets !== undefined) {
      const setConfig = new SetConfig(this);
      this.setSetConfig(setConfig);
      setConfig.loadFromData(groupData.sets);
    }

    if (groupData.knockout !== undefined) {
      const knockoutConfig = new KnockoutConfig(this);
      this.setKnockoutConfig(knockoutConfig);
      knockoutConfig.loadFromData(groupData.knockout);
    }

    if (groupData.league !== undefined) {
      const leagueConfig = new LeagueConfig(this);
      this.setLeagueConfig(leagueConfig);
      leagueConfig.loadFromData(groupData.league);
    }

    for (const matchData of groupData.matches) {
      if (matchData.type === 'match') {
        this.addMatch((new GroupMatch(this, matchData.id)).loadFromData(matchData));
      } else if (matchData.type === 'break') {
        this.addBreak((new GroupBreak(this)).loadFromData(matchData));
      }
    }

    return this
  }

  /**
   * Return the group data in a form suitable for serializing
   *
   * @return {object} The serialized group data
   */
  serialize () {
    const group = {
      id: this._id
    };

    if (this._name !== null) {
      group.name = this._name;
    }

    if (this._notes !== null) {
      group.notes = this._notes;
    }

    if (this._description !== null) {
      group.description = this._description;
    }

    group.type = this._type;

    if (this._type === GroupType.LEAGUE && this._leagueConfig !== null) {
      group.league = this._leagueConfig.serialize();
    } else if (this._type === GroupType.KNOCKOUT && this._knockoutConfig !== null) {
      group.knockout = this._knockoutConfig.serialize();
    }

    group.matchType = this._matchType;

    if (this._matchType === MatchType.SETS && this._sets !== null) {
      group.sets = this._sets.serialize();
    }

    if (this._type === GroupType.LEAGUE) {
      group.drawsAllowed = this._drawsAllowed;
    }

    group.matches = [];
    this._matches.forEach(match => {
      group.matches.push(match.serialize());
    });

    return group
  }

  /**
   * Get the stage this group is in
   *
   * @return {Stage} The stage this group is in
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
    this._name = name;
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
    this._notes = notes;
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
    this._description = description;
    return this
  }

  /**
   * Set the knockout configuration for this group
   *
   * @param {KnockoutConfig} knockoutConfig The knockout configuration
   * @returns {Group} The Group instance
   */
  setKnockoutConfig (knockoutConfig) {
    this._knockoutConfig = knockoutConfig;
    return this
  }

  /**
   * Set the league configuration for this group
   *
   * @param {LeagueConfig} leagueConfig The league configuration
   * @returns {Group} The Group instance
   */
  setLeagueConfig (leagueConfig) {
    this._leagueConfig = leagueConfig;
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
    this._sets = sets;
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
    this._drawsAllowed = drawsAllowed;
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
    this._matchesProcessed = false;

    this._competition.validateTeamID(match.getHomeTeam().getID(), match.getID(), 'homeTeam');
    this._competition.validateTeamID(match.getAwayTeam().getID(), match.getID(), 'awayTeam');

    this._matches.push(match);
    this.#matchLookup[match.getID()] = match;

    if (match.hasCourt()) {
      this.#matchesHaveCourts = true;
    }
    if (match.hasDate()) {
      this.#matchesHaveDates = true;
    }
    if (match.hasDuration()) {
      this.#matchesHaveDurations = true;
    }
    if (match.hasMVP()) {
      this.#matchesHaveMVPs = true;
    }
    if (match.hasManager()) {
      this.#matchesHaveManagers = true;
    }
    if (match.hasNotes()) {
      this.#matchesHaveNotes = true;
    }
    if (match.hasOfficials()) {
      this.#matchesHaveOfficials = true;
    }
    if (match.hasStart()) {
      this.#matchesHaveStarts = true;
    }
    if (match.hasVenue()) {
      this.#matchesHaveVenues = true;
    }
    if (match.hasWarmup()) {
      this.#matchesHaveWarmups = true;
    }

    if (match.getHomeTeam().getID().charAt(0) === '{') {
      this.#teamReferences.push(match.getHomeTeam().getID());
    }
    if (match.getAwayTeam().getID().charAt(0) === '{') {
      this.#teamReferences.push(match.getAwayTeam().getID());
    }

    this.#playingTeamIDs[match.getHomeTeam().getID()] = true;
    this.#playingTeamIDs[match.getAwayTeam().getID()] = true;
    this.#teamIDs[match.getHomeTeam().getID()] = true;
    this.#teamIDs[match.getAwayTeam().getID()] = true;
    if (match.hasOfficials() && match.getOfficials().isTeam()) {
      this.#teamIDs[match.getOfficials().getTeamID()] = true;
      this.#officiatingTeamIDs[match.getOfficials().getTeamID()] = true;
    }

    this._isCompleteKnown = false;

    return this
  }

  /**
   * Add a break to this group
   *
   * @param {GroupBreak} breakObj The break to add
   * @returns {Group} The Group instance
   */
  addBreak (breakObj) {
    this._matches.push(breakObj);
    this._isCompleteKnown = false;
    return this
  }

  /**
   * Returns a list of matches from this Group, where the list depends on the input parameters and on the type of the MatchContainer
   *
   * @param {string|null} teamID When provided, return the matches where this team is playing, otherwise all matches are returned
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
  getMatches (teamID = null, flags = 0) {
    if (teamID === null ||
            flags & Competition$1.VBC_MATCH_ALL_IN_GROUP ||
            teamID === CompetitionTeam.UNKNOWN_TEAM_ID ||
            teamID.charAt(0) === '{') {
      return this._matches
    }

    const matches = [];

    for (const match of this._matches) {
      if (match instanceof GroupBreak) {
        continue
      } else if (flags & Competition$1.VBC_MATCH_PLAYING &&
                (this._competition.getTeamByID(match.getHomeTeam().getID()).getID() === teamID || this._competition.getTeamByID(match.getAwayTeam().getID()).getID() === teamID)) {
        matches.push(match);
      } else if (flags & Competition$1.VBC_MATCH_OFFICIATING &&
                match.getOfficials() !== null &&
                match.getOfficials().isTeam() &&
                this._competition.getTeamByID(match.getOfficials().getTeamID()).getID() === teamID) {
        matches.push(match);
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
  getTeamIDs (flags = Competition$1.VBC_TEAMS_FIXED_ID) {
    let teamIDs = [];

    if (flags & Competition$1.VBC_TEAMS_ALL) {
      teamIDs = Object.keys(this.#teamIDs);
    } else if (flags & Competition$1.VBC_TEAMS_PLAYING) {
      teamIDs = Object.keys(this.#playingTeamIDs);
    } else if (flags & Competition$1.VBC_TEAMS_OFFICIATING) {
      teamIDs = Object.keys(this.#officiatingTeamIDs);
    } else if (flags & Competition$1.VBC_TEAMS_MAYBE) {
      return this.#getMaybeTeamIDs()
    } else if (flags & Competition$1.VBC_TEAMS_KNOWN) {
      teamIDs = Object.keys(this.#teamIDs).filter(k => this._competition.getTeamByID(k).getID() !== CompetitionTeam.UNKNOWN_TEAM_ID);
      teamIDs.sort((a, b) => this._competition.getTeamByID(a).getName().localeCompare(this._competition.getTeamByID(b).getName()));
    } else if (flags & Competition$1.VBC_TEAMS_FIXED_ID) {
      teamIDs = Object.keys(this.#teamIDs).filter(k => k.charAt(0) !== '{');
      teamIDs.sort((a, b) => this._competition.getTeamByID(a).getName().localeCompare(this._competition.getTeamByID(b).getName()));
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
      this.#maybeTeams = [];
      this.#buildStageGroupLookup();

      const stgGrpLookupValues = Object.values(this.#stgGrpLookup);
      for (let i = 0; i < stgGrpLookupValues.length; i++) {
        const group = this._competition.getStageByID(stgGrpLookupValues[i].stage).getGroupByID(stgGrpLookupValues[i].group);
        if (!group.isComplete()) {
          this.#maybeTeams = Array.from(new Set([...this.#maybeTeams, ...group.getTeamIDs(Competition$1.VBC_TEAMS_KNOWN), ...group.getTeamIDs(Competition$1.VBC_TEAMS_MAYBE)]));
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
      this.#stgGrpLookup = {};
      for (const match of this.getMatches()) {
        if (match instanceof GroupMatch) {
          const homeTeamParts = match.getHomeTeam().getID().substring(1).split(':', 3);
          if (homeTeamParts.length > 2) {
            const key = `${homeTeamParts[0]}:${homeTeamParts[1]}`;
            if (!Object.hasOwn(this.#stgGrpLookup, key)) {
              this.#stgGrpLookup[key] = { stage: homeTeamParts[0], group: homeTeamParts[1] };
            }
          }
          const awayTeamParts = match.getAwayTeam().getID().substring(1).split(':', 3);
          if (awayTeamParts.length > 2) {
            const key = `${awayTeamParts[0]}:${awayTeamParts[1]}`;
            if (!Object.hasOwn(this.#stgGrpLookup, key)) {
              this.#stgGrpLookup[key] = { stage: awayTeamParts[0], group: awayTeamParts[1] };
            }
          }
          if (match.getOfficials() !== null && match.getOfficials().isTeam()) {
            const refereeTeamParts = match.getOfficials().getTeamID().substring(1).split(':', 3);
            if (refereeTeamParts.length > 2) {
              const key = `${refereeTeamParts[0]}:${refereeTeamParts[1]}`;
              if (!Object.hasOwn(this.#stgGrpLookup, key)) {
                this.#stgGrpLookup[key] = { stage: refereeTeamParts[0], group: refereeTeamParts[1] };
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
   * @param {string} matchID The ID of the match
   *
   * @returns {GroupMatch} The requested match
   */
  getMatchByID (matchID) {
    if (Object.hasOwn(this.#matchLookup, matchID)) {
      return this.#matchLookup[matchID]
    }
    throw new Error(`Match with ID ${matchID} not found`)
  }

  /**
   * Checks if a match with the given ID exists in the group.
   *
   * @param {string} matchID The ID of the match to check
   * @return {boolean} True if a match with the given ID exists, false otherwise
   */
  hasMatchWithID (matchID) {
    return Object.hasOwn(this.#matchLookup, matchID)
  }

  /**
   * Process the matches in this group
   */
  processMatches () {
    this._matchesProcessed = true;
  }

  /**
   * Get the team by ID based on the type of entity.
   *
   * @param {string} type The type part of the team reference ('MATCH-ID' or 'league')
   * @param {string} entity The entity (e.g., 'winner' or 'loser')
   * @return {CompetitionTeam} The CompetitionTeam instance
   * @throws {Error} If the entity is invalid
   */
  getTeamByID (type, entity) {
    if (type === 'league') {
      throw new Error('Invalid type "league" in team reference.  Cannot get league position from a non-league group')
    }

    const match = this.getMatchByID(type);

    switch (entity) {
      case 'winner':
        return this._competition.getTeamByID(match.getWinnerTeamID())
      case 'loser':
        return this._competition.getTeamByID(match.getLoserTeamID())
      default:
        throw new Error(`Invalid entity "${entity}" in team reference`)
    }
  }

  /**
   * Checks if the matches in this group have been processed.
   *
   * @return {boolean} True if the matches in this group have been processed, false otherwise
   */
  isProcessed () {
    return this._matchesProcessed
  }

  /**
   * Checks if the group is complete, i.e., all matches in the group are complete.
   *
   * @return {boolean} True if the group is complete, false otherwise
   */
  isComplete () {
    if (!this._isCompleteKnown) {
      let completedMatches = 0;
      let matchesInThisPool = 0;

      for (const match of this.getMatches()) {
        if (match instanceof GroupBreak) {
          continue
        }

        matchesInThisPool++;

        if (match.isComplete()) {
          completedMatches++;
        }
      }
      this._isComplete = completedMatches === matchesInThisPool;
      this._isCompleteKnown = true;
    }

    return this._isComplete
  }

  /**
   * Checks if the matches in this group have courts.
   *
   * @return {boolean} True if the matches in this group have courts, false otherwise
   */
  matchesHaveCourts () {
    return this.#matchesHaveCourts
  }

  /**
   * Checks if the matches in this group have dates.
   *
   * @return {boolean} True if the matches in this group have dates, false otherwise
   */
  matchesHaveDates () {
    return this.#matchesHaveDates
  }

  /**
   * Checks if the matches in this group have durations.
   *
   * @return {boolean} True if the matches in this group have durations, false otherwise
   */
  matchesHaveDurations () {
    return this.#matchesHaveDurations
  }

  /**
   * Checks if the matches in this group have MVPs.
   *
   * @return {boolean} True if the matches in this group have MVPs, false otherwise
   */
  matchesHaveMVPs () {
    return this.#matchesHaveMVPs
  }

  /**
   * Checks if the matches in this group have court managers.
   *
   * @return {boolean} True if the matches in this group have court managers, false otherwise
   */
  matchesHaveManagers () {
    return this.#matchesHaveManagers
  }

  /**
   * Checks if the matches in this group have notes.
   *
   * @return {boolean} True if the matches in this group have notes, false otherwise
   */
  matchesHaveNotes () {
    return this.#matchesHaveNotes
  }

  /**
   * Checks if the matches in this group have officials.
   *
   * @return {boolean} True if the matches in this group have officials, false otherwise
   */
  matchesHaveOfficials () {
    return this.#matchesHaveOfficials
  }

  /**
   * Checks if the matches in this group have start times.
   *
   * @return {boolean} True if the matches in this group have start times, false otherwise
   */
  matchesHaveStarts () {
    return this.#matchesHaveStarts
  }

  /**
   * Checks if the matches in this group have venues.
   *
   * @return {boolean} True if the matches in this group have venues, false otherwise
   */
  matchesHaveVenues () {
    return this.#matchesHaveVenues
  }

  /**
   * Checks if the matches in this group have warmup times.
   *
   * @return {boolean} True if the matches in this group have warmup times, false otherwise
   */
  matchesHaveWarmups () {
    return this.#matchesHaveWarmups
  }

  /**
   * Returns whether all of the teams in this group are known yet or not.
   *
   * @return {boolean} Whether all of the teams in this group are known yet or not
   */
  allTeamsKnown () {
    let allGroupsComplete = true;
    for (const teamReference of this.#teamReferences) {
      const parts = teamReference.trim().replace(/[{}]/g, '').split(':', 4);
      if (!this._competition.getStageByID(parts[0]).getGroupByID(parts[1]).isComplete()) {
        allGroupsComplete = false;
      }
    }
    return allGroupsComplete
  }

  /**
   * Returns whether the specified team is known to have matches in this group.
   *
   * @param {string} teamID The ID of the team
   * @return {boolean} Whether the specified team is known to have matches in this group
   */
  teamHasMatches (teamID) {
    if (!Object.hasOwn(this.#teamHasMatchesLookup, teamID)) {
      this.#teamHasMatchesLookup[teamID] = false;
      for (const match of this._matches) {
        if (match instanceof GroupBreak) {
          continue
        }
        if (this._competition.getTeamByID(match.getHomeTeam().getID()).getID() === teamID) {
          this.#teamHasMatchesLookup[teamID] = true;
          break
        }
        if (this._competition.getTeamByID(match.getAwayTeam().getID()).getID() === teamID) {
          this.#teamHasMatchesLookup[teamID] = true;
          break
        }
      }
    }
    return this.#teamHasMatchesLookup[teamID]
  }

  /**
   * Returns whether the specified team is known to have officiating duties in this group.
   *
   * @param {string} teamID The ID of the team
   * @return {boolean} Whether the specified team is known to have officiating duties in this group
   */
  teamHasOfficiating (teamID) {
    if (!Object.hasOwn(this.#teamHasOfficiatingLookup, teamID)) {
      this.#teamHasOfficiatingLookup[teamID] = false;
      for (const match of this._matches) {
        if (match instanceof GroupBreak) {
          continue
        }
        if (match.getOfficials() !== null && match.getOfficials().isTeam() &&
                    this._competition.getTeamByID(match.getOfficials().getTeamID()).getID() === teamID) {
          this.#teamHasOfficiatingLookup[teamID] = true;
          break
        }
      }
    }
    return this.#teamHasOfficiatingLookup[teamID]
  }

  /**
   * Returns whether the specified team may have matches or officiating duties in this group.
   *
   * @param {string} teamID The ID of the team
   * @return {boolean} Whether it is possible for a team with the given ID to have matches in this group
   */
  teamMayHaveMatches (teamID) {
    if (this.isComplete()) {
      return false
    }

    if (this._competition.getTeamByID(teamID).getID() === CompetitionTeam.UNKNOWN_TEAM_ID) {
      return false
    }

    this.#buildStageGroupLookup();

    const stgGrpLookupValues = Object.values(this.#stgGrpLookup);
    for (let i = 0; i < stgGrpLookupValues.length; i++) {
      const group = this._competition.getStageByID(stgGrpLookupValues[i].stage).getGroupByID(stgGrpLookupValues[i].group);
      if ((!group.isComplete() && group.teamHasMatches(teamID)) || group.teamMayHaveMatches(teamID)) {
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
   * @return {Array<string>} List of match dates
   */
  getMatchDates (teamID = null, flags = Competition$1.VBC_MATCH_PLAYING) {
    const matchDates = {};
    if (teamID === null || teamID === CompetitionTeam.UNKNOWN_TEAM_ID || flags & Competition$1.VBC_MATCH_ALL) {
      for (const match of this._matches) {
        if (match instanceof GroupMatch) {
          matchDates[match.getDate()] = 1;
        }
      }
    } else {
      for (const match of this._matches) {
        if (!(match instanceof GroupMatch)) {
          continue
        }

        if (flags & Competition$1.VBC_MATCH_PLAYING &&
                    (this._competition.getTeamByID(match.getHomeTeam().getID()).getID() === teamID ||
                     this._competition.getTeamByID(match.getAwayTeam().getID()).getID() === teamID)) {
          matchDates[match.getDate()] = 1;
        } else if (flags & Competition$1.VBC_MATCH_OFFICIATING &&
                    match.getOfficials() !== null &&
                    match.getOfficials().isTeam() &&
                    this._competition.getTeamByID(match.getOfficials().getTeamID()).getID() === teamID) {
          matchDates[match.getDate()] = 1;
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
   * @return {Array<MatchInterface>} List of matches on the specified date
   */
  getMatchesOnDate (date, teamID = null, flags = Competition$1.VBC_MATCH_ALL) {
    const matches = [];
    if (teamID === null || teamID === CompetitionTeam.UNKNOWN_TEAM_ID || flags & Competition$1.VBC_MATCH_ALL) {
      for (const match of this._matches) {
        if (match.getDate() === date) {
          matches.push(match);
        }
      }
    } else {
      for (const match of this._matches) {
        if (match.getDate() === date) {
          if (!(match instanceof GroupMatch)) {
            matches.push(match);
          } else if (flags & Competition$1.VBC_MATCH_PLAYING &&
                              (this._competition.getTeamByID(match.getHomeTeam().getID()).getID() === teamID ||
                               this._competition.getTeamByID(match.getAwayTeam().getID()).getID() === teamID)) {
            matches.push(match);
          } else if (flags & Competition$1.VBC_MATCH_OFFICIATING &&
                               match.getOfficials() !== null &&
                               match.getOfficials().isTeam() &&
                               this._competition.getTeamByID(match.getOfficials().getTeamID()).getID() === teamID) {
            matches.push(match);
          }
        }
      }
    }
    return matches
  }
}

var Group$1 = Group;

/**
 * A group within this stage of the competition.  There is no implied league table or team order, just match winners and losers
 */
class Crossover extends Group$1 {
  /**
   * Contains the group data of a stage, creating any metadata needed
   *
   * @param {Stage} stage A link back to the Stage this Group is in
   * @param {string} id The unique ID of this Group
   * @param {MatchType} matchType Whether matches are continuous or played to sets
   */
  constructor (stage, id, matchType) {
    super(stage, id, matchType);
    this._type = GroupType.CROSSOVER;
    this._drawsAllowed = false;
  }
}

/**
 * A break in play, possibly while other matches are going on in other competitions running in parallel
 */
class IfUnknownBreak {
  /**
   * The start time for the break
   * @type {string|null}
   * @private
   */
  #start

  /**
   * The date of the break
   * @type {string|null}
   * @private
   */
  #date

  /**
   * The duration of the break
   * @type {string|null}
   * @private
   */
  #duration

  /**
   * The name for the break, e.g. 'Lunch break'
   * @type {string|null}
   * @private
   */
  #name

  /**
   * The IfUnknown instance this break is associated with
   * @type {IfUnknown}
   * @private
   */
  #ifUnknown

  /**
   * Initializes the IfUnknownBreak instance
   *
   * @param {IfUnknown} ifUnknown The IfUnknown instance this break is in
   */
  constructor (ifUnknown) {
    this.#ifUnknown = ifUnknown;
    this.#start = null;
    this.#date = null;
    this.#duration = null;
    this.#name = null;
  }

  /**
   * Loads data from an object into the IfUnknownBreak instance
   *
   * @param {object} ifUnknownBreakData The data defining this break
   * @returns {IfUnknownBreak} The updated IfUnknownBreak instance
   */
  loadFromData (ifUnknownBreakData) {
    if (Object.hasOwn(ifUnknownBreakData, 'start')) {
      this.setStart(ifUnknownBreakData.start);
    }
    if (Object.hasOwn(ifUnknownBreakData, 'date')) {
      this.setDate(ifUnknownBreakData.date);
    }
    if (Object.hasOwn(ifUnknownBreakData, 'duration')) {
      this.setDuration(ifUnknownBreakData.duration);
    }
    if (Object.hasOwn(ifUnknownBreakData, 'name')) {
      this.setName(ifUnknownBreakData.name);
    }

    return this
  }

  /**
   * Returns the match break data in a form suitable for serializing
   *
   * @returns {object} The serialized break data
   */
  serialize () {
    const breakData = {
      type: 'break'
    };

    if (this.#start !== null) {
      breakData.start = this.#start;
    }
    if (this.#date !== null) {
      breakData.date = this.#date;
    }
    if (this.#duration !== null) {
      breakData.duration = this.#duration;
    }
    if (this.#name !== null) {
      breakData.name = this.#name;
    }

    return breakData
  }

  /**
   * Retrieves the IfUnknown instance this break is associated with
   *
   * @returns {IfUnknown} The IfUnknown instance this break is associated with
   */
  getIfUnknown () {
    return this.#ifUnknown
  }

  /**
   * Sets the start time for this break
   *
   * @param {string} start The start time for this break
   * @returns {IfUnknownBreak} The updated IfUnknownBreak instance
   * @throws {Error} When an invalid start time format is provided
   */
  setStart (start) {
    if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(start)) {
      throw new Error(`Invalid start time "${start}": must contain a value of the form "HH:mm" using a 24 hour clock`)
    }
    this.#start = start;
    return this
  }

  /**
   * Retrieves the start time for this break
   *
   * @returns {string|null} The start time for this break
   */
  getStart () {
    return this.#start
  }

  /**
   * Sets the date for this break
   *
   * @param {string} date The date for this break
   * @returns {IfUnknownBreak} The updated IfUnknownBreak instance
   * @throws {Error} When an invalid date format is provided or the date does not exist
   */
  setDate (date) {
    if (!/^[0-9]{4}-(0[0-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(date)) {
      throw new Error(`Invalid date "${date}": must contain a value of the form "YYYY-MM-DD"`)
    }

    const d = new Date(date);
    if (`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${(d.getDate()).toString().padStart(2, '0')}` !== date) {
      throw new Error(`Invalid date "${date}": date does not exist`)
    }

    this.#date = date;
    return this
  }

  /**
   * Retrieves the date for this break
   *
   * @returns {string|null} The date for this break
   */
  getDate () {
    return this.#date
  }

  /**
   * Sets the duration for this break
   *
   * @param {string} duration The duration for this break
   * @returns {IfUnknownBreak} The updated IfUnknownBreak instance
   * @throws {Error} When an invalid duration format is provided
   */
  setDuration (duration) {
    if (!/^[0-9]+:[0-5][0-9]$/.test(duration)) {
      throw new Error(`Invalid duration "${duration}": must contain a value of the form "HH:mm"`)
    }
    this.#duration = duration;
    return this
  }

  /**
   * Retrieves the duration for this break
   *
   * @returns {string|null} The duration for this break
   */
  getDuration () {
    return this.#duration
  }

  /**
   * Sets the name for this break
   *
   * @param {string} name The name for this break
   * @returns {IfUnknownBreak} The updated IfUnknownBreak instance
   * @throws {Error} When the provided name is invalid
   */
  setName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid break name: must be between 1 and 1000 characters long')
    }
    this.#name = name;
    return this
  }

  /**
   * Retrieves the name for this break
   *
   * @returns {string|null} The name for this break
   */
  getName () {
    return this.#name
  }
}

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
    this.#stage = stage;
    this.#description = description;
    this.#matches = [];
    this.#matchesHaveCourts = false;
    this.#matchesHaveDates = false;
    this.#matchesHaveDurations = false;
    this.#matchesHaveMVPs = false;
    this.#matchesHaveManagers = false;
    this.#matchesHaveNotes = false;
    this.#matchesHaveOfficials = false;
    this.#matchesHaveStarts = false;
    this.#matchesHaveVenues = false;
    this.#matchesHaveWarmups = false;
    this.#matchLookup = {};
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
        const newMatch = new IfUnknownMatch(this, match.id);
        newMatch.loadFromData(match);
        this.addMatch(newMatch);
      } else if (match.type === 'break') {
        this.addBreak((new IfUnknownBreak(this)).loadFromData(match));
      }
    });
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
    };
    this.#matches.forEach(match => [
      ifUnknown.matches.push(match.serialize())
    ]);
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
    this.#matches.push(match);
    this.#matchLookup[match.getID()] = match;
    if (match.getCourt() !== null) {
      this.#matchesHaveCourts = true;
    }
    if (match.getDate() !== null) {
      this.#matchesHaveDates = true;
    }
    if (match.getDuration() !== null) {
      this.#matchesHaveDurations = true;
    }
    if (match.getMVP() !== null) {
      this.#matchesHaveMVPs = true;
    }
    if (match.getManager() !== null) {
      this.#matchesHaveManagers = true;
    }
    if (match.getNotes() !== null) {
      this.#matchesHaveNotes = true;
    }
    if (match.getOfficials() !== null) {
      this.#matchesHaveOfficials = true;
    }
    if (match.getStart() !== null) {
      this.#matchesHaveStarts = true;
    }
    if (match.getVenue() !== null) {
      this.#matchesHaveVenues = true;
    }
    if (match.getWarmup() !== null) {
      this.#matchesHaveWarmups = true;
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
    this.#matches.push(breakObj);
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
  hasMatchWithID (id) {
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
   * @param {string} matchID The ID of the match
   * @returns {IfUnknownMatch} The requested match
   * @throws {OutOfBoundsException} When the match with the specified ID is not found
   */
  getMatchByID (matchID) {
    if (Object.hasOwn(this.#matchLookup, matchID)) {
      return this.#matchLookup[matchID]
    }
    throw new Error(`Match with ID ${matchID} not found`)
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

/**
 * A group within this stage of the competition.  A knockout expects to generate an order of teams based on team elimination
 */
class Knockout extends Group$1 {
  /**
   * Contains the group data of a stage, creating any metadata needed
   *
   * @param {Stage} stage A link back to the Stage this Group is in
   * @param {string} id The unique ID of this Group
   * @param {MatchType} matchType Whether matches are continuous or played to sets
   */
  constructor (stage, id, matchType) {
    super(stage, id, matchType);
    this._type = GroupType.KNOCKOUT;
    this._drawsAllowed = false;
  }

  /**
   * Get the knockout config for this group
   *
   * @return {KnockoutConfig|null} the knockout config for this group
   */
  getKnockoutConfig () {
    return this._knockoutConfig
  }
}

/**
 * Represents a league table for a competition.
*/
class LeagueTable {
  static ORDERING_LEAGUE_POINTS = 'PTS'
  static ORDERING_WINS = 'WINS'
  static ORDERING_LOSSES = 'LOSSES'
  static ORDERING_HEAD_TO_HEAD = 'H2H'
  static ORDERING_POINTS_FOR = 'PF'
  static ORDERING_POINTS_AGAINST = 'PA'
  static ORDERING_POINTS_DIFFERENCE = 'PD'
  static ORDERING_SETS_FOR = 'SF'
  static ORDERING_SETS_AGAINST = 'SA'
  static ORDERING_SETS_DIFFERENCE = 'SD'
  static ORDERING_BONUS_POINTS = 'BP'
  static ORDERING_PENALTY_POINTS = 'PP'

  /**
   * An array of entries in the league table
   * @type {array}
   * @private
   */
  entries = []

  /**
   * The league associated with this table
   * @type {League}
   * @private
   */
  #league

  /**
   * Indicates if draws are allowed in the league
   * @type {bool}
   * @private
   */
  #hasDraws

  /**
   * Indicates if the league uses sets
   * @type {bool}
   * @private
   */
  #hasSets

  /**
   * The ordering criteria for the league table
   * @type {array}
   * @private
   */
  #ordering

  /**
   * Constructs a new LeagueTable instance.
   *
   * @param {League} league The league associated with this table
   */
  constructor (league) {
    this.#league = league;
    this.#hasDraws = league.getDrawsAllowed();
    this.#hasSets = league.getMatchType() === MatchType.SETS;
    this.#ordering = league.getLeagueConfig().getOrdering();
  }

  /**
   * Get the league associated with this table.
   *
   * @return {League} The league associated with this table
   */
  getLeague () {
    return this.#league
  }

  /**
   * Get the text representation of the ordering criteria for the league table.
   *
   * @return {string} The text representation of the ordering criteria
   */
  getOrderingText () {
    let orderingText = `Position is decided by ${LeagueTable.#mapOrderingToString(this.#ordering[0])}`;
    for (let i = 1; i < this.#ordering.length; i++) {
      orderingText += `, then ${LeagueTable.#mapOrderingToString(this.#ordering[i])}`;
    }
    return orderingText
  }

  /**
   * Maps ordering string to human-readable format.
   *
   * @param {string} orderingString The ordering string to map
   * @return {string} The human-readable representation of the ordering string
   */
  static #mapOrderingToString (orderingString) {
    switch (orderingString) {
      case LeagueTable.ORDERING_LEAGUE_POINTS:
        return 'points'
      case LeagueTable.ORDERING_WINS:
        return 'wins'
      case LeagueTable.ORDERING_LOSSES:
        return 'losses'
      case LeagueTable.ORDERING_HEAD_TO_HEAD:
        return 'head-to-head'
      case LeagueTable.ORDERING_POINTS_FOR:
        return 'points for'
      case LeagueTable.ORDERING_POINTS_AGAINST:
        return 'points against'
      case LeagueTable.ORDERING_POINTS_DIFFERENCE:
        return 'points difference'
      case LeagueTable.ORDERING_SETS_FOR:
        return 'sets for'
      case LeagueTable.ORDERING_SETS_AGAINST:
        return 'sets against'
      case LeagueTable.ORDERING_SETS_DIFFERENCE:
        return 'sets difference'
      case LeagueTable.ORDERING_BONUS_POINTS:
        return 'bonus points'
      case LeagueTable.ORDERING_PENALTY_POINTS:
        return 'penalty points'
    }
  }

  /**
   * Get the text representation of the scoring system used in the league.
   *
   * @return {string} The text representation of the league's scoring system
   */
  getScoringText () {
    const textBuilder = (points, action) => {
      if (points === 1) {
        return `1 point per ${action}, `
      } else {
        return `${points} points per ${action}, `
      }
    };

    const leagueConfig = this.#league.getLeagueConfig().getPoints();
    let scoringText = 'Teams win ';
    if (leagueConfig.getPlayed() !== 0) {
      scoringText += textBuilder(leagueConfig.getPlayed(), 'played');
    }
    if (leagueConfig.getWin() !== 0) {
      scoringText += textBuilder(leagueConfig.getWin(), 'win');
    }
    if (leagueConfig.getPerSet() !== 0) {
      scoringText += textBuilder(leagueConfig.getPerSet(), 'set');
    }
    if (leagueConfig.getWinByOne() !== 0 && leagueConfig.getWin() !== leagueConfig.getWinByOne()) {
      scoringText += textBuilder(leagueConfig.getWinByOne(), 'win by one set');
    }
    if (leagueConfig.getLose() !== 0) {
      scoringText += textBuilder(leagueConfig.getLose(), 'loss');
    }
    if (leagueConfig.getLoseByOne() !== 0 && leagueConfig.getWin() !== leagueConfig.getLoseByOne()) {
      scoringText += textBuilder(leagueConfig.getLoseByOne(), 'loss by one set');
    }
    if (leagueConfig.getForfeit() !== 0) {
      scoringText += textBuilder(leagueConfig.getForfeit(), 'forfeited match');
    }
    if (scoringText.length < 12) {
      // Everything is zero; weird but possible
      return ''
    }
    return scoringText.slice(0, -2).replace(/(.*), ([^,]*)/, '$1 and $2')
  }

  /**
   * Checks if draws are allowed in the league.
   *
   * @return {boolean} True if draws are allowed, false otherwise
   */
  hasDraws () {
    return this.#hasDraws
  }

  /**
   * Checks if the league uses sets.
   *
   * @return {boolean} True if the league uses sets, false otherwise
   */
  hasSets () {
    return this.#hasSets
  }

  /**
   * Get the group ID associated with this league table.
   *
   * @return {string} The group ID associated with this league table
   */
  getGroupID () {
    return this.#league.getID()
  }
}

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
    this.#league = league;
    this.#teamID = teamID;
    this.#team = name;
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
    };

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
    this.#played = played;
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
    this.#wins = wins;
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
    this.#losses = losses;
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
    this.#draws = draws;
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
    this.#sf = sf;
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
    this.#sa = sa;
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
    this.#sd = sd;
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
    this.#pf = pf;
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
    this.#pa = pa;
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
    this.#pd = pd;
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
    this.#bp = bp;
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
    this.#pp = pp;
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
    this.#pts = pts;
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

/**
 * A group within this stage of the competition. Leagues expect all teams to play each other at least once, and have a league table
 */
class League extends Group$1 {
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
    super(stage, id, matchType);
    this._type = GroupType.LEAGUE;
    this._drawsAllowed = drawsAllowed;
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
    this._matchesProcessed = true;

    this.#table = new LeagueTable(this);

    const teamResults = [];

    this._matches.forEach(match => {
      if (match instanceof GroupBreak || match.isFriendly()) {
        return
      }

      const homeTeamID = match.getHomeTeam().getID();
      const awayTeamID = match.getAwayTeam().getID();

      if (!teamResults[homeTeamID]) {
        teamResults[homeTeamID] = new LeagueTableEntry(this, homeTeamID, this._competition.getTeamByID(homeTeamID).getName());
      }

      if (!teamResults[awayTeamID]) {
        teamResults[awayTeamID] = new LeagueTableEntry(this, awayTeamID, this._competition.getTeamByID(awayTeamID).getName());
      }

      if (match.isComplete()) {
        // Handle draws
        if (!match.isDraw()) {
          teamResults[match.getWinnerTeamID()].setWins(teamResults[match.getWinnerTeamID()].getWins() + 1);
          teamResults[match.getLoserTeamID()].setLosses(teamResults[match.getLoserTeamID()].getLosses() + 1);

          teamResults[match.getWinnerTeamID()].getH2H()[match.getLoserTeamID()] = (teamResults[match.getWinnerTeamID()].getH2H()[match.getLoserTeamID()] || 0) + 1;
          teamResults[match.getLoserTeamID()].getH2H()[match.getWinnerTeamID()] = (teamResults[match.getLoserTeamID()].getH2H()[match.getWinnerTeamID()] || 0) - 1;
        } else {
          if (!teamResults[homeTeamID].getH2H()[awayTeamID]) {
            teamResults[homeTeamID].getH2H()[awayTeamID] = 0;
          }
          if (!teamResults[awayTeamID].getH2H()[homeTeamID]) {
            teamResults[awayTeamID].getH2H()[homeTeamID] = 0;
          }
        }

        teamResults[homeTeamID].setPlayed(teamResults[homeTeamID].getPlayed() + 1);
        teamResults[awayTeamID].setPlayed(teamResults[awayTeamID].getPlayed() + 1);

        if (this.#table.hasSets()) {
          let homeTeamSets = 0;
          let awayTeamSets = 0;
          for (let i = 0; i < match.getHomeTeam().getScores().length; i++) {
            if (match.getHomeTeam().getScores()[i] < this._sets.getMinPoints() && match.getAwayTeam().getScores()[i] < this._sets.getMinPoints()) {
              continue
            }
            teamResults[homeTeamID].setPF(teamResults[homeTeamID].getPF() + match.getHomeTeam().getScores()[i]);
            teamResults[homeTeamID].setPA(teamResults[homeTeamID].getPA() + match.getAwayTeam().getScores()[i]);

            teamResults[awayTeamID].setPF(teamResults[awayTeamID].getPF() + match.getAwayTeam().getScores()[i]);
            teamResults[awayTeamID].setPA(teamResults[awayTeamID].getPA() + match.getHomeTeam().getScores()[i]);

            if (match.getHomeTeam().getScores()[i] > match.getAwayTeam().getScores()[i]) {
              homeTeamSets++;
            } else if (match.getHomeTeam().getScores()[i] < match.getAwayTeam().getScores()[i]) {
              awayTeamSets++;
            }
          }
          teamResults[homeTeamID].setSF(teamResults[homeTeamID].getSF() + homeTeamSets);
          teamResults[homeTeamID].setSA(teamResults[homeTeamID].getSA() + awayTeamSets);
          teamResults[awayTeamID].setSF(teamResults[awayTeamID].getSF() + awayTeamSets);
          teamResults[awayTeamID].setSA(teamResults[awayTeamID].getSA() + homeTeamSets);

          teamResults[homeTeamID].setPTS(teamResults[homeTeamID].getPTS() + (this._leagueConfig.getPoints().getPerSet() * homeTeamSets));
          teamResults[awayTeamID].setPTS(teamResults[awayTeamID].getPTS() + (this._leagueConfig.getPoints().getPerSet() * awayTeamSets));
          if (match.isDraw()) {
            teamResults[homeTeamID].setDraws(teamResults[homeTeamID].getDraws() + 1);
            teamResults[awayTeamID].setDraws(teamResults[awayTeamID].getDraws() + 1);
          } else {
            if (Math.abs(homeTeamSets - awayTeamSets) === 1) {
              teamResults[match.getWinnerTeamID()].setPTS(teamResults[match.getWinnerTeamID()].getPTS() + this._leagueConfig.getPoints().getWinByOne());
              teamResults[match.getLoserTeamID()].setPTS(teamResults[match.getLoserTeamID()].getPTS() + this._leagueConfig.getPoints().getLoseByOne());
            } else {
              teamResults[match.getWinnerTeamID()].setPTS(teamResults[match.getWinnerTeamID()].getPTS() + this._leagueConfig.getPoints().getWin());
              teamResults[match.getLoserTeamID()].setPTS(teamResults[match.getLoserTeamID()].getPTS() + this._leagueConfig.getPoints().getLose());
            }
          }
        } else {
          teamResults[homeTeamID].setPF(teamResults[homeTeamID].getPF() + match.getHomeTeam().getScores()[0]);
          teamResults[homeTeamID].setPA(teamResults[homeTeamID].getPA() + match.getAwayTeam().getScores()[0]);

          teamResults[awayTeamID].setPF(teamResults[awayTeamID].getPF() + match.getAwayTeam().getScores()[0]);
          teamResults[awayTeamID].setPA(teamResults[awayTeamID].getPA() + match.getHomeTeam().getScores()[0]);
          if (match.isDraw()) {
            teamResults[homeTeamID].setDraws(teamResults[homeTeamID].getDraws() + 1);
            teamResults[awayTeamID].setDraws(teamResults[awayTeamID].getDraws() + 1);
          } else {
            teamResults[match.getWinnerTeamID()].setPTS(teamResults[match.getWinnerTeamID()].getPTS() + this._leagueConfig.getPoints().getWin());
            teamResults[match.getLoserTeamID()].setPTS(teamResults[match.getLoserTeamID()].getPTS() + this._leagueConfig.getPoints().getLose());
          }
        }

        if (match.getHomeTeam().getForfeit()) {
          teamResults[homeTeamID].setPTS(teamResults[homeTeamID].getPTS() - this._leagueConfig.getPoints().getForfeit());
        }
        if (match.getAwayTeam().getForfeit()) {
          teamResults[awayTeamID].setPTS(teamResults[awayTeamID].getPTS() - this._leagueConfig.getPoints().getForfeit());
        }
        teamResults[homeTeamID].setBP(teamResults[homeTeamID].getBP() + match.getHomeTeam().getBonusPoints());
        teamResults[homeTeamID].setPP(teamResults[homeTeamID].getPP() + match.getHomeTeam().getPenaltyPoints());

        teamResults[awayTeamID].setBP(teamResults[awayTeamID].getBP() + match.getAwayTeam().getBonusPoints());
        teamResults[awayTeamID].setPP(teamResults[awayTeamID].getPP() + match.getAwayTeam().getPenaltyPoints());
      }
    });

    Object.values(teamResults).forEach(teamLine => {
      teamLine.setPD(teamLine.getPF() - teamLine.getPA());
      teamLine.setSD(teamLine.getSF() - teamLine.getSA());
      teamLine.setPTS(teamLine.getPTS() + (teamLine.getPlayed() * this._leagueConfig.getPoints().getPlayed()) + teamLine.getBP() - teamLine.getPP());
      this.#table.entries.push(teamLine);
    });

    this.#table.entries.sort((a, b) => this.#sortLeagueTable(a, b));
  }

  /**
   * Sorts the league table entries based on the configured ordering.
   *
   * @param {LeagueTableEntry} a The first league table entry to compare
   * @param {LeagueTableEntry} b The second league table entry to compare
   * @returns {number} Returns an integer less than, equal to, or greater than zero if the first argument is considered to be respectively less than, equal to, or greater than the second.
   */
  #sortLeagueTable (a, b) {
    const ordering = this._leagueConfig.getOrdering();
    for (let i = 0; i < ordering.length; i++) {
      let compareResult = 0;
      switch (ordering[i]) {
        case 'PTS':
          compareResult = League.#compareLeaguePoints(a, b);
          break
        case 'WINS':
          compareResult = League.#compareWins(a, b);
          break
        case 'LOSSES':
          compareResult = League.#compareLosses(a, b);
          break
        case 'H2H':
          compareResult = League.#compareHeadToHead(a, b);
          break
        case 'PF':
          compareResult = League.#comparePointsFor(a, b);
          break
        case 'PA':
          compareResult = League.#comparePointsAgainst(a, b);
          break
        case 'PD':
          compareResult = League.#comparePointsDifference(a, b);
          break
        case 'SF':
          compareResult = League.#compareSetsFor(a, b);
          break
        case 'SA':
          compareResult = League.#compareSetsAgainst(a, b);
          break
        case 'SD':
          compareResult = League.#compareSetsDifference(a, b);
          break
        case 'BP':
          compareResult = League.#compareBonusPoints(a, b);
          break
        case 'PP':
          compareResult = League.#comparePenaltyPoints(a, b);
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
    this.processMatches();
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
  getTeamByID (type, entity) {
    if (type === 'league') {
      this.processMatches();
      if (!this.isComplete()) {
        throw new Error('Cannot get the team in a league position on an incomplete league')
      }
      if (parseInt(entity) > this.#table.entries.length) {
        throw new Error('Invalid League position: position is bigger than the number of teams')
      }
      return this._competition.getTeamByID(this.#table.entries[parseInt(entity) - 1].getTeamID())
    }

    const match = this.getMatchByID(type);

    switch (entity) {
      case 'winner':
        return this._competition.getTeamByID(match.getWinnerTeamID())
      case 'loser':
        return this._competition.getTeamByID(match.getLoserTeamID())
      default:
        throw new Error(`Invalid entity "${entity}" in team reference`)
    }
  }
}

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

    this.#competition = competition;
    this.#id = stageID;
    this.#name = null;
    this.#notes = null;
    this.#description = null;
    this.#groups = [];
    this.#ifUnknown = null;
    this.#allMatches = null;
    this.#groupLookup = {};
    this.#teamStgGrpLookup = null;
  }

  /**
   * Load stage data from an object.
   *
   * @param {object} stageData The stage data
   * @returns {Stage} The updated Stage object
   */
  loadFromData (stageData) {
    if (Object.hasOwn(stageData, 'name')) {
      this.setName(stageData.name);
    }

    if (Object.hasOwn(stageData, 'notes')) {
      this.setNotes(stageData.notes);
    }

    if (Object.hasOwn(stageData, 'description')) {
      this.setDescription(stageData.description);
    }

    stageData.groups.forEach(groupData => {
      let group;
      switch (groupData.type) {
        case 'crossover':
          group = new Crossover(this, groupData.id, groupData.matchType === 'continuous' ? MatchType.CONTINUOUS : MatchType.SETS);
          break
        case 'knockout':
          group = new Knockout(this, groupData.id, groupData.matchType === 'continuous' ? MatchType.CONTINUOUS : MatchType.SETS);
          break
        case 'league':
          group = new League(this, groupData.id, groupData.matchType === 'continuous' ? MatchType.CONTINUOUS : MatchType.SETS, groupData.drawsAllowed);
          break
      }
      this.addGroup(group);
      group.loadFromData(groupData);
    });

    if (stageData.ifUnknown !== undefined) {
      this.setIfUnknown(new IfUnknown(this, stageData.ifUnknown.description)).loadFromData(stageData.ifUnknown);
    }

    this.#checkMatches();

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
    };

    if (this.#name !== null) {
      stage.name = this.#name;
    }

    if (this.#notes !== null) {
      stage.notes = this.#notes;
    }

    if (this.#description !== null) {
      stage.description = this.#description;
    }

    stage.groups = [];
    this.#groups.forEach(group => {
      stage.groups.push(group.serialize());
    });

    if (this.#ifUnknown !== null) {
      stage.ifUnknown = this.#ifUnknown.serialize();
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
    this.#groups.push(group);
    this.#groupLookup[group.getID()] = group;
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
    this.#name = name;
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
    this.#notes = notes;
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
    this.#description = description;
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
    this.#ifUnknown = ifUnknown;
    return ifUnknown
  }

  /**
   * Check if matches in groups of the same stage contain duplicate teams.
   *
   * @throws {Error} If duplicate teams are found in groups of the same stage
   */
  #checkMatches () {
    for (let i = 0; i < this.#groups.length - 1; i++) {
      const thisGroupsTeamIDs = this.#groups[i].getTeamIDs(Competition$1.VBC_TEAMS_PLAYING);
      for (let j = i + 1; j < this.#groups.length; j++) {
        const thatGroupsTeamIDs = this.#groups[j].getTeamIDs(Competition$1.VBC_TEAMS_PLAYING);
        const intersectingIDs = thisGroupsTeamIDs.filter(id => thatGroupsTeamIDs.includes(id));
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
  getTeamIDs (flags = Competition$1.VBC_TEAMS_FIXED_ID) {
    let teamIDs = [];

    this.#groups.forEach(group => {
      teamIDs = teamIDs.concat(group.getTeamIDs(flags));
    });

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

    this.#allMatches = [];
    this.#groups.forEach(group => {
      this.#allMatches = this.#allMatches.concat(group.getMatches());
    });
    this.#allMatches.sort((a, b) => {
      // Both GroupBreak and GroupMatch may have "start" and may have "date", or may have neither
      const aDate = a.getDate() === null ? '2023-02-12' : a.getDate();
      const bDate = b.getDate() === null ? '2023-02-12' : b.getDate();
      const aStart = a.getStart() === null ? '10:00' : a.getStart();
      const bStart = b.getStart() === null ? '10:00' : b.getStart();

      return `${aDate}${aStart}`.localeCompare(`${bDate}${bStart}`)
    });

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
    let matches = [];

    this.#groups.forEach(group => {
      if (group.teamHasMatches(teamID)) {
        matches = matches.concat(group.getMatches(teamID, flags));
      } else if (flags & Competition$1.VBC_MATCH_OFFICIATING && group.teamHasOfficiating(teamID)) {
        matches = matches.concat(group.getMatches(teamID, Competition$1.VBC_MATCH_OFFICIATING));
      }
    });

    matches.sort((a, b) => {
      // Both GroupBreak and GroupMatch may have "start" and may have "date", or may have neither
      const aDate = a.getDate() === null ? '2023-02-12' : a.getDate();
      const bDate = b.getDate() === null ? '2023-02-12' : b.getDate();
      const aStart = a.getStart() === null ? '10:00' : a.getStart();
      const bStart = b.getStart() === null ? '10:00' : b.getStart();

      return `${aDate}${aStart}`.localeCompare(`${bDate}${bStart}`)
    });

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
      this.#teamStgGrpLookup = {};
      this.#groups.forEach(group => {
        group.getMatches().forEach(match => {
          if (match instanceof GroupMatch && this.#competition.getTeamByID(teamID).getID() !== CompetitionTeam.UNKNOWN_TEAM_ID) {
            const homeTeamParts = match.getHomeTeam().getID().substr(1).split(':', 3);
            if (homeTeamParts.length > 2) {
              const key = `${homeTeamParts[0]}:${homeTeamParts[1]}`;
              if (!Object.hasOwn(this.#teamStgGrpLookup, key)) {
                this.#teamStgGrpLookup[key] = {
                  stage: homeTeamParts[0],
                  group: homeTeamParts[1]
                };
              }
            }

            const awayTeamParts = match.getAwayTeam().getID().substr(1).split(':', 3);
            if (awayTeamParts.length > 2) {
              const key = `${awayTeamParts[0]}:${awayTeamParts[1]}`;
              if (!Object.hasOwn(this.#teamStgGrpLookup, key)) {
                this.#teamStgGrpLookup[key] = {
                  stage: awayTeamParts[0],
                  group: awayTeamParts[1]
                };
              }
            }

            if (match.getOfficials() !== null && match.getOfficials().isTeam()) {
              const refereeTeamParts = match.getOfficials().getTeamID().substr(1).split(':', 3);
              if (refereeTeamParts.length > 2) {
                const key = `${refereeTeamParts[0]}:${refereeTeamParts[1]}`;
                if (!Object.hasOwn(this.#teamStgGrpLookup, key)) {
                  this.#teamStgGrpLookup[key] = {
                    stage: refereeTeamParts[0],
                    group: refereeTeamParts[1]
                  };
                }
              }
            }
          }
        });
      });
    }

    // Look up each reference to see if it leads back to this team
    const teamStgGrpLookupValues = Object.values(this.#teamStgGrpLookup);
    for (let i = 0; i < teamStgGrpLookupValues.length; i++) {
      const group = this.#competition.getStageByID(teamStgGrpLookupValues[i].stage).getGroupByID(teamStgGrpLookupValues[i].group);
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
  getMatchDates (teamID = null, flags = Competition$1.VBC_MATCH_PLAYING) {
    let matchDates = [];
    this.#groups.forEach(group => {
      const groupMatchDates = group.getMatchDates(teamID, flags);
      matchDates = matchDates.concat(groupMatchDates);
    });
    matchDates.sort();
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
  getMatchesOnDate (date, teamID = null, flags = Competition$1.VBC_MATCH_ALL) {
    let matches = [];
    this.#groups.forEach(group => {
      const groupMatches = group.getMatchesOnDate(date, teamID, flags);
      matches = matches.concat(groupMatches);
    });
    matches.sort((a, b) => {
      // matches may have "start" or may not
      const aStart = a.getStart() === null ? '10:00' : a.getStart();
      const bStart = b.getStart() === null ? '10:00' : b.getStart();

      return `${aStart}`.localeCompare(`${bStart}`)
    });
    return matches
  }
}

/**
 * The Ajv schema validator
 * @type {Ajv}
 * @private
 */
let validator = null;

/**
 * Perform schema validation on the JSON data
 *
 * @param {object} competitionData The object representation of the parsed JSON data
 *
 * @throws Error An exception containing a list of schema validation errors
 */
async function validateJSON (competitionData) {
  if (validator === null) {
    const ajv = new Ajv();
    addFormats(ajv);
    validator = ajv.compile(n);
  }

  if (!validator(competitionData)) {
    let errors = '';
    validator.errors.forEach(e => {
      errors += `[${e.schemaPath}] [${e.instancePath}] ${e.message}\n`;
    });
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

    this.#name = name;
    this.#version = '1.0.0';
    this.#metadata = [];
    this.#notes = null;
    this.#clubs = [];
    this.#teams = [];
    this.#stages = [];
    this.#teamLookup = {};
    this.#stageLookup = {};
    this.#clubLookup = {};

    this.#unknownTeam = new CompetitionTeam(this, CompetitionTeam.UNKNOWN_TEAM_ID, CompetitionTeam.UNKNOWN_TEAM_NAME);
  }

  /**
   * Loads a Competition object from competition JSON data
   *
   * @param {string} competitionJSON The competition JSON data
   *
   * @return {Promise<Competition>} a loaded Competition, rejects when the JSON data is invalid
   */
  static async loadFromCompetitionJSON (competitionJSON) {
    let competitionData;
    try {
      competitionData = JSON.parse(competitionJSON);
    } catch (_) {
      throw new Error('Document does not contain valid JSON')
    }

    if (typeof competitionData.version === 'string') {
      // This supports only version 1.0.0 (and all documents without an explicit version are assumed to be at version 1.0.0)
      if (competitionData.version !== '1.0.0') {
        throw new Error(`Document version ${competitionData.version} not supported`)
      }
    } else {
      competitionData.version = '1.0.0';
    }

    await validateJSON(competitionData);

    const competition = new Competition(competitionData.name);
    competition.setVersion(competitionData.version);

    if (Array.isArray(competitionData.metadata)) {
      competitionData.metadata.forEach(kv => {
        competition.setMetadataByID(kv.key, kv.value);
      });
    }

    if (typeof competitionData.notes === 'string') {
      competition.setNotes(competitionData.notes);
    }

    if (Array.isArray(competitionData.clubs)) {
      competitionData.clubs.forEach(clubData => {
        competition.addClub(new Club(competition, clubData.id, clubData.name).loadFromData(clubData));
      });
    }

    competitionData.teams.forEach(teamData => {
      competition.addTeam(new CompetitionTeam(competition, teamData.id, teamData.name).loadFromData(teamData));
    });

    competitionData.stages.forEach(stageData => {
      const stage = new Stage(competition, stageData.id);
      competition.addStage(stage);
      stage.loadFromData(stageData);
    });

    return competition
  }

  /**
   * Return the competition definition in a form suitable for serializing
   *
   * @return {object} The competition as an object suitable for serializing into JSON
   */
  serialize () {
    const competition = {
      version: this.#version
    };

    if (this.#metadata.length > 0) {
      competition.metadata = this.#metadata;
    }

    competition.name = this.#name;

    if (this.#notes !== null) {
      competition.notes = this.#notes;
    }

    if (this.#clubs.length > 0) {
      competition.clubs = [];
      this.#clubs.forEach(club => {
        competition.clubs.push(club.serialize());
      });
    }

    competition.teams = [];
    this.#teams.forEach(team => {
      competition.teams.push(team.serialize());
    });

    competition.stages = [];
    this.#stages.forEach(stage => {
      competition.stages.push(stage.serialize());
    });

    return competition
  }

  /**
   * Process matches for all stages in the competition
   */
  #processMatches () {
    this.#stages.forEach(stage => {
      stage.getGroups().forEach(group => {
        if (!group.isProcessed()) {
          group.processMatches();
        }
      });
    });
  }

  /**
   * Get the schema version for this competition, as a semver string
   *
   * @return {string} the schema version
   */
  getVersion () {
    return this.#version
  }

  /**
   * Set the competition version
   *
   * @param {string} version the version for the competition data
   *
   * @return {Competition} the competition
   */
  setVersion (version) {
    this.#version = version;
    return this
  }

  /**
   * Get the name for this competition
   *
   * @return {string} the competition name
   */
  getName () {
    return this.#name
  }

  /**
   * Set the competition Name
   *
   * @param {string} name the new name for the competition
   *
   * @return {Competition} the competition
   */
  setName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid competition name: must be between 1 and 1000 characters long')
    }
    this.#name = name;
    return this
  }

  /**
   * Add metadata to the competition.
   *
   * This function adds metadata to the competition using the provided key-value pair.
   *
   * @param {string} key The key of the metadata
   * @param {string} value The value of the metadata
   * @return {Competition} Returns the current Competition instance for method chaining
   * @throws {Error} If the key or value is invalid
   */
  setMetadataByID (key, value) {
    if (key.length > 100 || key.length < 1) {
      throw new Error('Invalid metadata key: must be between 1 and 100 characters long')
    }

    if (value.length > 1000 || value.length < 1) {
      throw new Error('Invalid metadata value: must be between 1 and 1000 characters long')
    }

    for (let i = 0; i < this.#metadata.length; i++) {
      if (this.#metadata[i].key === key) {
        this.#metadata[i].value = value;
        return this
      }
    }

    const kv = { key, value };
    this.#metadata.push(kv);
    return this
  }

  /**
   * Check if the competition has metadata with the given key.
   *
   * This function checks if the competition has metadata with the specified key.
   *
   * @param {string} key The key to check
   * @return {bool} Returns true if the metadata value exists, false otherwise
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
   * @return {bool} Returns true if the metadata exists, false otherwise
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
   * @return {string|null} Returns the value of the metadata if found, otherwise null
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
   * @return {array|null} Returns the metadata array or null if no metadata is defined
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
   * @return {Competition} Returns the current Competition instance for method chaining
   */
  deleteMetadataByKey (key) {
    this.#metadata = this.#metadata.filter(el => el.key !== key);
    return this
  }

  /**
   * Get the notes for this competition
   *
   * @return {string|null} the notes for this competition
   */
  getNotes () {
    return this.#notes
  }

  /**
   * Set the notes for this competition
   *
   * @param {string|null} notes the notes for this competition
   *
   * @return {Competition} the competition
   */
  setNotes (notes) {
    if (notes.length < 1) {
      throw new Error('Invalid competition notes: must be at least 1 character long')
    }
    this.#notes = notes;
    return this
  }

  /**
   * Add a new team to the competition
   *
   * @param {CompetitionTeam} team The team to add to the competition
   *
   * @throws {Error} If the input parameters are invalid or if a team with the requested ID already exists
   *
   * @return {Competition} This competition
   */
  addTeam (team) {
    if (team.getCompetition() !== this) {
      throw new Error('Team was initialised with a different Competition')
    }
    if (this.hasTeamWithID(team.getID())) {
      return this
    }
    this.#teams.push(team);
    this.#teamLookup[team.getID()] = team;
    return this
  }

  /**
   * Get the teams in this competition
   *
   * @return {array} The teams in this competition
   */
  getTeams () {
    return this.#teams
  }

  /**
   * Gets the Team for the given team ID
   *
   * @param {string} teamID The team ID to look up. This may be a pure ID, a reference, or a ternary
   *
   * @return {CompetitionTeam} The team
   */
  getTeamByID (teamID) {
    this.#processMatches();

    if (!teamID.startsWith('{')) {
      if (Object.hasOwn(this.#teamLookup, teamID)) {
        return this.#teamLookup[teamID]
      }
    }

    /*
     * Check for ternaries like {teamID1}=={teamID2}?{teamIDTrue}:{teamIDFalse}
     * Note that we only allow one level of ternary, i.e. this does not resolve:
     *  { {ta}=={tb}?{tTrue}:{tFalse} }=={T2}?{TTrue}:{TFalse}
     */
    const lrMatches = teamID.match(/^([^=]*)==([^?]*)\?(.*)/);
    if (lrMatches !== null) {
      const leftTeam = this.getTeamByID(lrMatches[1]);
      const rightTeam = this.getTeamByID(lrMatches[2]);
      let trueTeam = null;

      let tfMatches;
      let falseTeam;
      if ((tfMatches = lrMatches[3].match(/^({[^}]*}):(.*)/)) !== null) {
        trueTeam = this.getTeamByID(tfMatches[1]);
        falseTeam = this.getTeamByID(tfMatches[2]);
      } else if ((tfMatches = lrMatches[3].match(/^([^:]*):(.*)/)) !== null) {
        trueTeam = this.getTeamByID(tfMatches[1]);
        falseTeam = this.getTeamByID(tfMatches[2]);
      }

      if (trueTeam !== null) {
        return leftTeam === rightTeam ? trueTeam : falseTeam
      }
    }

    const teamRefParts = teamID.match(/^{([^:]*):([^:]*):([^:]*):([^:]*)}/);
    if (teamRefParts !== null) {
      try {
        return this.getStageByID(teamRefParts[1]).getGroupByID(teamRefParts[2]).getTeamByID(teamRefParts[3], teamRefParts[4])
      } catch (_) {
        return this.#unknownTeam
      }
    }

    return this.#unknownTeam
  }

  /**
   * Check if a team with the given ID exists in the competition
   *
   * @param {string} teamID The ID of the team to check
   *
   * @return {bool} True if the team exists, false otherwise
   */
  hasTeamWithID (teamID) {
    return Object.hasOwn(this.#teamLookup, teamID)
  }

  /**
   * Delete a team from the competition
   *
   * @param {string} teamID The ID of the team to delete
   *
   * @return {Competition} This competition
   */
  deleteTeam (teamID) {
    if (!this.hasTeamWithID(teamID)) {
      return this
    }

    let teamMatches = [];
    this.#stages.forEach(stage => {
      const stageMatches = stage.getMatches(teamID, Competition.VBC_MATCH_PLAYING | Competition.VBC_MATCH_OFFICIATING);
      teamMatches = teamMatches.concat(stageMatches);
    });

    if (teamMatches.length > 0) {
      const collapseMatches = m => `{${m.getGroup().getStage().getID()}:${m.getGroup().getID()}:${m.getID()}}`;
      throw new Error(`Team still has matches with IDs: ${teamMatches.map(collapseMatches).join(', ')}`)
    }

    // Also remove team from any club's list
    this.#clubs.forEach(club => {
      club.deleteTeam(teamID);
    });

    // Then delete the team
    delete this.#teamLookup[teamID];
    this.#teams = this.#teams.filter(team => team.getID() !== teamID);

    return this
  }

  /**
   * Add a new stage to the competition
   *
   * @param {Stage} stage The stage to add to the competition
   *
   * @throws {Error} If a stage with the requested ID already exists
   *
   * @return {Competition} This competition
   */
  addStage (stage) {
    if (stage.getCompetition() !== this) {
      throw new Error('Stage was initialised with a different Competition')
    }
    this.#stages.push(stage);
    this.#stageLookup[stage.getID()] = stage;
    return this
  }

  /**
   * Get the stages in this competition
   *
   * @return array The stages in this competition
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
   * @return {Stage} The requested stage
   */
  getStageByID (id) {
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
   * @return {bool} True if the stage exists, false otherwise
   */
  hasStageWithID (id) {
    return Object.hasOwn(this.#stageLookup, id)
  }

  /**
   * Delete a stage from the competition
   *
   * @param {string} stageID The ID of the stage to delete
   *
   * @return {Competition} This competition
   */
  deleteStage (stageID) {
    let stageFound = false;
    this.#stages.forEach(stage => {
      if (stageFound) {
        stage.getGroups().forEach(group => {
          group.getMatches().forEach(match => {
            let teamReferences = [];
            teamReferences = teamReferences.concat(this.#stripTeamReferences(match.getHomeTeam().getID()));
            teamReferences = teamReferences.concat(this.#stripTeamReferences(match.getAwayTeam().getID()));

            const officials = match.getOfficials();
            if (officials !== null && officials.isTeam()) {
              teamReferences = teamReferences.concat(this.#stripTeamReferences(match.getOfficials().getTeamID()));
            }

            teamReferences.forEach(reference => {
              let parts;
              if ((parts = reference.match(/^{([^:]*):.*}/)) !== null) {
                if (parts[1] === stageID) {
                  throw new Error(`Cannot delete stage with id "${stageID}" as it is referenced in match {${stage.getID()}:${group.getID()}:${match.getID()}}`)
                }
              }
            });
          });
        });
      } else if (stage.getID() === stageID) {
        stageFound = true;
      }
    });

    if (!stageFound) {
      return this
    }

    delete this.#stageLookup[stageID];
    this.#stages = this.#stages.filter(el => el.getID() === stageID);

    return this
  }

  /**
   * Add a new club to the competition
   *
   * @param {Club} club The club to add to the competition
   *
   * @throws {Error} If the input parameters are invalid or if a club with the requested ID already exists
   *
   * @return {Competition} This competition
   */
  addClub (club) {
    if (club.getCompetition() !== this) {
      throw new Error('Club was initialised with a different Competition')
    }
    this.#clubs.push(club);
    this.#clubLookup[club.getID()] = club;
    return this
  }

  /**
   * Get the clubs in this competition
   *
   * @return {array} The clubs in this competition
   */
  getClubs () {
    return this.#clubs
  }

  /**
   * Returns the Club with the requested ID, or throws if the ID is not found
   *
   * @param {string} clubID The ID of the club to return
   *
   * @throws {Error} When no club with the provided ID is found
   *
   * @return {Club} The requested club
   */
  getClubByID (clubID) {
    if (!Object.hasOwn(this.#clubLookup, clubID)) {
      throw new Error(`Club with ID "${clubID}" not found`)
    }
    return this.#clubLookup[clubID]
  }

  /**
   * Check if a club with the given ID exists in the competition
   *
   * @param {string} clubID The ID of the club to check
   *
   * @return {bool} True if the club exists, false otherwise
   */
  hasClubWithID (clubID) {
    return Object.hasOwn(this.#clubLookup, clubID)
  }

  /**
   * Delete a club from the competition
   *
   * @param {string} clubID The ID of the club to delete
   *
   * @return {Competition} This competition
   */
  deleteClub (clubID) {
    if (!this.hasClubWithID(clubID)) {
      return this
    }

    const club = this.getClubByID(clubID);
    const teamsInClub = club.getTeams();
    if (teamsInClub.length > 0) {
      throw new Error(`Club still contains teams with IDs: ${teamsInClub.map(t => `{${t.getID()}}`).join(', ')}`)
    }

    delete this.#clubLookup[clubID];
    this.#clubs = this.#clubs.filter(club => club.getID() !== clubID);

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
    let lrMatches;

    // If it looks like a team ID
    if (!teamID.startsWith('{')) {
      try {
        this.#validateTeamExists(teamID);
      } catch (_) {
        throw new Error(`Invalid team ID for ${field} in match with ID "${matchID}"`)
      }
      // If it looks like a ternary
    } else if ((lrMatches = teamID.match(/^([^=]*)==([^?]*)\?(.*)/)) !== null) {
      // Check the "left" part is a team reference
      try {
        this.#validateTeamReference(lrMatches[1]);
      } catch (_) {
        throw new Error(`Invalid ternary left part reference for ${field} in match with ID "${matchID}": "${lrMatches[1]}"`)
      }

      // Check the "right" part is a team reference
      try {
        this.#validateTeamReference(lrMatches[2]);
      } catch (_) {
        throw new Error(`Invalid ternary right part reference for ${field} in match with ID "${matchID}": "${lrMatches[2]}"`)
      }

      let tfMatches;
      if ((tfMatches = lrMatches[3].match(/^({[^}]*}):(.*)/)) !== null) {
        // If "true" team is a reference...
        try {
          this.#validateTeamReference(tfMatches[1]);
        } catch (_) {
          throw new Error(`Invalid ternary true team reference for ${field} in match with ID "${matchID}": "${tfMatches[1]}"`)
        }

        try {
          if (!tfMatches[2].startsWith('{')) {
            this.#validateTeamExists(tfMatches[2]);
          } else {
            this.#validateTeamReference(tfMatches[2]);
          }
        } catch (_) {
          throw new Error(`Invalid ternary false team reference for ${field} in match with ID "${matchID}": "${tfMatches[2]}"`)
        }
      } else if ((tfMatches = lrMatches[3].match(/^([^:]*):(.*)/)) !== null) {
        try {
          this.#validateTeamExists(tfMatches[1]);
        } catch (_) {
          throw new Error(`Invalid ternary true team reference for ${field} in match with ID "${matchID}": "${tfMatches[1]}"`)
        }

        try {
          if (!tfMatches[2].startsWith('{')) {
            this.#validateTeamExists(tfMatches[2]);
          } else {
            this.#validateTeamReference(tfMatches[2]);
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
      this.#validateTeamReference(teamID);
    }
  }

  /**
   * Takes in an exact, resolved team ID and checks that the team exists
   *
   * @param {string} teamID The team ID to check. This must be a resolved team ID, not a team reference or a ternary
   *
   * @throws {Error} An exception if the team does not exist
   */
  #validateTeamExists (teamID) {
    if (!this.hasTeamID(teamID)) {
      throw new Error(`Team with ID "${teamID}" does not exist`)
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
    let parts;
    if ((parts = teamRef.match(/^{([^:]*):([^:]*):([^:]*):(.*)}/)) !== null) {
      let stage;
      let group;

      try {
        stage = this.getStageByID(parts[1]);
      } catch (_) {
        throw new Error(`Invalid Stage part: Stage with ID "${parts[1]}" does not exist`)
      }

      try {
        group = stage.getGroupByID(parts[2]);
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
          const teamsInGroup = group.getTeamIDs(Competition.VBC_TEAMS_KNOWN);
          if (teamsInGroup.length < parseInt(parts[4])) {
            throw new Error('Invalid League position: position is bigger than the number of teams')
          }
        }
      } else {
        try {
          group.getMatchByID(parts[3]);
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
   * @return {Array<string>} An array containing unique team references extracted from the input string.
   */
  #stripTeamReferences (teamReference) {
    let references = [];
    let lrMatches;
    if (!teamReference.startsWith('{')) {
      return []
    } else if ((lrMatches = teamReference.match(/^([^=]*)==([^?]*)\?(.*)/)) !== null) {
      references = references.concat(this.#stripTeamReferences(lrMatches[1]));
      references = references.concat(this.#stripTeamReferences(lrMatches[2]));
      let tfMatches;
      if ((tfMatches = lrMatches[3].match(/^({[^}]*}):(.*)/)) !== null) {
        references = references.concat(this.#stripTeamReferences(tfMatches[1]));
        references = references.concat(this.#stripTeamReferences(tfMatches[2]));
      }
    } else {
      references.push(teamReference);
    }

    return [...new Set(references)]
  }

  /**
   * Checks whether the given team ID is in the list of teams for this competition
   *
   * @param {string} teamID The team ID (or a team reference) to look up
   *
   * @return {bool} Whether a team with the given ID exists
   */
  hasTeamID (teamID) {
    return Object.hasOwn(this.#teamLookup, teamID)
  }

  /**
   * Check whether all stages are complete, i.e. all matches in all stages have results
   * and the competition results can be fully calculated
   *
   * @return {bool} Whether the competition is complete or not
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

var Competition$1 = Competition;

exports.Club = Club;
exports.Competition = Competition$1;
exports.CompetitionTeam = CompetitionTeam;
exports.Contact = Contact;
exports.ContactRole = ContactRole;
exports.Crossover = Crossover;
exports.Group = Group$1;
exports.GroupBreak = GroupBreak;
exports.GroupMatch = GroupMatch;
exports.GroupType = GroupType;
exports.IfUnknown = IfUnknown;
exports.IfUnknownBreak = IfUnknownBreak;
exports.IfUnknownMatch = IfUnknownMatch;
exports.Knockout = Knockout;
exports.KnockoutConfig = KnockoutConfig;
exports.League = League;
exports.LeagueConfig = LeagueConfig;
exports.LeagueConfigPoints = LeagueConfigPoints;
exports.LeagueTable = LeagueTable;
exports.LeagueTableEntry = LeagueTableEntry;
exports.MatchManager = MatchManager;
exports.MatchOfficials = MatchOfficials$1;
exports.MatchTeam = MatchTeam;
exports.MatchType = MatchType;
exports.Player = Player;
exports.SetConfig = SetConfig;
exports.Stage = Stage;
