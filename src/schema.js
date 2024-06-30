var e={d:(t,i)=>{for(var n in i)e.o(i,n)&&!e.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:i[n]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},t={};e.d(t,{f:()=>i});const i=JSON.parse('{"$schema":"http://json-schema.org/draft-07/schema#","$id":"https://github.com/monkeysppp/VBCompetitions-schema/tree/1.0.0","title":"Definition of a competition in VolleyTourney","description":"This document contains the teams, the competition structure, the matches and the results of a volleyball competition","type":"object","properties":{"version":{"description":"The version of schema that the document conforms to.  Defaults to 1.0.0","type":"string","default":"1.0.0","enum":["1.0.0"]},"metadata":{"description":"A list of key-value pairs representing metadata about the competition, where each key must be unique. This can be used for functionality such as associating a competition with a season, and searching for competitions with matching metadata","type":"array","minItems":1,"maxItems":1000,"items":{"description":"A key-value pair","type":"object","additionalProperties":false,"properties":{"key":{"description":"The key for a metadata entry","type":"string","minLength":1,"maxLength":100},"value":{"description":"The value for a metadata entry.  Note that this must be a string, so values such as \\"true\\", \\"false\\" or \\"null\\" must be represented as a string","type":"string","minLength":1,"maxLength":1000}},"required":["key","value"]}},"name":{"description":"A name for the competition","type":"string","minLength":1,"maxLength":10000},"notes":{"description":"Free form string to add notes about the competition.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1},"clubs":{"description":"A list of clubs that the teams are in","type":"array","items":{"description":"A club definition","type":"object","additionalProperties":false,"properties":{"id":{"description":"An ID for the club, e.g. \'CLUB1\'.  This must be unique within the competition.  It must contain only ASCII printable characters excluding \\" : { } ? =","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"name":{"description":"The name for the club","type":"string","minLength":1,"maxLength":1000},"notes":{"description":"Free form string to add notes about a club.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1}},"required":["id","name"]}},"teams":{"description":"The list of all teams in this competition","type":"array","items":{"description":"A team definition","type":"object","additionalProperties":false,"properties":{"id":{"description":"An ID for the team, e.g. \'TM1\'.  This is used in the rest of the instance document to specify the team so must be unique within the competition.  It must contain only ASCII printable characters excluding \\" : { } ? =","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"name":{"description":"The name for the team","type":"string","minLength":1,"maxLength":1000},"contacts":{"description":"A list of contact details for a team","type":"array","items":{"description":"A single contact for a team","type":"object","additionalProperties":false,"properties":{"id":{"description":"A unique ID for this contact, e.g. \'TM1Contact1\'.  This must be unique within the team.  It must contain only ASCII printable characters excluding \\" : { } ? =","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"name":{"description":"The name of this contact","type":"string","minLength":1,"maxLength":1000},"roles":{"description":"The roles of this contact within the team","type":"array","minItems":1,"uniqueItems":true,"items":{"description":"A role of this contact","type":"string","default":"secretary","enum":["secretary","treasurer","manager","captain","coach","assistantCoach","medic"]}},"emails":{"description":"The email addresses for this contact","type":"array","minItems":1,"uniqueItems":true,"items":{"description":"An email address for this contact","type":"string","format":"email","minLength":3}},"phones":{"description":"The telephone numbers for this contact","type":"array","minItems":1,"uniqueItems":true,"items":{"description":"A telephone number for this contact","type":"string","minLength":1,"maxLength":50}}},"required":["id","roles"]}},"club":{"description":"The ID of the club this team is in","type":"string","minLength":1,"maxLength":100},"notes":{"description":"Free form string to add notes about a team.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1}},"required":["id","name"]}},"players":{"description":"A list of players","type":"array","items":{"description":"A single player","type":"object","additionalProperties":false,"properties":{"id":{"description":"A unique ID for this player. This may be the player\'s registration number.  This must be unique within the competition.  It must contain only ASCII printable characters excluding \\" : { } ? =","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"name":{"description":"The name of this contact","type":"string","minLength":1,"maxLength":1000},"number":{"description":"The player\'s shirt number","type":"integer","minimum":1},"teams":{"description":"An ordered list of teams the player is/has been registered for in this competition, in the order that they have been registered (and therefore transferred in the case of more than one entry).  A player can only be registered with one team at any time within this competition, meaning that if there are multiple teams listed, either all but the last entry MUST have an \\"until\\" value, or there must be no \\"from\\" or \\"until\\" values in any entry","type":"array","items":{"description":"A Player\'s team registration entry, linking them to the specified team, potentially for the time period covered by \\"from\\" to \\"until\\"","type":"object","additionalProperties":false,"properties":{"id":{"description":"The team ID that the player is/was registered with","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"from":{"description":"The date from which the player is/was registered with this team.  When this is not present, there should not be any \\"from\\" or \\"until\\" values in any entry in this player\'s \\"teams\\" array","type":"string","format":"date"},"until":{"description":"The date up to which the player was registered with this team.  When a \\"from\\" date is specified and this is not, it should be taken that a player is still registered with this team","type":"string","format":"date"},"notes":{"description":"Free form string to add notes about this player\'s team entry.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1}},"required":["id"]}},"notes":{"description":"Free form string to add notes about the player.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1}},"required":["id","name"]}},"stages":{"description":"The stages of the competition.  Stages are phases of a competition that happen in order.  There may be only one stage (e.g. for a flat league) or multiple in sequence (e.g. for a tournament with pools, then crossovers, then finals)","type":"array","items":{"description":"A single competition stage","type":"object","additionalProperties":false,"properties":{"id":{"description":"A unique ID for this stage, e.g. \'LG\'.  It must contain only ASCII printable characters excluding \\" : { } ? =","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"name":{"description":"Descriptive title for the stage, e.g. \'Pools\'","type":"string","minLength":1,"maxLength":1000},"notes":{"description":"Free form string to add notes about this stage.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1},"description":{"description":"An array of string values as a verbose description of the nature of the stage, e.g. \'The first stage of the competition will consist of separate pools, where....\'","type":"array","items":{"description":"A part of the description of this stage","type":"string","minLength":1}},"groups":{"description":"The groups within a stage of the competition.  There may be only one group (e.g. for a flat league) or multiple in parallel (e.g. pool 1, pool 2)","type":"array","items":{"description":"A group within this stage of the competition","type":"object","additionalProperties":false,"properties":{"id":{"description":"A unique ID for this group, e.g. \'P1\'.  It must contain only ASCII printable characters excluding \\" : { } ? =","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"name":{"description":"Descriptive title for the group, e.g. \'Pool 1\'","type":"string","minLength":1,"maxLength":1000},"notes":{"description":"Free form string to add notes about this group.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1},"description":{"description":"An array of string values as a verbose description of the nature of the group, e.g. \'For the pool stage, teams will play each other once, with the top 2 teams going through to....\'","type":"array","items":{"description":"A part of the description of this stage","type":"string","minLength":1}},"type":{"description":"The type of competition applying to this group, which may dictate how the results are processed.  If this has the value \'league\' then the property \'league\' must be defined","type":"string","enum":["league","crossover","knockout"]},"knockout":{"description":"Configuration for the knockout group","type":"object","additionalProperties":false,"properties":{"standing":{"description":"Configuration for the knockout group","type":"array","items":{"description":"An ordered mapping from a position to a team ID","type":"object","additionalProperties":false,"properties":{"position":{"description":"The text description of the position, e.g. \\"1st\\", \\"2nd\\".  Having this field allows multiple teams to have the same \\"position\\", for example if there are no play-off games then two entries can have the value \\"3rd\\"","type":"string","minLength":1},"id":{"description":"The identifier for the team.  This must be a team reference (see the documentation), for example for the team in \\"1st\\", this would refer to the winner of the final in this stage->group","type":"string","minLength":1}},"required":["position","id"]},"minItems":1}},"required":["standing"]},"league":{"description":"Configuration for the league","type":"object","additionalProperties":false,"properties":{"ordering":{"description":"An array of parameters that define how the league positions are worked out, where the array position determines the precedence of that parameter, e.g. [ \\"PTS\\", \\"SD\\" ] means that league position is determined by league points, with ties decided by set difference.  Valid parameters are \'PTS\'=league points, \'WINS\'=wins, \'LOSSES\'=losses, \'H2H\'=head to head, PF\'=points for, \'PA\'=points against, \'PD\'=points difference, \'SF\'=sets for, \'SA\'=sets against, \'SD\'=set difference, \'BP\'=bonus points, \'PP\'=penalty points.  When comparing teams, a higher value for a parameter results in a higher league position except when comparing \'LOSSES\', \'PA\', \'SA\', and \'PP\' (where a lower value results in a higher league position).  Note that \'H2H\' only considers wins and losses between two teams; this means that, depending on whether draws are allowed or whether teams play each other multiple times, the head to head comparison may not be able to distinguish between two teams","type":"array","items":{"description":"A parameter that defines the league position","type":"string","enum":["PTS","WINS","LOSSES","H2H","PF","PA","PD","SF","SA","SD","BP","PP"]},"minItems":1},"points":{"description":"Properties defining how to calculate the league points based on match results","type":"object","additionalProperties":false,"properties":{"played":{"description":"Number of league points for playing the match.  Note that a forfeit counts as a \\"played\\" match, so if this has a non-zero value and the desire is for a forfeit to yield zero points then the \\"forfeit\\" value should be set to the same as this value","type":"integer","default":0},"perSet":{"description":"Number of league points for each set won","type":"integer","default":0},"win":{"description":"Number of league points for winning (by 2 sets or more if playing sets)","type":"integer","default":3},"winByOne":{"description":"Number of league points for winning by 1 set","type":"integer","default":0},"lose":{"description":"Number of league points for losing (by 2 sets or more if playing sets)","type":"integer","default":0},"loseByOne":{"description":"Number of league points for losing by 1 set","type":"integer","default":0},"forfeit":{"description":"Number of league penalty points for forfeiting a match.  This should be a positive number and will be subtracted from a team\'s league points for each forfeited match","type":"integer","default":0}}}},"required":["ordering","points"]},"matchType":{"description":"Are the matches played in sets or continuous points.  If this has the value \'sets\' then the property \'sets\' must be defined","type":"string","enum":["sets","continuous"]},"sets":{"description":"Configuration defining the nature of a set","type":"object","additionalProperties":false,"properties":{"maxSets":{"description":"The maximum number of sets that could be played, often known as \'best of\', e.g. if this has the value \'5\' then the match is played as \'best of 5 sets\'","type":"integer","default":5,"minimum":1},"setsToWin":{"description":"The number of sets that must be won to win the match.  This is usually one more than half the \'maxSets\', but may be needed if draws are allowed, e.g. if a competition dictates that exactly 2 sets must be played (by setting \'maxSets\' to \'2\') and that draws are allowed, then \'setsToWin\' should still be set to \'2\' to indicate that 2 sets are needed to win the match","type":"integer","default":3,"minimum":1},"clearPoints":{"description":"The number of points lead that the winning team must have, e.g. if this has the value \'2\' then teams must \'win by 2 clear points\'.  Note that if \'maxPoints\' has a value then that takes precedence, i.e. if \'maxPoints\' is set to \'35\' then a team can win \'35-34\' irrespective of the value of \'clearPoints\'","type":"integer","default":2,"minimum":1},"minPoints":{"description":"The minimum number of points that either team must score for a set to count as valid.  Usually only used for time-limited matches","type":"integer","default":1,"minimum":1},"pointsToWin":{"description":"The minimum number of points required to win all but the last set","type":"integer","default":25,"minimum":1},"lastSetPointsToWin":{"description":"The minimum number of points required to win the last set","type":"integer","default":15,"minimum":1},"maxPoints":{"description":"The upper limit of points that can be scored in a set","type":"integer","default":1000,"minimum":1},"lastSetMaxPoints":{"description":"The upper limit of points that can be scored in the last set","type":"integer","default":1000,"minimum":1}}},"drawsAllowed":{"description":"Sets whether drawn matches are allowed","default":false,"type":"boolean"},"matches":{"$ref":"#/$defs/matches"}},"allOf":[{"if":{"properties":{"type":{"const":"league"}},"required":["type"]},"then":{"required":["league"]}},{"if":{"properties":{"type":{"const":"crossover"}},"required":["type"]},"then":{"anyOf":[{"properties":{"drawsAllowed":{"enum":[false]}}},{"not":{"required":["drawsAllowed"]}}]}},{"if":{"properties":{"type":{"const":"knockout"}},"required":["type"]},"then":{"anyOf":[{"properties":{"drawsAllowed":{"enum":[false]}}},{"not":{"required":["drawsAllowed"]}}]}},{"if":{"properties":{"matchType":{"const":"continuous"}},"required":["matchType"]},"then":{"properties":{"matches":{"type":"array","items":{"type":"object","properties":{"homeTeam":{"type":"object","properties":{"scores":{"type":"array","maxItems":1}}},"awayTeam":{"type":"object","properties":{"scores":{"type":"array","maxItems":1}}}}}}},"allOf":[{"not":{"required":["sets"]}}]}},{"if":{"properties":{"matchType":{"const":"continuous"}},"required":["matchType"]},"then":{"allOf":[{"not":{"required":["sets"]}}]}},{"if":{"properties":{"matchType":{"const":"continuous"},"matches":{"type":"array","items":{"type":"object","properties":{"type":{"const":"match"}}}}},"required":["matchType"]},"then":{"properties":{"matches":{"type":"array","items":{"type":"object","required":["complete"]}}}}}],"required":["id","type","matchType","matches"]}},"ifUnknown":{"description":"It can be useful to still present something to the user about the later stages of a competition, even if the teams playing in that stage is not yet known.  This defines what should be presented in any application handling this competition\'s data in such cases","type":"object","additionalProperties":false,"properties":{"description":{"description":"An array of string values to be presented in the case that the teams in this stage are not yet known, typically as an explanation of what this stage will contain (e.g. \'The crossover games will be between the top two teams in each pool\')","type":"array","items":{"description":"A part of the description of this stage","type":"string","minLength":1}},"matches":{"$ref":"#/$defs/matches"}},"required":["description"]}},"required":["id","groups"]}}},"required":["name","teams","stages"],"$defs":{"team":{"description":"A team playing in the match","type":"object","additionalProperties":false,"properties":{"id":{"description":"The identifier for the team.  This can either be a team ID or a team reference (see the documentation)","type":"string","minLength":1,"maxLength":1000},"scores":{"description":"The array of set scores.  If the matchType is \'continuous\' then only the first value in the array is used","type":"array","items":{"description":"The set score","type":"integer","minimum":0}},"mvp":{"description":"This team\'s most valuable player award.  This can either be a name or a reference to a player ID.  A reference takes the form {PLAYER_ID}","type":"string","minLength":1},"forfeit":{"description":"Did this team forfeit the match","type":"boolean","default":false},"bonusPoints":{"description":"Does this team get any bonus points in the league.  This is separate from any league points calculated from the match result, and is added to their league points","type":"integer","default":0,"minimum":0},"penaltyPoints":{"description":"Does this team receive any penalty points in the league.  This is separate from any league points calculated from the match result, and is subtracted from their league points","type":"integer","default":0,"minimum":0},"notes":{"description":"Free form string to add notes about the team relating to this match.  This can be used for arbitrary content that various implementations can use","type":"string","minLength":1},"players":{"description":"The list of players from this team that played in this match.  This can be either a player\'s name or a reference to a player ID","type":"array","items":{"description":"Either the name of the player or a reference to a player ID.  A reference takes the form {PLAYER_ID}.  Not all entries need to be references, meaning that the document can allow a mix of registered players with a player ID, and unregistered players indicated just by name","type":"string","minLength":1}}},"required":["id","scores"]},"matches":{"description":"An array of matches (or breaks in play) in this group.  Note that a team ID and each unique team references can ony appear in one group, i.e. a team cannot play in multiple groups in a stage; if they did then those two groups would technically be the same group","type":"array","items":{"oneOf":[{"description":"A match between two teams","type":"object","additionalProperties":false,"properties":{"id":{"description":"An identifier for this match, i.e. a match number.  It must contain only ASCII printable characters excluding \\" : { } ? =","type":"string","minLength":1,"maxLength":100,"pattern":"^((?![\\":{}?=])[\\\\x20-\\\\x7F])+$"},"court":{"description":"The court that a match takes place on","type":"string","minLength":1,"maxLength":1000},"venue":{"description":"The venue that a match takes place at","type":"string","minLength":1,"maxLength":10000},"type":{"description":"The type of match, i.e. \'match\'","type":"string","enum":["match"]},"date":{"description":"The date of the match in the format YYYY-MM-DD","type":"string","format":"date"},"warmup":{"description":"The start time for the warmup in the format HH:mm using a 24 hour clock","type":"string","pattern":"^([0-1][0-9]|2[0-3]):[0-5][0-9]$"},"start":{"description":"The start time for the match in the format HH:mm using a 24 hour clock","type":"string","pattern":"^([0-1][0-9]|2[0-3]):[0-5][0-9]$"},"duration":{"description":"The maximum duration of the match in the format HH:mm","type":"string","pattern":"^[0-9]+:[0-5][0-9]$"},"complete":{"description":"Whether the match is complete.  This must be set when a match has a \\"duration\\" or when the matchType is \\"continuous\\".  What about a \\"continuous\\" match with no \\"duration\\" and a target score?  This can be represented by a \\"sets\\" match with \\"maxSets\\" = 1","type":"boolean"},"homeTeam":{"$ref":"#/$defs/team","description":"The \'home\' team for the match"},"awayTeam":{"$ref":"#/$defs/team","description":"The \'away\' team for the match"},"officials":{"oneOf":[{"description":"The officials for this match","type":"object","additionalProperties":false,"properties":{"team":{"description":"The team assigned to referee the match.  This can either be a team ID or a team reference","type":"string","minLength":1,"maxLength":1000}},"required":["team"]},{"description":"The officials for this match","type":"object","additionalProperties":false,"properties":{"first":{"description":"The first referee","type":"string","minLength":1},"second":{"description":"The second referee","type":"string","minLength":1},"challenge":{"description":"The challenge referee, responsible for resolving challenges from the teams","type":"string","minLength":1},"assistantChallenge":{"description":"The assistant challenge referee, who assists the challenge referee","type":"string","minLength":1},"reserve":{"description":"The reserve referee","type":"string","minLength":1},"scorer":{"description":"The scorer","type":"string","minLength":1},"assistantScorer":{"description":"The assistant scorer","type":"string","minLength":1},"linespersons":{"description":"The list of linespersons","type":"array","maxItems":4,"items":{"description":"A linesperson","type":"string","minLength":1}},"ballCrew":{"description":"The list of people in charge of managing the game balls","type":"array","maxItems":100,"items":{"description":"A ball person","type":"string","minLength":1}}},"required":["first"]}]},"mvp":{"description":"A most valuable player award for the match. This can either be a name or a reference to a player ID.  A reference takes the form {PLAYER_ID}","type":"string","minLength":1,"maxLength":203},"manager":{"oneOf":[{"description":"The court manager in charge of this match","type":"string","minLength":1,"maxLength":1000},{"description":"The court managers for this match","type":"object","additionalProperties":false,"properties":{"team":{"description":"The team assigned to manage the match.  This can either be a team ID or a team reference","type":"string","minLength":1,"maxLength":1000}},"required":["team"]}]},"friendly":{"description":"Whether the match is a friendly.  These matches do not contribute toward a league position.  If a team only participates in friendly matches then they are not included in the league table at all","type":"boolean","default":false},"notes":{"description":"Free form string to add notes about a match","type":"string","minLength":1}},"dependencies":{"duration":["complete"]},"required":["id","type","homeTeam","awayTeam"]},{"description":"A break in play, possibly while other matches are going on in other competitions running in parallel","type":"object","additionalProperties":false,"properties":{"type":{"description":"The type of match, i.e. \'break\'","type":"string","enum":["break"]},"start":{"description":"The start time for the break in the format HH:mm using a 24 hour clock","type":"string","pattern":"^([0-1][0-9]|2[0-3]):[0-5][0-9]$"},"date":{"description":"The date of the break in the format YYYY-MM-DD","type":"string","format":"date"},"duration":{"description":"The duration of the break","type":"string","pattern":"^[0-9]+:[0-5][0-9]$"},"name":{"description":"The name for the break, e.g. \'Lunch break\'","default":"Break","type":"string","minLength":1,"maxLength":1000}},"required":["type"]}]}}}}');var n=t.f;export{n as competitionSchema};