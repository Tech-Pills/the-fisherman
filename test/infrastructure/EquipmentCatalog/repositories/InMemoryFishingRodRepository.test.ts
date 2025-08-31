import { describe, expect, it } from "@effect/vitest"
import { Effect, Either, Schema } from "effect"

import { FishingRod } from "../../../../src/domain/EquipmentCatalog/entities/FishingRodEntity.js"
import {
  FishingRodRepository,
  InMemoryFishingRodRepository,
  makeFishingRodRepository
} from "../../../../src/infrastructure/EquipmentCatalog/repositories/InMemoryFishingRodRepository.js"

import { RodAction } from "../../../../src/domain/EquipmentCatalog/valueObjects/Rod/RodActionVo.js"
import { RodLength } from "../../../../src/domain/EquipmentCatalog/valueObjects/Rod/RodLengthVo.js"
import { RodPower } from "../../../../src/domain/EquipmentCatalog/valueObjects/Rod/RodPowerVo.js"
import { RodType } from "../../../../src/domain/EquipmentCatalog/valueObjects/Rod/RodTypeVo.js"
import { EquipmentId } from "../../../../src/domain/EquipmentCatalog/valueObjects/shared/EquipmentIdVo.js"
import { ManufacturerInfo } from "../../../../src/domain/EquipmentCatalog/valueObjects/shared/ManufacturerInfoVo.js"

describe("InMemoryFishingRodRepository", () => {
  const createTestRod = () => {
    const manufacturer = new ManufacturerInfo({
      name: "Test Rods Inc",
      countryOfOrigin: "USA",
      website: "https://testrods.com"
    })

    const power = new RodPower({
      name: "Ultra Light",
      powerRating: 1,
      minLineTest: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("TestStrength")))(2),
      maxLineTest: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("TestStrength")))(6),
      minLureWeight: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("LureWeight")))(0.5),
      maxLureWeight: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("LureWeight")))(3)
    })

    const action = new RodAction({
      name: "Moderate",
      flexPoint: "middle"
    })

    const length = Schema.decodeSync(RodLength)(7)

    const rodType = new RodType({
      name: "Spinning",
      compatibleReelTypes: ["Spinning Reel"],
      guideOrientation: "topside"
    })

    return Effect.runSync(
      FishingRod.create({
        id: Schema.decodeSync(EquipmentId)("test-rod-001"),
        manufacturer,
        modelName: "Test Rod",
        partNumber: "TR-001",
        power,
        action,
        length,
        rodType,
        pieces: 2,
        materialComposition: "Graphite"
      })
    )
  }

  it("saves and retrieves a fishing rod using Effect generator function", () => {
    const program = Effect.gen(function* () {
      const repository = yield* makeFishingRodRepository
      const testRod = createTestRod()

      yield* repository.save(testRod)
      const retrievedRod = yield* repository.findById(testRod.id)

      return { saved: testRod, retrieved: retrievedRod }
    })

    const result = Effect.runSync(program)

    expect(result.saved.id).toBe(result.retrieved.id)
    expect(result.saved.modelName).toBe(result.retrieved.modelName)
    expect(result.saved.power).toBe(result.retrieved.power)
  })

  it("fails to find non-existent rod using Effect generator function", () => {
    const program = Effect.gen(function* () {
      const repository = yield* makeFishingRodRepository
      const nonExistentId = Schema.decodeSync(EquipmentId)("non-existent")

      return yield* repository.findById(nonExistentId)
    })

    const result = Effect.runSync(Effect.either(program))

    expect(Either.isLeft(result)).toBe(true)
    if (Either.isLeft(result)) {
      expect(result.left._tag).toBe("EquipmentNotFoundError")
      expect(result.left.equipmentId).toBe("non-existent")
    }
  })

  // falar mais sobre injeção de dependência em proximos arttigos
  it("works with Layer-based dependency injection", () => {
    const program = Effect.gen(function* () {
      const repository = yield* FishingRodRepository
      const testRod = createTestRod()

      yield* repository.save(testRod)
      return yield* repository.findById(testRod.id)
    })

    const result = Effect.runSync(program.pipe(Effect.provide(InMemoryFishingRodRepository)))

    expect(result.modelName).toBe("Test Rod")
    expect(result.partNumber).toBe("TR-001")
  })
})
