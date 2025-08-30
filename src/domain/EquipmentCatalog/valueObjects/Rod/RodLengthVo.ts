import { type Brand, Schema } from "effect"

type RodLength = number & Brand.Brand<"RodLength">
export const RodLength = Schema.Number.pipe(
  Schema.between(4, 15, { message: () => "Rod length must be between 4 and 15 feet" }),
  Schema.brand("RodLength")
)
