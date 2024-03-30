import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { Club, Competition, CompetitionTeam, GroupMatch, League, LeagueConfig, LeagueConfigPoints, MatchOfficials, MatchTeam, MatchType, Stage } from '../../src/index.js'

describe('competition', () => {
    it('testCompetitionSaveCompetition', async () => {
        const competitionJSON = await readFile(new URL(path.join('competitions', 'competition.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert(Array.isArray(savedCompetition.getTeams()))
        const stage = savedCompetition.getStageByID('L')
        assert.equal(stage.getName(), 'league')
        assert.equal(savedCompetition.getTeamByID('{L:RL:RLM14:winner}').getID(), 'TM6')
    })

    it('testCompetitionSaveWithNewName', async () => {
        const competitionJSON = await readFile(new URL(path.join('competitions', 'competition.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert(Array.isArray(savedCompetition.getTeams()))
        const stage = savedCompetition.getStageByID('L')
        assert.equal(stage.getName(), 'league')
        assert.equal(savedCompetition.getTeamByID('{L:RL:RLM14:winner}').getID(), 'TM6')
        assert.equal(savedCompetition.getName(), 'Saved Competition')
        assert.equal(competition.getTeamByID('TM1').getNotes(), savedCompetition.getTeamByID('TM1').getNotes())
    })

    it('testCompetitionSaveWithDates', async () =>  {
        const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-league-full-data.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert(Array.isArray(savedCompetition.getTeams()))
        const stage = savedCompetition.getStageByID('L')
        assert.equal(stage.getName(), 'league')
        assert.equal(savedCompetition.getTeamByID('{L:RL:RLM4:winner}').getID(), 'TM2')
        assert.equal(savedCompetition.getName(), 'Saved Competition')
    })

    it('testCompetitionSaveCompetitionWithNotes', async () =>  {
        const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-with-notes.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(competition.getNotes(), 'This is a note')
        assert.equal(savedCompetition.getNotes(), 'This is a note')
    })

    it('testCompetitionSaveCompetitionWithoutNotes', async () => {
        const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-without-notes.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(competition.getNotes(), null)
        assert.equal(savedCompetition.getNotes(), null)
    })

    it('testCompetitionSaveCompetitionWithPlayers', async () => {
        const competitionJSON = await readFile(new URL(path.join('players', 'players.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        let team = savedCompetition.getTeamByID('TM3')
        assert.equal(team.getPlayerByID('P1').getName(), 'Alice Alison')
        assert.equal(team.getPlayerByID('P1').getNotes(), 'junior')
        assert.equal(team.getPlayerByID('P3').getName(), 'Charlie Charleston')
        assert.equal(team.getPlayerByID('P3').getNumber(), 7)

        team = competition.getTeamByID('TM2')
        assert.equal(team.getPlayerByID('P1').getNumber(), null)
        assert.equal(team.getPlayerByID('P1').getNotes(), null)
    })

    it('testCompetitionSaveCompetitionKnockoutSets', async () => {
        const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-knockout-sets.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(competition.getTeamByID('{KO:CUP:FIN:winner}').getID(), 'TM7')
        assert.equal(savedCompetition.getTeamByID('{KO:CUP:FIN:winner}').getID(), 'TM7')
    })

    it('testCompetitionSaveCompetitionKnockoutSetsStandings', async () => {
        const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-knockout-sets-standings.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(competition.getTeamByID('{KO:CUP:FIN:winner}').getID(), 'TM7')
        assert.equal(savedCompetition.getTeamByID('{KO:CUP:FIN:winner}').getID(), 'TM7')
    })

    it('testCompetitionSaveCompetitionWithIfUnknown', async () => {
        const competitionJSON = await readFile(new URL(path.join('ifunknown', 'incomplete-group-multi-stage.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize(), null, 2)
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(competition.getStageByID('F').getIfUnknown().getDescription()[0], 'There will be a knockout stage')
        assert.equal(savedCompetition.getStageByID('F').getIfUnknown().getDescription()[0], 'There will be a knockout stage')
    })

    it('testCompetitionSaveCompetitionWithClubs', async () => {
        const competitionJSON = await readFile(new URL(path.join('club', 'competition-with-clubs.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(competition.getClubByID('SOU').getName(), 'Southampton')
        assert.equal(savedCompetition.getClubByID('SOU').getName(), 'Southampton')

        assert(Array.isArray(savedCompetition.getClubByID('SOU').getTeams()))
        assert.equal(savedCompetition.getClubByID('SOU').getTeams().length, 3)
    })

    it('testCompetitionSaveMatchWithManagerTeam', async () => {
        const competitionJSON = await readFile(new URL(path.join('manager', 'manager-team.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(savedCompetition.getStageByID('L').getGroupByID('LG').getMatchByID('LG1').getManager().getTeamID(), 'TM1')
    })

    it('testCompetitionSaveMatchWithManagerPlayer', async () => {
        const competitionJSON = await readFile(new URL(path.join('manager', 'manager-person.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(savedCompetition.getStageByID('L').getGroupByID('LG').getMatchByID('LG1').getManager().getManagerName(), 'Some Manager')
    })

    it('testCompetitionSaveMatchWitOfficialsPeople', async () => {
        const competitionJSON = await readFile(new URL(path.join('officials', 'officials-persons.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(savedCompetition.getStageByID('L').getGroupByID('LG').getMatchByID('LG1').getOfficials().getFirstRef(), 'A First')
    })

    it('testCompetitionSaveCompetitionWithMetadata', async () => {
        const competitionJSON = await readFile(new URL(path.join('metadata', 'competition-metadata-season-2324.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(savedCompetition.getMetadataByKey('season'), '2023-2024')
    })
})
