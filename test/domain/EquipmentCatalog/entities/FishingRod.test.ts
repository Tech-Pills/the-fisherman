import { describe, expect, it } from "@effect/vitest"
import { Schema } from "effect"
import { FishingRod } from "../../../../src/domain/EquipmentCatalog/entities/FishingRodEntity.js"
import { ManufacturerInfo } from "../../../../src/domain/EquipmentCatalog/valueObjects/ManufacturerInfoVo.js"
import { RodAction } from "../../../../src/domain/EquipmentCatalog/valueObjects/Rod/RodActionVo.js"
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

  const rodLength = Schema.decodeSync(Schema.Number.pipe(Schema.between(4, 15), Schema.brand("RodLength")))(7)

  const rodType = new RodType({
    name: "Spinning",
    compatibleReelTypes: ["Spinning Reel", "Baitcasting Reel"],
    guideOrientation: "topside"
  })

  describe("valid combinations", () => {
    it("creates rod with compatible ultra-light power and moderate action", () => {
      const result = Schema.decodeUnknownEither(FishingRod)({
        id: Schema.decodeSync(Schema.String.pipe(Schema.brand("EquipmentId")))("rod-001"),
        manufacturer: validManufacturer,
        modelName: "Test Rod",
        partNumber: "TR-001",
        catalogAddedDate: new Date(),
        power: ultraLightPower,
        action: moderateAction,
        length: rodLength,
        rodType,
        pieces: 2,
        materialComposition: "Graphite"
      })

      expect(result._tag).toBe("Right")
    })

    it("creates rod with compatible heavy power and moderate action", () => {
      const result = Schema.decodeUnknownEither(FishingRod)({
        id: Schema.decodeSync(Schema.String.pipe(Schema.brand("EquipmentId")))("rod-002"),
        manufacturer: validManufacturer,
        modelName: "Heavy Rod",
        partNumber: "HR-001",
        catalogAddedDate: new Date(),
        power: heavyPower,
        action: moderateAction,
        length: rodLength,
        rodType,
        pieces: 1,
        materialComposition: "Fiberglass"
      })

      expect(result._tag).toBe("Right")
    })
  })

  describe("invalid combinations", () => {
    it("rejects ultra-light power with fast action", () => {
      const result = Schema.decodeUnknownEither(FishingRod)({
        id: Schema.decodeSync(Schema.String.pipe(Schema.brand("EquipmentId")))("rod-003"),
        manufacturer: validManufacturer,
        modelName: "Invalid Rod",
        partNumber: "IR-001",
        catalogAddedDate: new Date(),
        power: ultraLightPower,
        action: fastAction,
        length: rodLength,
        rodType,
        pieces: 2,
        materialComposition: "Graphite"
      })

      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        expect(result.left.message).toContain("Power Ultra Light is not compatible with Action Fast")
      }
    })

    it("rejects heavy power with slow action", () => {
      const result = Schema.decodeUnknownEither(FishingRod)({
        id: Schema.decodeSync(Schema.String.pipe(Schema.brand("EquipmentId")))("rod-004"),
        manufacturer: validManufacturer,
        modelName: "Invalid Heavy Rod",
        partNumber: "IHR-001",
        catalogAddedDate: new Date(),
        power: heavyPower,
        action: slowAction,
        length: rodLength,
        rodType,
        pieces: 1,
        materialComposition: "Carbon Fiber"
      })

      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        expect(result.left.message).toContain("Power Heavy is not compatible with Action Slow")
      }
    })
  })

  describe("validation rules", () => {
    it("rejects negative pieces count", () => {
      const result = Schema.decodeUnknownEither(FishingRod)({
        id: Schema.decodeSync(Schema.String.pipe(Schema.brand("EquipmentId")))("rod-005"),
        manufacturer: validManufacturer,
        modelName: "Invalid Pieces Rod",
        partNumber: "IPR-001",
        catalogAddedDate: new Date(),
        power: ultraLightPower,
        action: moderateAction,
        length: rodLength,
        rodType,
        pieces: -1,
        materialComposition: "Graphite"
      })

      expect(result._tag).toBe("Left")
    })

    it("rejects zero pieces count", () => {
      const result = Schema.decodeUnknownEither(FishingRod)({
        id: Schema.decodeSync(Schema.String.pipe(Schema.brand("EquipmentId")))("rod-006"),
        manufacturer: validManufacturer,
        modelName: "Zero Pieces Rod",
        partNumber: "ZPR-001",
        catalogAddedDate: new Date(),
        power: ultraLightPower,
        action: moderateAction,
        length: rodLength,
        rodType,
        pieces: 0,
        materialComposition: "Graphite"
      })

      expect(result._tag).toBe("Left")
    })
  })
})
