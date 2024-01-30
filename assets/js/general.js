// cookies
function createCookie(name,value,days) {
    let expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)===' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}

//others
function denyAllConsentScripts() {
    let consentValue = "";
    scripts.forEach(function(){
        consentValue = consentValue + "0";
    });
    acceptSomeConsentScripts(consentValue);
}

function acceptAllConsentScripts() {
    let consentValue = "";
    scripts.forEach(function(){
        consentValue = consentValue + "1";
    });
    acceptSomeConsentScripts(consentValue);
}

function acceptSomeConsentScripts(consentValue) {
    setConsentInputs(consentValue);
    createCookie('consent-settings',consentValue,31);
    document.getElementById('consent-notice').style.display = 'none';
    document.getElementById('consent-overlay').classList.remove('active');
    loadConsentScripts(consentValue);
}

function loadConsentScripts(consentValue) {

    scripts.forEach(function(value,key){
        //console.log('script'+key+' is set to ' +consentValue[key]+' and is file '+value);
        if(consentValue[key]) {
            let s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = value;
            s.async = true;
            document.body.appendChild(s);
        }
    });
}

function setConsentInputs(consentValue) {
    let elements = document.querySelectorAll('#consent-overlay input:not([disabled])');
    elements.forEach(function(el,index) {
        el.checked = !!consentValue[index];
    });
}

function setConsentValue() {
    const elements = document.querySelectorAll('#consent-overlay input:not([disabled])');
    let consentValue = "";
    elements.forEach(function(el) {
        if(el.checked) consentValue = consentValue + "1";
        else consentValue = consentValue + "0";
    });
    document.getElementById("save-consent").dataset.consentvalue = consentValue;
}

//ready
ready.then(async () => {

    const notice = document.getElementById("consent-notice");
    const overlay = document.getElementById("consent-overlay");

    const btn_save = document.getElementById("save-consent")
    const btn_reset = document.getElementById("cookie_reset");

    if(readCookie('consent-settings')) {
        const consentValue = readCookie('consent-settings').toString();
        //console.log(consentValue);
        setConsentInputs(consentValue);
        loadConsentScripts(consentValue);
    }
    else {
        notice.style.display = 'flex';
    }

    if (btn_reset) {
        btn_reset.addEventListener('click', () => {
            eraseCookie('consent-settings');
            location.reload();
        });
    }

    btn_save.addEventListener("click",() => {
        setConsentValue();
        acceptSomeConsentScripts(btn_save.dataset.consentvalue);
    });

    overlay.addEventListener("click",(e) => {
        if (!document.querySelector("#consent-overlay > div").contains(e.target)) {
            this.classList.toggle('active');
        }
    });

    document.querySelectorAll('.manage-consent')
            .forEach((el) => {
                el.addEventListener("click",() => {
                    document.getElementById('consent-overlay').classList.toggle('active');
                });
            });

    document.querySelectorAll('.deny-consent')
            .forEach((el) => {
                el.addEventListener("click",function() {
                    denyAllConsentScripts();
                });
            });

    document.querySelectorAll('.approve-consent')
            .forEach((el) => {
                el.addEventListener("click",() => {
                    acceptAllConsentScripts();
                });
            });

    document.querySelectorAll('#consent-overlay input:not([disabled])')
            .forEach((el) => {
                el.checked = false;
            });
});
