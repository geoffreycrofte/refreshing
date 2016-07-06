var cssFiles = [];
var jsonData=[];
var currentSiteOptions = {};
chrome.storage.sync.set({'currentTab': document.domain}, function() {
});

$(document).ready(function(){
    $.ajaxSetup({ cache: false });
    var myRand = getRandomInt(0, 99999999999);
    var increment=0;
    
    init();
    function init(checkCSS=true){
        chrome.storage.sync.get('jsonData', function(itemz) {
            jsonData = itemz.jsonData;
            if (typeof jsonData === typeof undefined || jsonData == false || jsonData == null) {
                jsonData = [];
                currentSiteOptions = {'domain':document.domain, 'active': 'false'};
                jsonData.push(currentSiteOptions);
            }else{
                currentSiteOptions = getItemByDomain(document.domain, jsonData);
        
            }
            if (currentSiteOptions.active === 'true') {
                getCssFiles(currentSiteOptions,checkCSS);
            }else{
                setTimeout(function(){ init(); }, 1000);
            }
            
        });
    }

    function getCssFiles(currentSiteOptions, checkCSS = true){
        if(checkCSS)
        $('[rel]').each(function(){
            $data = $(this).attr('href');
            if($data.indexOf('css')>-1 || $data.indexOf('style')>-1)
            {
                cssFiles.push(getCSSFileName($(this).attr('href')));
            }
        })
        refreshCss(currentSiteOptions);
    }
    
    function getCssToRemove(filename, filetype){
        var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist from
        var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
        var allsuspects=document.getElementsByTagName(targetelement)

        for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
            if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
            {
                str = allsuspects[i].href;
                str.replace("<link rel=\"stylesheet\" type=\"text\\css\" href=\"", "");
                str.replace("\">", "");
                var res = str.split("?");
                if (parseInt(res[1]) < (parseInt(myRand+''+increment) - 4) || res.length==1) {
                    var $ht = $(allsuspects[i]);
                    if($ht.length)
                    $ht.remove();
                }
            }
        }
        return allsuspects;
    }

    var toType = function(obj) {
      return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function refreshCss(currentSiteOptions){        
            if (currentSiteOptions.active === 'true') {
                for(var i=0;i<cssFiles.length;i++)
                {
                    var cssId = 'myCss';  // you could encode the css path itself to generate id..
                    var removeCss = getCssToRemove(cssFiles[i],"css");
                    var head  = document.getElementsByTagName('head')[0];
                    var link  = document.createElement('link');
                    link.id   = cssId;
                    link.rel  = 'stylesheet';
                    link.type = 'text/css';
                    link.href = cssFiles[i]+'?'+myRand+''+increment;
                    link.media = 'all';
                    head.appendChild(link);
                }
                increment++;
                setTimeout(function(){ init(false); }, 500);
            } 

    }

    function inArray(needle, haystack) {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i] == needle) return true;
        }
    }
    

window.addEventListener('error', function(e) {
    cssFiles.remove(getCSSFileName(e.target.href));
}, true);

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function getCSSFileName(str){
        $linkPieces = str.split("?");
        return $linkPieces[0];
}


function getItemByDomain(domainStr, jsonData){
    if(jsonData)
    for(var i=0;i<jsonData.length;i++)
    {
        if (!(typeof jsonData[i] === typeof undefined || jsonData[i] == false || jsonData[i] == null))
        if(jsonData[i].domain === domainStr){
            return jsonData[i];
        }
    }
    return {'domain':domainStr,'active':false};
}

function updateJsonItem(currentSiteOptions, jsonData) {
    for(var i=0;i<jsonData.length;i++)
    {   
        if (!(typeof jsonData[i] === typeof undefined || jsonData[i] == false || jsonData[i] == null))
        if(jsonData[i].domain === currentSiteOptions.domain){
            jsonData[i] = currentSiteOptions;
            return jsonData;
        }
    }
    jsonData.push(currentSiteOptions);
    return jsonData;
}

});