import { Effect, Schema } from "effect"

import { EquipmentId } from "../valueObjects/shared/EquipmentIdVo.js"
import { ManufacturerInfo } from "../valueObjects/shared/ManufacturerInfoVo.js"

import { RodAction } from "../valueObjects/Rod/RodActionVo.js"
import { RodLength } from "../valueObjects/Rod/RodLengthVo.js"
import { RodPower } from "../valueObjects/Rod/RodPowerVo.js"
import { RodType } from "../valueObjects/Rod/RodTypeVo.js"

import { EquipmentValidationError } from "../errors/EquipmentValidationError.js"
import { IncompatibleSpecificationError } from "../errors/IncompatibleSpecificationError.js"

export class FishingRod extends Schema.Class<FishingRod>("FishingRod")(
  Schema.Struct({
    // Previous _BaseEquipment properties
    id: EquipmentId,
    manufacturer: Schema.instanceOf(ManufacturerInfo),
    modelName: Schema.NonEmptyString,
    partNumber: Schema.NonEmptyString,
    catalogAddedDate: Schema.DateFromSelf,

    power: Schema.instanceOf(RodPower),
    action: Schema.instanceOf(RodAction),
    length: RodLength,
    rodType: Schema.instanceOf(RodType),
    pieces: Schema.Int.pipe(Schema.positive()),
    materialComposition: Schema.String,
    lastModified: Schema.DateFromSelf,
    version: Schema.Int.pipe(Schema.positive())
  })
) {
  static create(data: {
    id: EquipmentId
    manufacturer: ManufacturerInfo
    modelName: string
    partNumber: string
    power: RodPower
    action: RodAction
    length: RodLength
    rodType: RodType
    pieces: number
    materialComposition: string
  }): Effect.Effect<FishingRod, EquipmentValidationError> {
    const now = new Date()

    const errors: Array<string> = []

    if (!data.power.isCompatibleWith(data.action)) {
      errors.push(`Power ${data.power.name} is not compatible with Action ${data.action.name}`)
    }

    if (data.pieces < 1 || data.pieces > 4) {
      errors.push("Rod pieces must be between 1 and 4")
    }

    if (errors.length > 0) {
      return Effect.fail(
        new EquipmentValidationError({
          equipmentId: data.id,
          errors
        })
      )
    }

    return Effect.succeed(
      new FishingRod({
        id: data.id,
        manufacturer: data.manufacturer,
        modelName: data.modelName,
        partNumber: data.partNumber,
        catalogAddedDate: now,
        power: data.power,
        action: data.action,
        length: data.length,
        rodType: data.rodType,
        pieces: data.pieces,
        materialComposition: data.materialComposition,
        lastModified: now,
        version: 1
      })
    )
  }

  changePower(newPower: RodPower): Effect.Effect<FishingRod, IncompatibleSpecificationError> {
    // New power must be compatible with existing action
    if (!newPower.isCompatibleWith(this.action)) {
      return Effect.fail(
        new IncompatibleSpecificationError({
          equipmentId: this.id,
          reason: `New power ${newPower.name} is not compatible with action ${this.action.name}`
        })
      )
    }

    // Significant power changes might affect structural integrity
    const powerDifference = Math.abs(newPower.powerRating - this.power.powerRating)
    if (powerDifference > 3) {
      return Effect.fail(
        new IncompatibleSpecificationError({
          equipmentId: this.id,
          reason: `Power change too dramatic: from ${this.power.name} to ${newPower.name}`
        })
      )
    }

    return Effect.succeed(
      new FishingRod({
        ...this,
        power: newPower,
        lastModified: new Date(),
        version: this.version + 1
      })
    )
  }
}
