import { Data } from "effect"

export class RodType extends Data.TaggedClass("RodType")<{
  readonly name: string
  readonly guideOrientation: "topside" | "underside"
  readonly compatibleReelTypes: ReadonlyArray<string>
}> {}
