
 export function valid_password(password:string)
 {
 if(password.length<8)
        return 'password should be 8 or more'
    if(!test_password(password))
    {
        return 'Contains 8 or more charactersContains at least one uppercase letter (A–Z)Contains at least one lowercase letter (a–z)Contains at least one number (0–9)Contains at least one special character (!@#$%^&* and)'
            
        
    }
    return null;
}
function test_password(password:string)
{
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongRegex.test(password);
    
}