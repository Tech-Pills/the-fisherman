import { describe, expect, it } from "@effect/vitest"
import { Effect, Either, Schema } from "effect"

import { FishingRod } from "../../../../src/domain/EquipmentCatalog/entities/FishingRodEntity.js"

import { EquipmentId } from "../../../../src/domain/EquipmentCatalog/valueObjects/shared/EquipmentIdVo.js"
import { ManufacturerInfo } from "../../../../src/domain/EquipmentCatalog/valueObjects/shared/ManufacturerInfoVo.js"

import { RodAction } from "../../../../src/domain/EquipmentCatalog/valueObjects/Rod/RodActionVo.js"
import { RodLength } from "../../../../src/domain/EquipmentCatalog/valueObjects/Rod/RodLengthVo.js"
import { RodPower } from "../../../../src/domain/EquipmentCatalog/valueObjects/Rod/RodPowerVo.js"
import { RodType } from "../../../../src/domain/EquipmentCatalog/valueObjects/Rod/RodTypeVo.js"

describe("FishingRod", () => {
  const validManufacturer = new ManufacturerInfo({
    name: "Test Rods Inc",
    countryOfOrigin: "USA",
    website: "https://testrods.com"
  })

  const ultraLightPower = new RodPower({
    name: "Ultra Light",
    powerRating: 1,
    minLineTest: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("TestStrength")))(2),
    maxLineTest: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("TestStrength")))(6),
    minLureWeight: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("LureWeight")))(0.5),
    maxLureWeight: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("LureWeight")))(3)
  })

  const heavyPower = new RodPower({
    name: "Heavy",
    powerRating: 8,
    minLineTest: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("TestStrength")))(15),
    maxLineTest: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("TestStrength")))(25),
    minLureWeight: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("LureWeight")))(0.75),
    maxLureWeight: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("LureWeight")))(3)
  })

  const fastAction = new RodAction({
    name: "Fast",
    flexPoint: "tip"
  })

  const slowAction = new RodAction({
    name: "Slow",
    flexPoint: "throughout"
  })

  const moderateAction = new RodAction({
    name: "Moderate",
    flexPoint: "middle"
  })

  const rodLength = Schema.decodeSync(RodLength)(7)

  const rodType = new RodType({
    name: "Spinning",
    compatibleReelTypes: ["Spinning Reel", "Baitcasting Reel"],
    guideOrientation: "topside"
  })

  describe("valid combinations", () => {
    it("creates rod with compatible ultra-light power and moderate action", () => {
      const result = Effect.runSync(
        Effect.either(
          FishingRod.create({
            id: Schema.decodeSync(EquipmentId)("rod-001"),
            manufacturer: validManufacturer,
            modelName: "Test Rod",
            partNumber: "TR-001",
            power: ultraLightPower,
            action: moderateAction,
            length: rodLength,
            rodType,
            pieces: 2,
            materialComposition: "Graphite"
          })
        )
      )

      expect(Either.isRight(result)).toBe(true)
      if (Either.isRight(result)) {
        expect(result.right.power).toBe(ultraLightPower)
        expect(result.right.action).toBe(moderateAction)
      }
    })

    it("creates rod with compatible heavy power and moderate action", () => {
      const result = Effect.runSync(
        Effect.either(
          FishingRod.create({
            id: Schema.decodeSync(EquipmentId)("rod-002"),
            manufacturer: validManufacturer,
            modelName: "Heavy Rod",
            partNumber: "HR-001",
            power: heavyPower,
            action: moderateAction,
            length: rodLength,
            rodType,
            pieces: 1,
            materialComposition: "Fiberglass"
          })
        )
      )

      expect(Either.isRight(result)).toBe(true)
      if (Either.isRight(result)) {
        expect(result.right.power).toBe(heavyPower)
        expect(result.right.action).toBe(moderateAction)
      }
    })
  })

  describe("create method", () => {
    it("sets catalogAddedDate, lastModified to current date and version to 1", () => {
      const beforeCreate = new Date()
      const result = Effect.runSync(
        FishingRod.create({
          id: Schema.decodeSync(EquipmentId)("rod-create-001"),
          manufacturer: validManufacturer,
          modelName: "Create Test Rod",
          partNumber: "CTR-001",
          power: ultraLightPower,
          action: moderateAction,
          length: rodLength,
          rodType,
          pieces: 2,
          materialComposition: "Graphite"
        })
      )
      const afterCreate = new Date()

      expect(result.catalogAddedDate.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
      expect(result.catalogAddedDate.getTime()).toBeLessThanOrEqual(afterCreate.getTime())
      expect(result.lastModified.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
      expect(result.lastModified.getTime()).toBeLessThanOrEqual(afterCreate.getTime())
      expect(result.version).toBe(1)
    })

    it("returns multiple validation errors when multiple issues exist", () => {
      const result = Effect.runSync(
        Effect.either(
          FishingRod.create({
            id: Schema.decodeSync(EquipmentId)("rod-multi-error"),
            manufacturer: validManufacturer,
            modelName: "Multi Error Rod",
            partNumber: "MER-001",
            power: ultraLightPower,
            action: fastAction,
            length: rodLength,
            rodType,
            pieces: 0,
            materialComposition: "Graphite"
          })
        )
      )

      expect(Either.isLeft(result)).toBe(true)
      if (Either.isLeft(result)) {
        expect(result.left.errors).toHaveLength(2)
        expect(result.left.errors).toContain("Power Ultra Light is not compatible with Action Fast")
        expect(result.left.errors).toContain("Rod pieces must be between 1 and 4")
      }
    })
  })

  describe("invalid combinations", () => {
    it("rejects ultra-light power with fast action", () => {
      const result = Effect.runSync(
        Effect.either(
          FishingRod.create({
            id: Schema.decodeSync(EquipmentId)("rod-003"),
            manufacturer: validManufacturer,
            modelName: "Invalid Rod",
            partNumber: "IR-001",
            power: ultraLightPower,
            action: fastAction,
            length: rodLength,
            rodType,
            pieces: 2,
            materialComposition: "Graphite"
          })
        )
      )

      expect(Either.isLeft(result)).toBe(true)
      if (Either.isLeft(result)) {
        expect(result.left.errors).toContain("Power Ultra Light is not compatible with Action Fast")
      }
    })

    it("rejects heavy power with slow action", () => {
      const result = Effect.runSync(
        Effect.either(
          FishingRod.create({
            id: Schema.decodeSync(EquipmentId)("rod-004"),
            manufacturer: validManufacturer,
            modelName: "Invalid Heavy Rod",
            partNumber: "IHR-001",
            power: heavyPower,
            action: slowAction,
            length: rodLength,
            rodType,
            pieces: 1,
            materialComposition: "Carbon Fiber"
          })
        )
      )

      expect(Either.isLeft(result)).toBe(true)
      if (Either.isLeft(result)) {
        expect(result.left.errors).toContain("Power Heavy is not compatible with Action Slow")
      }
    })
  })

  describe("validation rules", () => {
    it("rejects negative pieces count", () => {
      const result = Effect.runSync(
        Effect.either(
          FishingRod.create({
            id: Schema.decodeSync(EquipmentId)("rod-005"),
            manufacturer: validManufacturer,
            modelName: "Invalid Pieces Rod",
            partNumber: "IPR-001",
            power: ultraLightPower,
            action: moderateAction,
            length: rodLength,
            rodType,
            pieces: -1,
            materialComposition: "Graphite"
          })
        )
      )

      expect(Either.isLeft(result)).toBe(true)
      if (Either.isLeft(result)) {
        expect(result.left.errors).toContain("Rod pieces must be between 1 and 4")
      }
    })

    it("rejects zero pieces count", () => {
      const result = Effect.runSync(
        Effect.either(
          FishingRod.create({
            id: Schema.decodeSync(EquipmentId)("rod-006"),
            manufacturer: validManufacturer,
            modelName: "Zero Pieces Rod",
            partNumber: "ZPR-001",
            power: ultraLightPower,
            action: moderateAction,
            length: rodLength,
            rodType,
            pieces: 0,
            materialComposition: "Graphite"
          })
        )
      )

      expect(Either.isLeft(result)).toBe(true)
      if (Either.isLeft(result)) {
        expect(result.left.errors).toContain("Rod pieces must be between 1 and 4")
      }
    })

    it("rejects too many pieces count", () => {
      const result = Effect.runSync(
        Effect.either(
          FishingRod.create({
            id: Schema.decodeSync(EquipmentId)("rod-007"),
            manufacturer: validManufacturer,
            modelName: "Too Many Pieces Rod",
            partNumber: "TMPR-001",
            power: ultraLightPower,
            action: moderateAction,
            length: rodLength,
            rodType,
            pieces: 5,
            materialComposition: "Graphite"
          })
        )
      )

      expect(Either.isLeft(result)).toBe(true)
      if (Either.isLeft(result)) {
        expect(result.left.errors).toContain("Rod pieces must be between 1 and 4")
      }
    })
  })

  describe("changePower method", () => {
    const validRod = Effect.runSync(
      FishingRod.create({
        id: Schema.decodeSync(EquipmentId)("rod-change-power"),
        manufacturer: validManufacturer,
        modelName: "Change Power Test Rod",
        partNumber: "CPTR-001",
        power: ultraLightPower,
        action: moderateAction,
        length: rodLength,
        rodType,
        pieces: 2,
        materialComposition: "Graphite"
      })
    )

    const lightPower = new RodPower({
      name: "Light",
      powerRating: 3,
      minLineTest: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("TestStrength")))(4),
      maxLineTest: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("TestStrength")))(8),
      minLureWeight: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("LureWeight")))(0.75),
      maxLureWeight: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("LureWeight")))(4)
    })

    const superHeavyPower = new RodPower({
      name: "Super Heavy",
      powerRating: 10,
      minLineTest: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("TestStrength")))(20),
      maxLineTest: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("TestStrength")))(30),
      minLureWeight: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("LureWeight")))(1),
      maxLureWeight: Schema.decodeSync(Schema.Number.pipe(Schema.positive(), Schema.brand("LureWeight")))(5)
    })

    it("successfully changes power when compatible with action", () => {
      const result = Effect.runSync(Effect.either(validRod.changePower(lightPower)))

      expect(Either.isRight(result)).toBe(true)
      if (Either.isRight(result)) {
        expect(result.right.power).toBe(lightPower)
        expect(result.right.version).toBe(validRod.version + 1)
        expect(result.right.lastModified.getTime()).toBeGreaterThan(validRod.lastModified.getTime())
        expect(result.right.action).toBe(moderateAction)
      }
    })

    it("fails when new power is incompatible with current action", () => {
      const fastActionRod = Effect.runSync(
        FishingRod.create({
          id: Schema.decodeSync(EquipmentId)("rod-fast-action"),
          manufacturer: validManufacturer,
          modelName: "Fast Action Rod",
          partNumber: "FAR-001",
          power: lightPower,
          action: fastAction,
          length: rodLength,
          rodType,
          pieces: 2,
          materialComposition: "Graphite"
        })
      )

      const result = Effect.runSync(Effect.either(fastActionRod.changePower(ultraLightPower)))

      expect(Either.isLeft(result)).toBe(true)
      if (Either.isLeft(result)) {
        expect(result.left.reason).toContain("New power Ultra Light is not compatible with action Fast")
        expect(result.left.equipmentId).toBe(fastActionRod.id)
      }
    })

    it("fails when power change is too dramatic", () => {
      const result = Effect.runSync(Effect.either(validRod.changePower(superHeavyPower)))

      expect(Either.isLeft(result)).toBe(true)
      if (Either.isLeft(result)) {
        expect(result.left.reason).toContain("Power change too dramatic: from Ultra Light to Super Heavy")
        expect(result.left.equipmentId).toBe(validRod.id)
      }
    })

    it("preserves all other properties when changing power", () => {
      const result = Effect.runSync(validRod.changePower(lightPower))

      expect(result.id).toBe(validRod.id)
      expect(result.manufacturer).toBe(validRod.manufacturer)
      expect(result.modelName).toBe(validRod.modelName)
      expect(result.partNumber).toBe(validRod.partNumber)
      expect(result.catalogAddedDate).toBe(validRod.catalogAddedDate)
      expect(result.action).toBe(validRod.action)
      expect(result.length).toBe(validRod.length)
      expect(result.rodType).toBe(validRod.rodType)
      expect(result.pieces).toBe(validRod.pieces)
      expect(result.materialComposition).toBe(validRod.materialComposition)
    })
  })
})
