import { Data } from "effect"
import type { EquipmentId } from "../valueObjects/shared/EquipmentIdVo.js"

export class IncompatibleSpecificationError extends Data.TaggedError("IncompatibleSpecificationError")<{
  readonly equipmentId: EquipmentId
  readonly reason: string
}> {}
