import test from 'node:test'
import assert from 'node:assert/strict'
import { makeItem, resolveCatch, isCaught, difficulties } from './game.js'
import { createRhythmNote, getRhythmLevelForNote, judgeRhythmNote, rhythmLevels, totalRhythmNotes } from './rhythmGame.js'
test('candy, star and five-catch combo have correct scores', () => {
  assert.deepEqual(resolveCatch(0,0,'candy'),{score:10,combo:1,delta:10})
  assert.deepEqual(resolveCatch(40,4,'star'),{score:100,combo:5,delta:60})
  assert.equal(resolveCatch(500,40,'star').delta,120)
})
test('cloud resets the combo and cannot make score negative', () => {
  assert.deepEqual(resolveCatch(20,7,'cloud'),{score:0,combo:0,delta:-30})
  assert.equal(resolveCatch(100,7,'cloud').score,70)
})
test('collision requires crossing the basket and being in horizontal range', () => {
  assert.equal(isCaught({x:50,y:83},50,81),true)
  assert.equal(isCaught({x:62,y:83},50,81),false)
  assert.equal(isCaught({x:50,y:80},50,79),false)
  assert.equal(isCaught({x:50,y:88},50,85),false)
})
test('objects stay inside the playfield and hard mode is more demanding', () => {
  for (const value of [0,0.19,0.4,0.73,0.9999]) {
    const item = makeItem(1,'normal',()=>value)
    assert.ok(item.x>=7 && item.x<=93)
  }
  assert.equal(makeItem(1,'normal',()=>0.1).type,'cloud')
  assert.equal(makeItem(1,'normal',()=>0.5).type,'candy')
  assert.equal(makeItem(1,'normal',()=>0.9).type,'star')
  assert.ok(difficulties.hard.speed>difficulties.normal.speed)
  assert.ok(difficulties.hard.interval<difficulties.normal.interval)
})
test('rhythm game progresses through three escalating difficulties with deterministic lane patterns', () => {
  assert.equal(rhythmLevels.length, 3)
  assert.equal(totalRhythmNotes, 30)
  assert.deepEqual(rhythmLevels.map(level => level.speedLabel), ['舒緩', '流暢', '光速'])
  assert.ok(rhythmLevels.every(level => level.intervalMs >= 880 && level.travelMs >= 2800))
  assert.ok(rhythmLevels[0].intervalMs > rhythmLevels[1].intervalMs)
  assert.ok(rhythmLevels[1].intervalMs > rhythmLevels[2].intervalMs)
  for (let index = 0; index < totalRhythmNotes; index += 1) {
    const note = createRhythmNote(index + 1, index, 1000)
    assert.ok(note.lane >= 0 && note.lane <= 3)
    assert.equal(note.levelIndex, getRhythmLevelForNote(index).levelIndex)
  }

  const lightSpeedNote = createRhythmNote(99, 0, 1000, 2)
  assert.equal(lightSpeedNote.levelIndex, 2)
  assert.equal(lightSpeedNote.travelMs, rhythmLevels[2].travelMs)
})
test('rhythm judgment respects each stages generous hit window', () => {
  const note = createRhythmNote(1, 0, 1000)
  assert.deepEqual(judgeRhythmNote(note, 1000 + note.hitAtMs), { distance: 0, hittable: true, perfect: true })
  assert.equal(judgeRhythmNote(note, 1000 + note.hitAtMs + note.perfectWindowMs + 1).perfect, false)
  assert.equal(judgeRhythmNote(note, 1000 + note.hitAtMs + note.hitWindowMs + 1).hittable, false)
})
