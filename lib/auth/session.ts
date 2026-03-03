'use server';
import { cookies } from 'next/headers'
import crypto from"crypto"
import { session } from '@/server/db/schema';
import { db } from '@/server/db/config/db_config';
import { eq } from 'drizzle-orm';
type sessionUser={id:number,role:string,email:string}

export async function createUsercookies(user:sessionUser)
{
  const cookieStore =await cookies(); 
const sessionid=crypto.randomBytes(64).toString('hex').normalize();
const createdAt=new Date().toISOString()
   cookieStore.set('sessionid',sessionid, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge:60*60*24*7,
    path: '/',
  });
const save_session=await db.insert(session).values({sessionid:sessionid,userid:user.id,createdAt:createdAt})
}

export async function delUserSession() {
    const cookieStore = await cookies();
   const sessionid=cookieStore.get('sessionid')?.value
   if(!sessionid) return
  await db.delete(session).where(eq(session.sessionid,sessionid))
    cookieStore.delete('sessionid');
  
}

export async function get_user() {
const get_user=await cookies()
const sessionid=get_user.get('sessionid')?.value
if(sessionid==null)
  return null
else
  return await get_user_sessionid(sessionid)
  
}
export async function get_user_sessionid(sessionid:string) {
  try{
  const data=await db.select().from(session).where(eq(session.sessionid,sessionid))
  return data
  }catch(error)
  {
    return null
  }
}