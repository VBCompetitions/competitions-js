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
    this.#maxSets = 5
    this.#setsToWin = 3
    this.#clearPoints = 2
    this.#minPoints = 1
    this.#pointsToWin = 25
    this.#lastSetPointsToWin = 15
    this.#maxPoints = 1000
    this.#lastSetMaxPoints = 1000
    this.#group = group
  }

  /**
   * Load set configuration data from an object.
   *
   * @param {Object} setData The set configuration data
   * @return {SetConfig} The updated SetConfig object
   */
  loadFromData (setData) {
    if (Object.hasOwn(setData, 'maxSets')) {
      this.setMaxSets(setData.maxSets)
    }

    if (Object.hasOwn(setData, 'setsToWin')) {
      this.setSetsToWin(setData.setsToWin)
    }

    if (Object.hasOwn(setData, 'clearPoints')) {
      this.setClearPoints(setData.clearPoints)
    }

    if (Object.hasOwn(setData, 'minPoints')) {
      this.setMinPoints(setData.minPoints)
    }

    if (Object.hasOwn(setData, 'pointsToWin')) {
      this.setPointsToWin(setData.pointsToWin)
    }

    if (Object.hasOwn(setData, 'lastSetPointsToWin')) {
      this.setLastSetPointsToWin(setData.lastSetPointsToWin)
    }

    if (Object.hasOwn(setData, 'maxPoints')) {
      this.setMaxPoints(setData.maxPoints)
    }

    if (Object.hasOwn(setData, 'lastSetMaxPoints')) {
      this.setLastSetMaxPoints(setData.lastSetMaxPoints)
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
    this.#maxSets = maxSets
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
    this.#setsToWin = setsToWin
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
    this.#clearPoints = clearPoints
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
    this.#minPoints = minPoints
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
    this.#pointsToWin = pointsToWin
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
    this.#lastSetPointsToWin = lastSetPointsToWin
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
    this.#maxPoints = maxPoints
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
    this.#lastSetMaxPoints = lastSetMaxPoints
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

export default SetConfig
