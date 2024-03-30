import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Competition, Crossover, MatchType, SetConfig, Stage } from '../../src/index.js'

describe('setConfig', () => {
    it('testSetConfig', async () => {
        const dummyCompetition = new Competition('dummy for score update')
        const dummyStage = new Stage(dummyCompetition, 'S')
        const dummyGroup = new Crossover(dummyStage, 'G', MatchType.SETS)
        const config = new SetConfig(dummyGroup)
        config.loadFromData(JSON.parse('{"maxSets": 3, "setsToWin": 1, "clearPoints": 2, "minPoints": 1, "pointsToWin": 21, "lastSetPointsToWin": 12, "maxPoints": 50, "lastSetMaxPoints": 30}'))

        assert.equal(config.getMaxSets(), 3)
        assert.equal(config.getSetsToWin(), 1)
        assert.equal(config.getClearPoints(), 2)
        assert.equal(config.getMinPoints(), 1)
        assert.equal(config.getPointsToWin(), 21)
        assert.equal(config.getLastSetPointsToWin(), 12)
        assert.equal(config.getMaxPoints(), 50)
        assert.equal(config.getLastSetMaxPoints(), 30)
    })

    it('testSetConfigEmpty', async () => {
        const dummyCompetition = new Competition('dummy for score update')
        const dummyStage = new Stage(dummyCompetition, 'S')
        const dummyGroup = new Crossover(dummyStage, 'G', MatchType.SETS)
        const config = new SetConfig(dummyGroup)
        config.loadFromData({})

        assert.equal(config.getGroup(), dummyGroup)
        assert.equal(config.getMaxSets(), 5)
        assert.equal(config.getSetsToWin(), 3)
        assert.equal(config.getClearPoints(), 2)
        assert.equal(config.getMinPoints(), 1)
        assert.equal(config.getPointsToWin(), 25)
        assert.equal(config.getLastSetPointsToWin(), 15)
        assert.equal(config.getMaxPoints(), 1000)
        assert.equal(config.getLastSetMaxPoints(), 1000)
    })
})
