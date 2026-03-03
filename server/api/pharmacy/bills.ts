import { db } from "@/server/db/config/db_config";

import { medicine } from "@/server/db/schema/medicines";
import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { session_username } from "@/server/auth/action";
import { bills, bills_product } from "@/server/db/schema";
import { check_number_Valid } from "@/lib/auth/check_numberVladition";
import { custumer_payment_hash } from "@/lib/auth/custumer_payment_hashing";

const app=new Hono()
.get('/',async(c)=>
{
    const page=Number(c.req.query('page')??1)
    const pagesize=20

try{
 const data=await db.select().from(bills).innerJoin(bills_product,eq(bills.id,bills_product.bill_id))
 .innerJoin(medicine,eq(medicine.id,bills_product.medicine_id)).orderBy(desc(bills.bill_Date)).limit(20).offset((page-1)*pagesize)

 type prudect={medicine_name:string,quantity:number,pice_price:number,total_pice_price:number}
 type bill_data_group={
    bill_id:number,
    date:string,
    user_sell:string,
    custumer_last_4Number:string,
    prudect:prudect[]
}
   
const group:Record<number,bill_data_group>={}
data.forEach(e => {
  const billId = e.bills.id;

  if (!group[billId]) {
     group[billId] = {
      bill_id: e.bills.id,
      date: e.bills.bill_Date.toString(),
      user_sell: e.bills.user_sell.toString(),
      custumer_last_4Number:e.bills.custumer_last_4Number??"",
      prudect: []
    };
  }

   group[billId].prudect.push({
    medicine_name:e.medicine.medicine_name,
    quantity: e.bills_product.quantity,
    pice_price: e.medicine.price,
    total_pice_price: e.bills_product.quantity * e.medicine.price
  });
});

const groupedBills =Object.values(group);
   
 if(data.length<=0)
    return c.json({error:"no bills found"},404)
 return c.json(groupedBills)

}catch{
    return c.json({error:"page error"},500)
}
})
.get('/:id',async(c)=>
{
    const idpram=c.req.param("id")
    const id=Number(idpram)
    if(!id)
        return c.json({error:"invalid bill id"}, 400)
    try{
        
    const bills_filter=await db.select().from(bills).where(eq(bills.id,id))
    const bill_product=await db.select().from(bills_product).where(eq(bills_product.bill_id,Number(bills_filter[0].id)))
    return c.json({bills_filter,bill_product})
    }catch{
    return c.json({error:"error in filter"},500)
    }
})
.post('/',async(c)=>{
const get_user=await session_username()
    if(!get_user)
        return c.json({error:"user not found"}, 400)

const data=await c.req.json()   
const {product_,quantity_,user_sell_,custumer_payment_card,payment_type}=data

const quantity=Number(quantity_)
const user_sell=Number(user_sell_)

 let card_data: {token:string, salt:string, mask:string} | undefined

const obj={quantity,user_sell}

for(const [key,value]of Object.entries(obj))
{
    const data=check_number_Valid(value as number,key)
    if(data.flag==false)
        return c.json({error:data.message},400)
}

    
if(payment_type === "crad_payment") {
    if(!custumer_payment_card || custumer_payment_card.length != 11)
        return c.json({error:"custumer card error — must be 11 digits"},400)
    card_data = custumer_payment_hash(custumer_payment_card)
    if(!card_data)
        return c.json({error:"error in custumer data save"},400)
}

let total_price=0

try{
     let creat_bill
    await db.transaction(async(t)=>{
     [creat_bill]=await t.insert(bills).values({user_sell:user_sell,total_price:0,payment_type:payment_type,card_token:card_data?.token??null,card_salt:card_data?.salt??null,custumer_last_4Number:card_data?.mask??null}).returning()
    if(!creat_bill)
        throw new Error("error in bils try again")
    for(const m_data of product_){
    const {medicine_id,quantity}=m_data;
    const [medicin_data]=await t.select().from(medicine).where(eq(medicine.id,medicine_id))
    if(!medicin_data)
        throw new Error("medicin not found")
    const price=medicin_data.price
    total_price+=price*quantity
    if(medicin_data.medicine_Amount<quantity)
        throw new Error("not enough stock for "+medicin_data.medicine_name+" (available: "+medicin_data.medicine_Amount+", requested: "+quantity+")")
    await t.update(medicine).set({medicine_Amount:medicin_data.medicine_Amount-quantity}).where(eq(medicine.id,medicine_id))
    await t.insert(bills_product).values({medicine_id:medicine_id,quantity:quantity,product_price:medicin_data.price,bill_id:creat_bill.id})
 }
 if(!creat_bill)
    throw new Error("error in bils try again")
 await t.update(bills).set({total_price:total_price}).where(eq(bills.id,creat_bill.id))
     
})
const { card_token, card_salt, ...billData } = creat_bill as any
return c.json({ bill: billData, total_price })
}catch(error){
   console.log(error)
 return c.json({error:"creat bill error"},500)
}


})
.put("/:id",async(c)=>{
    const id_prams=c.req.param("id")
    const id=Number(id_prams)
    const data=await c.req.json()
    const {product,payment_type,crad_payment}=data
 if(!Array.isArray(product))
    return c.json({error:"product list error"}, 400)
  
 for (const p of product) {
  if (!p.medicine_id || isNaN(p.medicine_id)) {
    return c.json({ error: "invalid medicine_id" }, 400);
  }
  if (!p.quantity || isNaN(p.quantity) || p.quantity <= 0) {
    return c.json({ error: "invalid quantity" }, 400);
  }
}

    try{
    
     await db.transaction(async(t)=>{
      let card_token = null;
      let card_salt = null;
      let card_mask = null;


       if(payment_type=="crad_payment")
       {
        if(!crad_payment||crad_payment.length!=11)
            throw new Error("card number error")
        const custumer_card_data=custumer_payment_hash(crad_payment)
        if(!custumer_card_data)
            throw new Error("error in card save")
       card_token =custumer_card_data.token ;
       card_salt = custumer_card_data.salt;
       card_mask = custumer_card_data.mask;
}   
   await t.update(bills).set({payment_type:payment_type,card_salt:card_salt,card_token:card_token,custumer_last_4Number:card_mask}).where(eq(bills.id,id))
   
   
   const old_Products = await t.select().from(bills_product).where(eq(bills_product.bill_id,id))
   for(const op of old_Products){
     const [med] = await t.select().from(medicine).where(eq(medicine.id, op.medicine_id))
     if(med){
       await t.update(medicine).set({medicine_Amount: med.medicine_Amount + op.quantity}).where(eq(medicine.id, op.medicine_id))
     }
   }
   await t.delete(bills_product).where(eq(bills_product.bill_id,id))

if(product.length>0){
let total_price=0
 const billProducts: any[] = [];
    for(const m_data of product){
    const {medicine_id,quantity}=m_data;
    const [medicin_data]=await t.select().from(medicine).where(eq(medicine.id,medicine_id))
    if(!medicin_data)
        throw new Error("medicine not found")
    if(medicin_data.medicine_Amount<quantity)
        throw new Error("not enough stock for "+medicin_data.medicine_name+" (available: "+medicin_data.medicine_Amount+", requested: "+quantity+")")
    const price=medicin_data.price
    total_price+=price*quantity

     billProducts.push({
            medicine_id,
            quantity,
            product_price: medicin_data.price,
            bill_id: id
          });

    
    await t.update(medicine).set({medicine_Amount: medicin_data.medicine_Amount - quantity}).where(eq(medicine.id, medicine_id))
    }
     await t.update(bills).set({total_price:total_price}).where(eq(bills.id,id))
     await t.insert(bills_product).values(billProducts);

}
    })
    return c.json({update:true,bill_id:id})
    }catch(err){
    return c.json({error: err instanceof Error ? err.message : "error in bill update"},500)
    }


})

.delete("/:id",async(c)=>{
     const id_prams=c.req.param("id")
    const id=Number(id_prams)
    try{
 await db.transaction(async (d)=>{
  await d.delete(bills_product).where(eq(bills_product.bill_id,id));
  await d.delete(bills).where(eq(bills.id,id))

 })
 return c.json({delete:true,bill_id:id})
    }catch{
  return c.json({error:"delete error"},500)
    }
})
export default app