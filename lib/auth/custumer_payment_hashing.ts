import crypto from"crypto"
import { rand_salt } from "./passwordhasing"
export function custumer_payment_hash(card_number:string)
{
      const salt=rand_salt()
    const token=crypto.createHash("sha256").update(card_number+salt).digest("hex")
    return {token,mask:`********${card_number.slice(-4)}`,salt}
    
  
}