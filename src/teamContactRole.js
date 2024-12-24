class TeamContactRole {
  static TREASURER = 'treasurer'
  static SECRETARY = 'secretary'
  static MANAGER = 'manager'
  static CAPTAIN = 'captain'
  static COACH = 'coach'
  static ASSISTANT_COACH = 'assistantCoach'
  static MEDIC = 'medic'

  static _validRoles = [
    this.TREASURER,
    this.SECRETARY,
    this.MANAGER,
    this.CAPTAIN,
    this.COACH,
    this.ASSISTANT_COACH,
    this.MEDIC
  ]
}

export default TeamContactRole
