import { Data } from "effect"

export class RodAction extends Data.TaggedClass("RodAction")<{
  readonly name: string
  readonly flexPoint: "tip" | "upper-third" | "middle" | "throughout"
}> {}
