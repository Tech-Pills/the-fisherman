import { Data } from "effect"

export class ManufacturerInfo extends Data.TaggedClass("ManufacturerInfo")<{
  readonly name: string
  readonly countryOfOrigin?: string
  readonly website?: string
}> {}
