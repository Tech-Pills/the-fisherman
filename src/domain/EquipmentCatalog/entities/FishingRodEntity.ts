import { Schema } from "effect"
import { BaseEquipment } from "../_BaseEquipment.js"
import { RodAction } from "../valueObjects/Rod/RodActionVo.js"
import { RodLength } from "../valueObjects/Rod/RodLengthVo.js"
import { RodPower } from "../valueObjects/Rod/RodPowerVo.js"
import { RodType } from "../valueObjects/Rod/RodTypeVo.js"

export class FishingRod extends BaseEquipment.extend<FishingRod>("FishingRod")(
  Schema.Struct({
    power: Schema.instanceOf(RodPower),
    action: Schema.instanceOf(RodAction),
    length: RodLength,
    rodType: Schema.instanceOf(RodType),
    pieces: Schema.Int.pipe(Schema.positive()),
    materialComposition: Schema.String
  }).pipe(
    Schema.filter(
      (rod) =>
        rod.power.isCompatibleWith(rod.action) ||
        `Power ${rod.power.name} is not compatible with Action ${rod.action.name}`
    )
  )
) {}
