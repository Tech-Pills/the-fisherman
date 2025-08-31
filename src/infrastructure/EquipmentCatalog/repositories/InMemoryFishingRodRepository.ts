import { Context, Effect, Layer, pipe, Ref } from "effect"

import type { FishingRod } from "src/domain/EquipmentCatalog/entities/FishingRodEntity.js"

import type { EquipmentId } from "src/domain/EquipmentCatalog/valueObjects/shared/EquipmentIdVo.js"

import type { EquipmentValidationError } from "src/domain/EquipmentCatalog/errors/EquipmentValidationError.js"

import { EquipmentNotFoundError } from "src/domain/EquipmentCatalog/errors/EquipmentNotFoundError.js"

export const makeFishingRodRepository = Effect.gen(function*() {
  const rods = yield* Ref.make(new Map<EquipmentId, FishingRod>())

  const findById = (id: EquipmentId): Effect.Effect<FishingRod, EquipmentNotFoundError> =>
    pipe(
      Ref.get(rods),
      Effect.flatMap((rodMap) => {
        const rod = rodMap.get(id)
        return rod ? Effect.succeed(rod) : Effect.fail(new EquipmentNotFoundError({ equipmentId: id }))
      })
    )

  const save = (rod: FishingRod): Effect.Effect<void, EquipmentValidationError> =>
    pipe(
      Ref.update(rods, (rodMap) => new Map(rodMap).set(rod.id, rod)),
      Effect.asVoid
    )

  return {
    findById,
    save
  } as const
})

export type FishingRodRepository = Effect.Effect.Success<typeof makeFishingRodRepository>

export const FishingRodRepository = Context.GenericTag<FishingRodRepository>("FishingRodRepository")

export const InMemoryFishingRodRepository = Layer.effect(FishingRodRepository, makeFishingRodRepository)
