import {
  Purchase as PurchaseEvent,
  Refill as RefillEvent
} from "../generated/VendingMachine/VendingMachine"
import { Purchase, Refill } from "../generated/schema"

export function handlePurchase(event: PurchaseEvent): void {
  let entity = new Purchase(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.buyer = event.params.buyer
  entity.amount = event.params.amount
  entity.remaining = event.params.remaining
  entity.timestamp = event.params.timestamp
  entity.blockNumber = event.params.blockNumber
  entity.save()
}

export function handleRefill(event: RefillEvent): void {
  let entity = new Refill(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.owner = event.params.owner
  entity.amount = event.params.amount
  entity.remaining = event.params.remaining
  entity.timestamp = event.params.timestamp
  entity.blockNumber = event.params.blockNumber
  entity.save()
}
