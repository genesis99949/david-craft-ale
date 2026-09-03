/* js/pour-guard.js
   Ruleaza inainte de primul paint: daca am ajuns aici printr-o
   tranzitie, marcheaza documentul ca acoperit ca sa nu clipeasca.
   NU pune defer pe el - trebuie sa se execute inainte de <body>. */
(function(){try{var s=sessionStorage.getItem("dcb-pour");if(!s)return;sessionStorage.removeItem("dcb-pour");if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var d=document.documentElement;d.setAttribute("data-pour","in");window.__pour=JSON.parse(s);setTimeout(function(){d.removeAttribute("data-pour")},1800)}catch(e){}})();
