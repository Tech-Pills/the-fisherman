import { Data } from "effect"
import type { EquipmentId } from "../valueObjects/shared/EquipmentIdVo.js"

export class EquipmentValidationError extends Data.TaggedError("EquipmentValidationError")<{
  readonly equipmentId: EquipmentId
  readonly errors: ReadonlyArray<string>
}> {}
