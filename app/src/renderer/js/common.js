export let emailCheck = function(email) {
  var emailReg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
  return emailReg.test(email);
}


export let isEmpty = function(obj)
{
    for (var name in obj) 
    {
        return false;
    }
    return true;
};