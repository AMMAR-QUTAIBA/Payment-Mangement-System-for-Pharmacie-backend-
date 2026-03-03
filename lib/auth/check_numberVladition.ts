export function check_number_Valid(prams:number,prams_name:string)
{
if(prams==undefined||isNaN(prams)||prams==null)
    return {flag:false,message:`error in${prams_name}`}
else
    return {flag:true}
}