import { rejects } from "assert";
import { error } from "console";
import crypto from "crypto"
import { promises } from "dns"
import { buffer } from "stream/consumers";

export async function passwordhasing(password:string,salt:string) {
    
    const hash=crypto.scryptSync(password,salt,64)
    return hash.toString('hex')
    

}
export function rand_salt() {
    return crypto.randomBytes(8).toString('hex').normalize();
   
    
}
export async function compare_password(salt:string,password:string,hashpassword:string) {
    const input=crypto.scryptSync(password,salt,64).toString('hex')
   
   const ismatch=crypto.timingSafeEqual(
     Buffer.from(hashpassword,'hex'),
    Buffer.from(input,'hex')
   )
        return ismatch;
}