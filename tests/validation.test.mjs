import test, { describe } from 'node:test'
import assert from 'node:assert/strict'

const STATUS_TRANSITIONS = {
  Open: ['In Progress', 'Rejected'],
  'In Progress': ['Resolved', 'Rejected'],
  Resolved: ['Closed', 'In Progress'],
  Closed: ['In Progress'],
  Rejected: [],
}

function canTransitionTo(current, next) {
  return STATUS_TRANSITIONS[current]?.includes(next) ?? false
}

describe('Status Workflow State Machine Validation', () => {
  test('Open state transitions', () => {
    assert.equal(canTransitionTo('Open', 'In Progress'), true)
    assert.equal(canTransitionTo('Open', 'Rejected'), true)
    assert.equal(canTransitionTo('Open', 'Resolved'), false)
    assert.equal(canTransitionTo('Open', 'Closed'), false)
  })

  test('In Progress state transitions', () => {
    assert.equal(canTransitionTo('In Progress', 'Resolved'), true)
    assert.equal(canTransitionTo('In Progress', 'Rejected'), true)
    assert.equal(canTransitionTo('In Progress', 'Open'), false)
  })

  test('Resolved state transitions', () => {
    assert.equal(canTransitionTo('Resolved', 'Closed'), true)
    assert.equal(canTransitionTo('Resolved', 'In Progress'), true)
    assert.equal(canTransitionTo('Resolved', 'Rejected'), false)
  })

  test('Closed state transitions', () => {
    assert.equal(canTransitionTo('Closed', 'In Progress'), true)
    assert.equal(canTransitionTo('Closed', 'Open'), false)
  })

  test('Rejected state terminal behavior', () => {
    assert.equal(canTransitionTo('Rejected', 'Open'), false)
    assert.equal(canTransitionTo('Rejected', 'In Progress'), false)
  })
})
