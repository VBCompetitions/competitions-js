import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Competition } from '../../src/index.js'

describe('competition', () => {
    it('testCompetitionSaveCompetition', async () => {
        const competitionJSON = await readFile(new URL(path.join('competitions', 'competition.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert(Array.isArray(savedCompetition.getTeams()))
        const stage = savedCompetition.getStage('L')
        assert.equal(stage.getName(), 'league')
        assert.equal(savedCompetition.getTeam('{L:RL:RLM14:winner}').getID(), 'TM6')
    })

    it('testCompetitionSaveWithNewName', async () => {
        const competitionJSON = await readFile(new URL(path.join('competitions', 'competition.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert(Array.isArray(savedCompetition.getTeams()))
        const stage = savedCompetition.getStage('L')
        assert.equal(stage.getName(), 'league')
        assert.equal(savedCompetition.getTeam('{L:RL:RLM14:winner}').getID(), 'TM6')
        assert.equal(savedCompetition.getName(), 'Saved Competition')
        assert.equal(competition.getTeam('TM1').getNotes(), savedCompetition.getTeam('TM1').getNotes())
    })

    it('testCompetitionSaveWithDates', async () =>  {
        const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-league-full-data.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert(Array.isArray(savedCompetition.getTeams()))
        const stage = savedCompetition.getStage('L')
        assert.equal(stage.getName(), 'league')
        assert.equal(savedCompetition.getTeam('{L:RL:RLM4:winner}').getID(), 'TM2')
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
        assert.equal(savedCompetition.getPlayer('P1').getName(), 'Alice Alison')
        assert.equal(savedCompetition.getPlayer('P1').getNotes(), 'junior')
        assert.equal(savedCompetition.getPlayer('P3').getName(), 'Charlie Charleston')
        assert.equal(savedCompetition.getPlayer('P3').getNumber(), 7)

        assert.equal(savedCompetition.getPlayer('P7').getNumber(), null)
        assert.equal(savedCompetition.getPlayer('P7').getNotes(), null)
    })

    it('testCompetitionSaveCompetitionKnockoutSets', async () => {
        const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-knockout-sets.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(competition.getTeam('{KO:CUP:FIN:winner}').getID(), 'TM7')
        assert.equal(savedCompetition.getTeam('{KO:CUP:FIN:winner}').getID(), 'TM7')
    })

    it('testCompetitionSaveCompetitionKnockoutSetsStandings', async () => {
        const competitionJSON = await readFile(new URL(path.join('competitions', 'competition-knockout-sets-standings.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(competition.getTeam('{KO:CUP:FIN:winner}').getID(), 'TM7')
        assert.equal(savedCompetition.getTeam('{KO:CUP:FIN:winner}').getID(), 'TM7')
    })

    it('testCompetitionSaveCompetitionWithIfUnknown', async () => {
        const competitionJSON = await readFile(new URL(path.join('ifunknown', 'incomplete-group-multi-stage.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize(), null, 2)
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(competition.getStage('F').getIfUnknown().getDescription()[0], 'There will be a knockout stage')
        assert.equal(savedCompetition.getStage('F').getIfUnknown().getDescription()[0], 'There will be a knockout stage')
    })

    it('testCompetitionSaveCompetitionWithClubs', async () => {
        const competitionJSON = await readFile(new URL(path.join('club', 'competition-with-clubs.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(competition.getClub('SOU').getName(), 'Southampton')
        assert.equal(savedCompetition.getClub('SOU').getName(), 'Southampton')

        assert(Array.isArray(savedCompetition.getClub('SOU').getTeams()))
        assert.equal(savedCompetition.getClub('SOU').getTeams().length, 3)
    })

    it('testCompetitionSaveMatchWithManagerTeam', async () => {
        const competitionJSON = await readFile(new URL(path.join('manager', 'manager-team.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(savedCompetition.getStage('L').getGroup('LG').getMatch('LG1').getManager().getTeamID(), 'TM1')
    })

    it('testCompetitionSaveMatchWithManagerPlayer', async () => {
        const competitionJSON = await readFile(new URL(path.join('manager', 'manager-person.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(savedCompetition.getStage('L').getGroup('LG').getMatch('LG1').getManager().getManagerName(), 'Some Manager')
    })

    it('testCompetitionSaveMatchWitOfficialsPeople', async () => {
        const competitionJSON = await readFile(new URL(path.join('officials', 'officials-persons.json'), import.meta.url), { encoding: 'utf8' })
        const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
        competition.setName('Saved Competition')
        const serializedData = JSON.stringify(competition.serialize())
        const savedCompetition = await Competition.loadFromCompetitionJSON(serializedData)
        assert.equal(savedCompetition.getStage('L').getGroup('LG').getMatch('LG1').getOfficials().getFirstRef(), 'A First')
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
