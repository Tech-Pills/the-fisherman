import type { Brand } from "effect"
import { Schema } from "effect"

export type EquipmentId = string & Brand.Brand<"EquipmentId">
export const EquipmentId = Schema.String.pipe(Schema.brand("EquipmentId"))
