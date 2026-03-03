'use server'
import{createUsercookies, delUserSession, get_user, get_user_sessionid} from"@/lib/auth/session"
import { eq } from 'drizzle-orm';
import { db } from "../db/config/db_config";
import { users } from "../db/schema";
import { session} from "../db/schema/session";
import { valid_password } from '@/lib/auth/valid_password';
import { compare_password, passwordhasing, rand_salt } from '@/lib/auth/passwordhasing';
import { cookies } from "next/headers";
export async function signin(email:string,password:string) {
    const [user]=await db.select().from(users).where(eq(users.email,email))
    if(user==null)
        return "error in sign in"
    const compare=await compare_password(user.salt,password,user.password)
    if(!compare)
        return "error in password"
    try{
     await createUsercookies(user)
     return "user sucsses"
    }catch{
       return ("error in signin")
    }

}

export async function signUp({password,email,name,role}:{email:string,password:string,name:string,role?:string}) {
    const checkuser=await db.select().from(users).where(eq(users.email,email))
     if(checkuser.length>0) return "this emial is already used"
        const check_pass=valid_password(password)
     if(check_pass!=null)
        return check_pass 
    try{
    const salt=rand_salt();
    const hashpassword=await passwordhasing(password,salt)
    const [user]=await db.insert(users).values({name:name,password:hashpassword,email:email,salt:salt,role:role??'user',creatAt:new Date().toISOString()}).returning({
  id: users.id,
  email: users.email,
  role: users.role,
})

    await createUsercookies(user)
    return "signup success"

    }catch{
          return 'some thing wrong in signup try again'
    }
    

    

}

export async function logout() {
    try{
       await delUserSession()
       return "sign out is sucsses"

    }catch
    {
        return "error in logout"
    }
}
export async function isadmin() {
    const user=await cookies()
    const session_id=user.get('sessionid')?.value
    if(!session_id)
        return false
    const [data]=await db.select().from(session).where(eq(session.sessionid,session_id));
    if(!data)
        return false
    const [data2]=(await db.select().from(users).where(eq(users.id,data.userid)))
    if(data2.role=='admin')      
    return true;
else
    return false;
}
export async function session_username() {
    const user=await cookies()
    const session_id=user.get('sessionid')?.value
    if(!session_id)
        return null
    const [data]=await db.select().from(session).where(eq(session.sessionid,session_id));
    if(!data)
        return null
    const data2=(await db.select().from(users).where(eq(users.id,data.userid)))
    if(data2.length===0)
        return null
    const username=data2[0].name
   return username
}