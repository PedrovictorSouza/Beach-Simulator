# Sandbots System Architecture Notes

This is a living document for implementation patterns that are already present in
the game. It should explain how systems work before future changes expand them.

## Pattern: Update Method + Explicit State

Source: `app/session/chopperNpcActor.js`

The Chopper NPC is an actor updated once per gameplay frame. This follows the
Update Method pattern from Game Programming Patterns: the actor owns the small
piece of time-based behavior it needs, and the game loop calls it with
`deltaTime`.

The actor now also names one primary behavior mode before executing movement:

- `scripted-flight`: a requested cinematic hop or approach is in progress.
- `dialogue`: Chopper is listening and should hover in place.
- `investigate`: Chopper moves to a temporary mission-relevant target.
- `guide`: Chopper leads the player toward a specific point.
- `patrol`: Chopper roams the early gameplay area.
- `idle`: no movement behavior should run.

This is a small State pattern layer. The state name exists to make behavior
observable, testable, and easier to extend without adding more nested conditionals.

Rules for this actor:

- Resolve the behavior mode before executing movement.
- Run at most one primary movement behavior per frame.
- Keep cinematic requests explicit through `startChopperNpcFlight`.
- Keep visual sync at the end of the update so body, propeller, hover, and turn
  pose reflect the final logical position for the frame.
- Do not put render, camera, quest, or input decisions inside the actor update.

Future NPC work should follow the same shape when the bot has per-frame behavior:

1. Store small actor-local state.
2. Resolve a named behavior mode from current game state.
3. Execute only that behavior.
4. Sync presentation after logic.
5. Add a focused test for the behavior mode and visible result.
