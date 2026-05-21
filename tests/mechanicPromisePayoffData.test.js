import { describe, expect, it } from "vitest";
import {
  MECHANIC_PROMISE_PAYOFF_IDS,
  getMechanicPromisePayoffById,
  listMechanicPromisePayoffs,
  validateMechanicPromisePayoffMatrix
} from "../app/story/mechanicPromisePayoffData.js";

describe("mechanic promise/payoff data", () => {
  it("defines the current core mechanics in stable order", () => {
    expect(listMechanicPromisePayoffs().map((entry) => entry.id)).toEqual([
      MECHANIC_PROMISE_PAYOFF_IDS.BUILDER_CALLSIGN,
      MECHANIC_PROMISE_PAYOFF_IDS.HYDRO_JET,
      MECHANIC_PROMISE_PAYOFF_IDS.BIO_GROW,
      MECHANIC_PROMISE_PAYOFF_IDS.WORKBENCH,
      MECHANIC_PROMISE_PAYOFF_IDS.COLONY_TERMINAL,
      MECHANIC_PROMISE_PAYOFF_IDS.SOLAR_STATION,
      MECHANIC_PROMISE_PAYOFF_IDS.HOUSE_KIT
    ]);
    expect(Object.isFrozen(listMechanicPromisePayoffs())).toBe(true);
    expect(Object.isFrozen(listMechanicPromisePayoffs()[0])).toBe(true);
  });

  it("connects mechanics to player action, feedback, consequence and future dependency", () => {
    expect(getMechanicPromisePayoffById(MECHANIC_PROMISE_PAYOFF_IDS.BUILDER_CALLSIGN)).toMatchObject({
      playerAction: expect.stringContaining("confirm"),
      immediateFeedback: expect.stringContaining("logs"),
      futureDependency: expect.stringContaining("House")
    });
    expect(getMechanicPromisePayoffById(MECHANIC_PROMISE_PAYOFF_IDS.SOLAR_STATION)).toMatchObject({
      immediateFeedback: expect.stringContaining("blue cells"),
      systemConsequence: expect.stringContaining("House Kit")
    });
    expect(getMechanicPromisePayoffById(MECHANIC_PROMISE_PAYOFF_IDS.HYDRO_JET)).toMatchObject({
      futureDependency: expect.stringContaining("Bio-Grow")
    });
    expect(getMechanicPromisePayoffById(MECHANIC_PROMISE_PAYOFF_IDS.BIO_GROW)).toMatchObject({
      systemConsequence: expect.stringContaining("colony checks"),
      futureDependency: expect.stringContaining("colony viability")
    });
    expect(getMechanicPromisePayoffById(MECHANIC_PROMISE_PAYOFF_IDS.COLONY_TERMINAL)).toMatchObject({
      systemConsequence: expect.stringContaining("Colony checks")
    });
  });

  it("models the macro mechanical spine with explicit dependencies and unlocks", () => {
    expect(getMechanicPromisePayoffById(MECHANIC_PROMISE_PAYOFF_IDS.HYDRO_JET)).toMatchObject({
      macroRole: "water-restoration",
      requires: [MECHANIC_PROMISE_PAYOFF_IDS.BUILDER_CALLSIGN],
      opens: [MECHANIC_PROMISE_PAYOFF_IDS.BIO_GROW]
    });
    expect(getMechanicPromisePayoffById(MECHANIC_PROMISE_PAYOFF_IDS.BIO_GROW)).toMatchObject({
      macroRole: "soil-growth",
      requires: [MECHANIC_PROMISE_PAYOFF_IDS.HYDRO_JET],
      opens: expect.arrayContaining([
        MECHANIC_PROMISE_PAYOFF_IDS.WORKBENCH,
        MECHANIC_PROMISE_PAYOFF_IDS.COLONY_TERMINAL
      ])
    });
    expect(getMechanicPromisePayoffById(MECHANIC_PROMISE_PAYOFF_IDS.HOUSE_KIT)).toMatchObject({
      macroRole: "shelter",
      requires: [
        MECHANIC_PROMISE_PAYOFF_IDS.COLONY_TERMINAL,
        MECHANIC_PROMISE_PAYOFF_IDS.SOLAR_STATION
      ],
      opens: []
    });
  });

  it("validates missing ids, duplicates, missing fields and missing required mechanics", () => {
    expect(validateMechanicPromisePayoffMatrix()).toEqual([]);

    expect(validateMechanicPromisePayoffMatrix({
      requiredIds: ["alpha", "missing"],
      matrix: [
        {
          id: "alpha",
          label: "Alpha",
          macroRole: "phase",
          requires: [],
          opens: ["missing-link"],
          worldObject: "Object",
          playerAction: "Action",
          immediateFeedback: "Feedback",
          systemConsequence: "Consequence",
          narrativeMeaning: "Meaning",
          futureDependency: "Dependency"
        },
        {
          id: "alpha",
          label: "",
          macroRole: "phase",
          requires: ["missing-required"],
          opens: [],
          worldObject: "Object",
          playerAction: "Action",
          immediateFeedback: "Feedback",
          systemConsequence: "Consequence",
          narrativeMeaning: "Meaning",
          futureDependency: "Dependency"
        },
        {
          label: "No id"
        }
      ]
    })).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "duplicate-id", id: "alpha" }),
      expect.objectContaining({ type: "missing-id", index: 2 }),
      expect.objectContaining({ type: "missing-field", id: "alpha", field: "label" }),
      expect.objectContaining({ type: "missing-field", field: "worldObject" }),
      expect.objectContaining({ type: "missing-required-mechanic", id: "missing" }),
      expect.objectContaining({ type: "missing-opened-link", id: "alpha", openedId: "missing-link" }),
      expect.objectContaining({ type: "missing-required-link", id: "alpha", requiredId: "missing-required" })
    ]));
  });

  it("rejects macro links that point against the stable progression order", () => {
    expect(validateMechanicPromisePayoffMatrix({
      requiredIds: ["alpha", "beta"],
      matrix: [
        {
          id: "alpha",
          label: "Alpha",
          macroRole: "early",
          requires: ["beta"],
          opens: [],
          worldObject: "Object",
          playerAction: "Action",
          immediateFeedback: "Feedback",
          systemConsequence: "Consequence",
          narrativeMeaning: "Meaning",
          futureDependency: "Dependency"
        },
        {
          id: "beta",
          label: "Beta",
          macroRole: "late",
          requires: [],
          opens: ["alpha"],
          worldObject: "Object",
          playerAction: "Action",
          immediateFeedback: "Feedback",
          systemConsequence: "Consequence",
          narrativeMeaning: "Meaning",
          futureDependency: "Dependency"
        }
      ]
    })).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "future-required-link", id: "alpha", requiredId: "beta" }),
      expect.objectContaining({ type: "past-opened-link", id: "beta", openedId: "alpha" })
    ]));
  });
});
