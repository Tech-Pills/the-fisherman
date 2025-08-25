import type { Brand } from "effect"
import { Data, Schema } from "effect"
import { type RodAction } from "./RodAction.vo.js"

type TestStrength = number & Brand.Brand<"TestStrength">
const TestStrength = Schema.Number.pipe(
  Schema.positive({ message: () => "Test strength must be positive" }),
  Schema.brand("TestStrength")
)

type LureWeight = number & Brand.Brand<"LureWeight">
const LureWeight = Schema.Number.pipe(
  Schema.positive({ message: () => "Lure weight must be positive" }),
  Schema.brand("LureWeight")
)

export class RodPower extends Data.TaggedClass("RodPower")<{
  readonly name: string
  readonly powerRating: number
  readonly minLineTest: TestStrength
  readonly maxLineTest: TestStrength
  readonly minLureWeight: LureWeight
  readonly maxLureWeight: LureWeight
}> {
  isCompatibleWith(action: RodAction): boolean {
    // Domain rule: Ultra-light power doesn't work well with fast action
    if (this.powerRating <= 2 && action.flexPoint === "tip") return false

    // Domain rule: Heavy power needs at least moderate action
    if (this.powerRating >= 8 && action.flexPoint === "throughout") return false

    return true
  }
}
