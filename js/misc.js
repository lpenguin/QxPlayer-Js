function loadScript(url, callback)
{
    // adding the script tag to the head as suggested before
   var head= document.getElementsByTagName('head')[0];
   var script= document.createElement('script');
   script.type= 'text/javascript';
   script.src= url;

   // then bind the event to the callback function 
   // there are several events for cross browser compatibility
   script.onreadystatechange = callback;
   script.onload = callback;

   // fire the loading
   head.appendChild(script);
}

/* Returns the class name of the argument or undefined if
it's not a valid JavaScript object.
*/
function getObjectClass(obj) {
 if (obj && obj.constructor && obj.constructor.toString) {
     var arr = obj.constructor.toString().match(
         /function\s*(\w+)/);

     if (arr && arr.length == 2) {
         return arr[1];
     }
 }

 return undefined;
}

function startQ(){
	player.init();
}