import { Data } from "effect"
import type { EquipmentId } from "../valueObjects/shared/EquipmentIdVo.js"

export class EquipmentNotFoundError extends Data.TaggedError("EquipmentNotFoundError")<{
  readonly equipmentId: EquipmentId
}> {}
