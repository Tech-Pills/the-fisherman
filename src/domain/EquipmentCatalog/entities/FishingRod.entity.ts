import { Schema } from "effect"
import { BaseEquipment } from "../_BaseEquipment.js"
import { RodAction } from "../valueObjects/Rod/RodAction.vo.js"
import { RodLength } from "../valueObjects/Rod/RodLength.vo.js"
import { RodPower } from "../valueObjects/Rod/RodPower.vo.js"
import { RodType } from "../valueObjects/Rod/RodType.vo.js"

export class FishingRod extends BaseEquipment.extend<FishingRod>("FishingRod")({
  power: Schema.instanceOf(RodPower),
  action: Schema.instanceOf(RodAction),
  length: RodLength,
  rodType: Schema.instanceOf(RodType),
  pieces: Schema.Int.pipe(Schema.positive()),
  materialComposition: Schema.String
}) {}
