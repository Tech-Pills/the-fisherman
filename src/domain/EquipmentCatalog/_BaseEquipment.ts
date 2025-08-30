import { type Brand, Schema } from "effect"

import { ManufacturerInfo } from "./valueObjects/ManufacturerInfoVo.js"

type EquipmentId = string & Brand.Brand<"EquipmentId">
const EquipmentId = Schema.String.pipe(Schema.brand("EquipmentId"))

export class BaseEquipment extends Schema.Class<BaseEquipment>("BaseEquipment")({
  id: EquipmentId,
  manufacturer: Schema.instanceOf(ManufacturerInfo),
  modelName: Schema.NonEmptyString,
  partNumber: Schema.NonEmptyString,
  catalogAddedDate: Schema.DateFromSelf
}) {}
