var pFr = (function(window, document, undefined) {
    var pFr={};
    //UI elements and Selectors
    var slctrSneakPeek = '#sneakpeek';
    var slctrFeedInfo = "#feedInfo";
    var slctrTitle = "#title";
    var slctrCfg = "#cfg";
    var slctrContent = "#contentfeed";
    var slctrclassContentEntry = ".entry-content";
    var slctrSaveButton = "#savebutton";
    var slctrOPMLButton = "#opmlimport";
    var slctrAddFeedButton = "#addfeed";
    var IdOPMLInput = "opmlfileinput";
    var slctrSideControlPannel = '#sidebuttons';
    var scltrStatus='#status';
    var scltrBody='#bd';
    //Storage Items Name
    var StorageItemConfiguration = 'Configuration';
    var StorageItemOfflineFeeds = 'OfflineFeeds';
    var StorageItemReadItem = 'ReadItem';
    var configEditor = null;
    var isAllFeedsDirty=true;
    var numOfFeedsWaiting=0;
    var showAllFlag=false;
	
    //This is Defualt Configuration , will be overwritten from localStorage if available
    var Configuration = {
        "Configuration": {
            "ThemeColor": '#FBFBFB',
            "DateTimeFormat":"d-MMM-yyyy HH:mm",
            "Font":"Crimson Text",
            "Width":(document.width-200),
            "isToRemoveFormatting":true,
            "isToShowImagesInSeakPeekView":true,
			"isToMakeBackgroundNoisy":true,
            "Subscriptions": [
            {"url": "http://feeds.feedburner.com/TechCrunch"},
            { "url": "http://feeds.feedburner.com/nettuts"},
            { "url": "http://feeds.guardian.co.uk/theguardian/rss"},
            { "url": "http://www.techmeme.com/index.xml"},
            {"url": "http://www.markandey.com/atom.xml"},
            {"url":"http://feeds.coolhunting.com/ch"},
            {"url":"http://feeds.feedburner.com/apartmenttherapy/main"},
            { "url": "http://feeds.gawker.com/lifehacker/full"},
            { "url": "http://feeds.feedburner.com/core77/blog"},
            { "url": "http://feeds.feedburner.com/design-milk"}
            ]
        }
    };
    var isConfigLoadedFromStrorage=false;
    //feedResults contains reponses of Feed.load i.e. all feed data.
    var feedResults = [];
    var AllFeedItemsCount = 0;
    var curFeed = -1;
    var curFeedItem = null;
    var ReadItemCountInThisSession = 0;
    var AllFeedItems = [];
    var isConfigMode = false;
    var isSneakPeekMode = false;
    var bounceTimer=null;
    var bounceDirection='';
    var NoisyImageDataUrl=null;
    function d2h(d) {
        var v = d.toString(16);
        if (v.length === 1) {
            v = '0' + v;
        }
        return v;
    }
	function isUrl(a) {
    	var b = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    	return b.test(a)
	}
    function h2d(h) {
        return parseInt(h, 16);
    } /*Some sanitization*/
    if (console === undefined) {
        console = {};
    }
    if (console.log === undefined) {
        console.log = function() {};
    }
    if (window.localStorage === undefined) {
        window.localStorage = {};
    }
    if (window.localStorage.setItem === undefined) {
        window.localStorage.setItem = function() {};
    }
    if (window.localStorage.getItem === undefined) {
        window.localStorage.getItem = function() {
            return null;
        };
    }
    function getBrightness(strColor) {
        strColor = strColor.replace("#", "");
        var r = h2d(strColor.substr(0, 2));
        var g = h2d(strColor.substr(2, 2));
        var b = h2d(strColor.substr(4, 2));
        var bbb = (r * 299 + g * 587 + b * 114) / 1000;
        return bbb;
    }

    function computeColor(strColor, brightness) {
        var B = getBrightness(strColor);
        var cb = Math.floor((B + brightness) % 255);
        var ccc = "#" + d2h(cb) + d2h(cb) + d2h(cb);
        return ccc;
    }

    function computeMaxBrightColor(strColor) {
        var B = getBrightness(strColor);
        var cb = 20;
        if (B < 127) {
            cb = 235;
        }
        var ccc = "#" + d2h(cb) + d2h(cb) + d2h(cb);
        return ccc;
    }
    function removeUnicode(str){
        if(typeof(str)==='string'){
            return str.replace(/[^\u0000-\u007f]/g,"");
        }
        return str;
    }
    function isToMakeBackgroundNoisy(){
            var isToMakeBackgroundNoisy = (Configuration.Configuration.isToMakeBackgroundNoisy !== undefined) ? (Configuration.Configuration.isToMakeBackgroundNoisy) : true;
            if(isToMakeBackgroundNoisy==="false"){
                    isToMakeBackgroundNoisy=false;
            }
            if(isToMakeBackgroundNoisy==="true"){
                    isToMakeBackgroundNoisy=true;
            }
            Configuration.Configuration.isToMakeBackgroundNoisy =isToMakeBackgroundNoisy;
            return isToMakeBackgroundNoisy;
    }
    function generateNoise(opacity) {
            if(NoisyImageDataUrl!==null){
                $('html').css('backgroundImage', NoisyImageDataUrl);
                return true;
            }
            if ( !!!document.createElement('canvas').getContext ) {
               return false;
            }
            opacity = opacity || 0.2;
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext('2d');
            var x, y,        number;
            
            canvas.width = 55;
            canvas.height = 55;
            for ( x = 0; x < canvas.width; x++ ) {
               for ( y = 0; y < canvas.height; y++ ) {
                  number = Math.floor( Math.random() * 255 );
                  ctx.fillStyle = "rgba(" + number + "," + number + "," + number + "," + opacity + ")";
                  ctx.fillRect(x, y, 1, 1);
               }
            }
             NoisyImageDataUrl="url(" + canvas.toDataURL("image/png") + ")";
            $('html').css('backgroundImage', NoisyImageDataUrl);
            return true;
    }
    
    function applyColor() {
        var Color = (Configuration.Configuration.ThemeColor !== undefined) ? (Configuration.Configuration.ThemeColor) : '#FBFBFB';
        $('html').css('background', Color);
        var fcolor = computeMaxBrightColor(Color);
        $('html').css('color', fcolor);
        var fcolor2 = computeColor(Color, 100);
        $('body').css('color', fcolor);
        $(slctrContent).css('color', fcolor);
        $(slctrTitle).css('color', fcolor);
        $('.spitem h3').css('color', fcolor);
        $('.spitem').css('color', fcolor2);
        $(slctrContent + ' a:link, a:visited').css('color', fcolor);
        $('html a:link, a:visited').css('color', fcolor);
		if(isToMakeBackgroundNoisy()){
			 generateNoise(0.1);
		}
       
    }
    function isToRemoveFormatting(){
            var isRemoveFormating = (Configuration.Configuration.isToRemoveFormatting !== undefined) ? (Configuration.Configuration.isToRemoveFormatting) : true;
            if(isRemoveFormating=="false"){
                    isRemoveFormating=false;
            }
            if(isRemoveFormating=="true"){
                    isRemoveFormating=true;
            }
            Configuration.Configuration.isToRemoveFormatting =isRemoveFormating;
            return isRemoveFormating;
    }
    function isToShowImagesInSeakPeekView(){
            var isToShowImages = (Configuration.Configuration.isToShowImagesInSeakPeekView !== undefined) ? (Configuration.Configuration.isToShowImagesInSeakPeekView) : true;
            if(isToShowImages=="false"){
                    isToShowImages=false;
            }
            if(isToShowImages=="true"){
                    isToShowImages=true;
            }
            Configuration.Configuration.isToShowImagesInSeakPeekView =isToShowImages;
            return isToShowImages;
    }
    function applyFont() {
        var font = (Configuration.Configuration.Font !== undefined) ? (Configuration.Configuration.Font) : 'Crimson Text';
        var fonturlencode=escape(font);
        var fontfacebaseurl='http://fonts.googleapis.com/css?family=';
        $('#fontfacelink').attr('href',fontfacebaseurl+fonturlencode);
        var fontfamily="'"+font+"'"+ ", arial, serif";
        $('body').css('font-family',fontfamily)
    }
    function applyWidth(){
        var dwidth=(window.innerWidth);
        Configuration.Configuration.Width =(Configuration.Configuration.Width !== undefined) ? (Configuration.Configuration.Width):dwidth;
        var width = 0;
        if(!isConfigLoadedFromStrorage){
                width=dwidth;
                Configuration.Configuration.Width=width;
        }
        else{
            width=Configuration.Configuration.Width;
        }
        $('#doc2').css('width', width);
    }
    
    function getColorRotator() {
        var Colors = ['#FBFBFB', '#F4EED9', '#F7F7F7', '#343A3F', '#EDEBE8', '#000000', '#A0A0A0'];
        var count = 0;
        return function() {
            count++;
            count = Math.floor(count % Colors.length);
            Configuration.Configuration.ThemeColor = Colors[count];
            applyColor();
        };
    }
    function getFontRotator() {
        var fonts = ['Copse', 'Dancing Script', 'Goudy Bookletter 1911',  'Kreon', 'Radley', 'Geo','Arimo','Philosopher',
                            ,'Tangerine','Ubuntu','GFS Didot', 'Crimson Text'];
        var count = 0;
        return function() {
            count++;
            count = Math.floor(count % fonts.length);
            Configuration.Configuration.Font = fonts[count];
            applyFont();
        };
    }
    function removeRedundancyFromFeedSubscriptions(Config){
        try{
            var count=Config.Configuration.Subscriptions.length;
            var OldSubs=Config.Configuration.Subscriptions;
            var newSubs=[];
            var newMap={};
            var i=0;
            var j=0;
            for(i=0;i<count;i++){
                if(newMap[OldSubs[i].url] ===undefined){
                    newMap[OldSubs[i].url]=true;
                    newSubs[j]={"url":OldSubs[i].url};
                    j++;
                }
            }
            if(j<i){
                Config.Configuration.Subscriptions=newSubs;
            }
            return (i-j);
        }catch(err){
            console.log(err);
            return 0;
        }
    }
    function loadConfigFromStorage() {
        try {
            var sConfig = JSON.parse(window.localStorage.getItem(StorageItemConfiguration));
            if (sConfig) {
                Configuration = sConfig;
                removeRedundancyFromFeedSubscriptions(Configuration);
                isConfigLoadedFromStrorage=true;
            }else{
                isConfigLoadedFromStrorage=false;
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    function copyMarkAsReadFlag(FeedNew, FeedOld) {
        try {
            if (FeedNew === undefined || FeedOld === undefined || FeedNew === null || FeedOld === null) {
                return;
            }
            var feedEntriesNew = FeedNew.feed.entries;
            var feedEntriesOld = FeedOld.feed.entries;
            var countOld = feedEntriesNew.length;
            var countNew = feedEntriesNew.length;
            var j = 0;
            var k = 0;
            for (j = 0; j < countNew; j++) {
                for (k = 0; k < countOld; k++) {
                    if (feedEntriesNew[j].link === feedEntriesOld[k].link) {
                        feedEntriesNew[j].IsThisItemRead = feedEntriesOld[k].IsThisItemRead;
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    function setReadItemListToFeedResults(ReadItemList) {
        var len = feedResults.length;
        var j = 0;
        var i = 0;
        for (i = 0; i < len; i++) {
            if (feedResults[i] !== undefined && feedResults[i] !== null && feedResults[i].feed.title !== undefined) {
                var feedEntries = feedResults[i].feed.entries;
                var count = feedEntries.length;
                for (j = 0; j < count; j++) {
                    if (ReadItemList[feedEntries[j].link] === true) {
                        feedEntries[j].IsThisItemRead = true;
                    }
                    else {
                        feedEntries[j].IsThisItemRead = false;
                    }
                }
            }
        }
    }

    function getReadItemListFromFeedResults() {
        var len = feedResults.length;
        var ReadItemList = {};
        var j = 0;
        var i = 0;
        for (i = 0; i < len; i++) {
            if (feedResults[i] !== undefined && feedResults[i] !== null && feedResults[i].feed.title !== undefined) {
                var feedEntries = feedResults[i].feed.entries;
                var count = feedEntries.length;
                for (j = 0; j < count; j++) {
                    if (feedEntries[j].IsThisItemRead === true) {
                        ReadItemList[feedEntries[j].link] = true;
                    }
                }
            }
        }
        return ReadItemList;
    }

    function loadFeedsFromStorage() {
        try {
            var sConfig = JSON.parse(window.localStorage.getItem(StorageItemOfflineFeeds));
            if (sConfig) {
                feedResults = sConfig;
            }
            var ReadItemListInStorage = JSON.parse(window.localStorage.getItem(StorageItemReadItem));
            if (ReadItemListInStorage === null) {
                ReadItemListInStorage = {};
            }
/*
                ReadItemList is dictionary of [URL-->isReadmapping]
                this mapping should not grow infinitely , we just need relevent URLs
                This next 2 statements are trying to do the same
                1)setReadItemListToFeedResults
                2)getReadItemListToFeedResults
                First apply the read flags in the storage feed and build this list from their,
                so all irrelevent mapping will be deleted
                
            */
            setReadItemListToFeedResults(ReadItemListInStorage);
            ReadItemListInStorage = getReadItemListFromFeedResults();
            window.localStorage.setItem(StorageItemReadItem, JSON.stringify(ReadItemListInStorage));
        }
        catch (err) {
            console.log(err);
        }
    }

    function updateUnReadItemCount(isNewItemRead) {
        try {
            if (isNewItemRead) {
                ReadItemCountInThisSession = ReadItemCountInThisSession + 1;
            }
            var count = (AllFeedItems.length - ReadItemCountInThisSession);
            if(!showAllFlag){
                $('title').html('(' + count + ')Jini Feed Reader');    
            }else{
                $('title').html('(All)Jini Feed Reader');    
            }
            
        }
        catch (err) {
            console.log(err);
        }
    }
    function markAsRead(url, read) {
        var ReadItemListInStorage = JSON.parse(window.localStorage.getItem(StorageItemReadItem));
        if (ReadItemListInStorage === null) {
            ReadItemListInStorage = {};
        }
        if (ReadItemListInStorage[url] === undefined) {
            updateUnReadItemCount(true);
        }
        if (read !== undefined) {
            ReadItemListInStorage[url] = read;
        }
        else {
            ReadItemListInStorage[url] = true;
        }
        window.localStorage.setItem(StorageItemReadItem, JSON.stringify(ReadItemListInStorage));
    }
/*
        Just a note:
        If you quickly flip an item it wont be marked as read,
        we have to keep some delay, before item is marked as read.
    */

    function getTimerForMarkingAsRead(OldFeedItem) {
        return function() {
            if (OldFeedItem !== null) {
                if (OldFeedItem.link === curFeedItem.link) {
                    markAsRead(curFeedItem.link, true);
                }
            }
        };
    }

    function pushFeedItems(parent, aAllFeedItems) {
        var feedEntries = parent.feed.entries;
        var count = feedEntries.length;
        var i = 0;
        for (i = 0; i < count; i++) {
            if (feedEntries[i].IsThisItemRead !== true || showAllFlag) {
                feedEntries[i].parent = parent;
                aAllFeedItems.push(feedEntries[i]);
            }
        }
    }

    function setALlLinksToOpenInNewWindow() {
        $("a[href^='http']").attr('target', '_blank');
    }
    
    function bounceSideButton(argDirection) {
        if(argDirection===undefined){
                argDirection=bounceDirection;
        }
        if($.browser.msie){
             return;
        }
        $(slctrSideControlPannel).stop(true,true);
        $(slctrSideControlPannel).attr('style', '');
        $(slctrSideControlPannel).effect("bounce", {
            times: 1,
            direction: argDirection
        }, 100);
    }
    function setDelayedBounce(direction){
            bounceDirection=direction;
            if(bounceTimer!==null){
                clearTimeout(bounceTimer);
            }
            bounceTimer=setTimeout(bounceSideButton,100);
    }
    function RenderZeroItemCase(){
        $(slctrTitle).html('Zero New Items!');
        $(slctrContent).html('There are no new items to read! <br>');
        var link = $('<a>');
        $(link).attr('href','#');
        $(link).click(function(){
            showAllFlag=true;
            updateList();
        });
        $(link).text(' Show all items!');
        $(slctrContent).append(link);
        applyColor();
        
    }
    function RenderSneakPeek() {
        var count = (AllFeedItems) ? AllFeedItems.length : 0;
        if (count === 0) {
            RenderZeroItemCase();
            return;
        }
        $('.spitem').removeClass('spselected');
        var selSneakPeekItem = '#snkpkID' + curFeed;
        $(slctrSneakPeek).show();
        $(slctrContent).hide();
        $(slctrCfg).hide();
        $(slctrFeedInfo).html(AllFeedItems[curFeed].parent.feed.title);
        $(slctrTitle).html('');
        $(selSneakPeekItem).addClass('spselected');
        var scroll = ($(selSneakPeekItem).offset().top - 200);
        if(!$.browser.opera){
            $('html,body').stop(true,true);
                $('html,body').animate({
                scrollTop: scroll
            }, {
                duration: 'fast',
                easing: 'swing'
            });
        }else{
             $('html,body').scrollTop(scroll);
        }
        
    }
    
    /*
        We do not want user to accidently delete everything and save! :P
    */

    function isValidConfigItem(cfg) {
        try {
            if (cfg.Configuration === undefined) {
                return false;
            }
            if (cfg.Configuration.Subscriptions === undefined) {
                return false;
            }
            return true;
        }
        catch (err) {
            return false;
        }
    }

    function parseOPML(opml) {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(opml, "text/xml");
        var importedURL = [];
        var i = 0;
        $(xmlDoc).find("outline").each(function() {
            var feedURL = $(this).attr("xmlUrl");
            if (feedURL !== undefined && feedURL !== null) {
                importedURL.push({
                    'url': feedURL
                });
            }
        });
        try {
            var cc = configEditor.getJSON();
            var count = importedURL.length;
            var configArry = cc.Configuration.Subscriptions;
            for (i = 0; i < count; i++) {
                configArry.push(importedURL[i]);
            }
            var delcount=removeRedundancyFromFeedSubscriptions(cc);
            i=i-delcount;
            configEditor.setJSON(cc);
            var msg = '';
            if (i > 0) {
                msg = 'Please review and save!';
            }
            alert('Total of ' + count + ' Feeds Imported!' + msg);
        }
        catch (err) {
            console.log(err);
        }
    }

    function handleImportFileSelect() {
        try {
            if (this.files.length === 1) {
                var reader = new FileReader();
                reader.onloadend = function(e) {
                    parseOPML(e.target.result);
                };
                reader.readAsText(this.files[0]);
            }
        }
        catch (err) {
            alert('some error occured! ');
        }
    }
	function subscribe(c, a) {
	    if (!isUrl(c)) {
	        alert("URL is wrong");
	        return false;
	    }
	    var e = false;
	    if (a == undefined) {
	        a = JSON.parse(window.localStorage.getItem(StorageItemConfiguration));
	        e = true
	    }
	    if (a == undefined) {
	        alert("not sure where to subscribe!");
	        return false;
	    }
	    var d = a.Configuration.Subscriptions.length;
	    var b = a.Configuration.Subscriptions;
	    b[d] = {
	        url: c
	    };
	    removeRedundancyFromFeedSubscriptions(a);
	    if (e) {
	        window.localStorage.setItem(StorageItemConfiguration, JSON.stringify(a))
	    }
	    return true;
	}
	function promptAndAddNewFeed(){
		try{
			var cc = configEditor.getJSON();      
			var inputurl=prompt("Enter The Feed URL", "http://feeds2.feedburner.com/MarkandeyBlog");
			if(inputurl==null){
				return;
			}
			if(subscribe(inputurl,cc)){
				configEditor.setJSON(cc);
				alert('New Feed URL Added! Review JSON and save!');
			}

		}
		catch(err){
			alert('error');
		}
	}
    function RenderConfigItems() {
        if (configEditor === null) {
            configEditor = new jsonEditor('textEdit', 'treeView');
            $(slctrSaveButton).click(function() {
                var cc = configEditor.getJSON();
                if (!isValidConfigItem(cc)) {
                    alert('Invalid Config Item');
                    return;
                }
                Configuration = cc;
                window.localStorage.setItem(StorageItemConfiguration, JSON.stringify(Configuration));
                ToggleConfiguration();
                applyFont();
            });
            $(slctrOPMLButton).click(function() {
                document.getElementById(IdOPMLInput).click();
            });
			$(slctrAddFeedButton).click(function() {
                promptAndAddNewFeed()
            });
            $('#' + IdOPMLInput).change(handleImportFileSelect);
        }
        configEditor.setJSON(Configuration);
        $(slctrFeedInfo).html('{JSON}');
        $(slctrTitle).html('Configuration');
        $(slctrCfg).show();
        $(slctrSneakPeek).hide();
        $(slctrContent).html('');
        $('html,body').stop(true,true);
        $('html,body').animate({
            scrollTop: 0
        }, {
            duration: 'fast',
            easing: 'swing'
        });
        applyColor();
    }
    function RenderFeedItem() {
        $(slctrContent).show();
        $(slctrSneakPeek).hide();
        $(slctrCfg).hide();
        var count = (AllFeedItems) ? AllFeedItems.length : 0;
        if (count === 0) {
            RenderZeroItemCase();
            return;
        }
        var feedSource = AllFeedItems[curFeed].parent.feed.title;
        var feedPubDate = '';
        try {
            Configuration.Configuration.DateTimeFormat=Configuration.Configuration.DateTimeFormat?Configuration.Configuration.DateTimeFormat:'d-MMM-yyyy';
            var pubdate=Date.parse(AllFeedItems[curFeed].publishedDate);
            feedPubDate = pubdate.toString(Configuration.Configuration.DateTimeFormat);
        }
        catch (err) {
            feedPubDate = '';
        }
        $(slctrFeedInfo).html(feedSource + ' ' + feedPubDate);
        $(slctrTitle).html(AllFeedItems[curFeed].title);
        $(slctrContent).html(AllFeedItems[curFeed].content);
         
         if(isToRemoveFormatting()){
            $('#contentfeed *').removeAttr("style");
            $('#contentfeed font').removeAttr("size");
            $('#contentfeed font').removeAttr("color");    
        }
        curFeedItem = AllFeedItems[curFeed];
        setALlLinksToOpenInNewWindow();
        setTimeout(getTimerForMarkingAsRead(curFeedItem), 500);
        $('html,body').stop(true,true);
        $('html,body').animate({
            scrollTop: 0
        }, {
            duration: 'fast',
            easing: 'swing'
        });
        applyColor();
    } /*This is a function generator */

    function getSneakPeekClickHandler(i) {
        return function() {
            if (i < AllFeedItems.length && i >= 0) {
                curFeed = i;
                ToggleSeekPeek();
            }
        };
    }
    function feedPopulator(){
        if(isAllFeedsDirty){
            updateList();
        }
        updateLoadingStatus();
        setTimeout(feedPopulator,3000);
    }
    function setSnkpkImage(ImgUrl,snkpkItemIdSelector){
             var newImg = new Image();
            newImg.src = ImgUrl;
            $(newImg).load(function(){
				console.log("Width:"+newImg.width +"Height:" +newImg.height);
                if(newImg.width>100 || newImg.height>100){
                    var thumbImg = $('<img>');
                    $(thumbImg).attr('src',ImgUrl);
                    if(newImg.width>=newImg.height || newImg.width<210){
                        $(thumbImg).addClass('snkpkthumbW');    
                    }
                    else{
                        $(thumbImg).addClass('snkpkthumbH');    
                    }
                    $(snkpkItemIdSelector).find('.spimgwrap').html(thumbImg);
                    $(snkpkItemIdSelector).addClass('sponimg');
                    //$(snkpkItemIdSelector).find('.spContent').remove();
                    //var cssprop="url('"+ImgUrl+"')"
                     //$(snkpkItemIdSelector).css("background-image",cssprop);
                }
                else{
					console.log('discarded this image object');
                    console.log(newImg);
                }
            });
    }
    function updateSneakPeekHtml() {
        $(slctrSneakPeek).html('');
        var len = AllFeedItems.length;
        var i = 0;
        for (i = 0; i < len; i++) {
            var title = AllFeedItems[i].title;
            var content = AllFeedItems[i].contentSnippet;
            var feedSource = AllFeedItems[i].parent.feed.title;
            var feedPubDate = '';
            try {
                Configuration.Configuration.DateTimeFormat=Configuration.Configuration.DateTimeFormat?Configuration.Configuration.DateTimeFormat:'d-MMM-yyyy';
                var pdate=Date.parse(AllFeedItems[i].publishedDate);
                feedPubDate = pdate.toString(Configuration.Configuration.DateTimeFormat);
            }
            catch (err) {
                feedPubDate = '';
            }
            var meInfo = feedSource + ' ' + feedPubDate;
            if (content.length < 3) {
                content = 'Simple Dummy text.';
            }
            var spItem = $('<div>');
            spItem.addClass('spitem');
            if (i === curFeed) {
                spItem.addClass('spselected');
            }
             
             
            spItem.attr('id', 'snkpkID' + i); 
            var spTitle = $('<h3>'); /*title*/
            $(spTitle).html(title); /*Source*/
            var spSrc = $('<span>');
            $(spSrc).html(meInfo);
            spSrc.addClass('spSmall'); 
            var spContent = $('<p>');/*Content*/
            spContent.addClass('spContent'); 
            spContent.html(content);
            
            var sptextwrapper = $('<div>');
            $(sptextwrapper).addClass('sptxtwrap');
            $(sptextwrapper).append(spSrc);
            $(sptextwrapper).append(spTitle);
            $(sptextwrapper).append(spContent);
            
            var spimgwrapper = $('<div>');
            $(spimgwrapper).addClass('spimgwrap');
            
            $(spItem).append(spimgwrapper);
            $(spItem).append(sptextwrapper);
            $(spItem).append('<br>');
            $(slctrSneakPeek).append(spItem);
            $('#snkpkID' + i).click(getSneakPeekClickHandler(i));
            if(isToShowImagesInSeakPeekView()){
                var imgURL='';
                try{
                    imgURL=$(AllFeedItems[i].content).find("img").attr('src');;
                    if (imgURL !== undefined && imgURL !== null) {
                        setSnkpkImage(imgURL,'#snkpkID' + i);
                        console.log('from'+AllFeedItems[i].title+'>>'+imgURL);
                    }
                }catch(exp){
                    console.log('error from'+AllFeedItems[i].title+'>>'+imgURL);
                }    
            }
        }
        applyColor();
    }
    function updateList() {
        var len = feedResults.length;
        var aAllFeedItems = [];
        var isCurFeedChanged = false;
        var i = 0;
        //Save feeds
        try {
                window.localStorage.setItem(StorageItemOfflineFeeds, JSON.stringify(feedResults, function(k, v) {
                    return ((k === 'parent') ? undefined : v);
                }));
            } catch (err) {}
        //extract AllFeedItems
        for (i = 0; i < len; i++) {
            if (feedResults[i] !== undefined && feedResults[i] !== null && feedResults[i].feed.title !== undefined) {
                pushFeedItems(feedResults[i], aAllFeedItems);
            }
        }
        if (curFeed > aAllFeedItems.length - 1) {
            curFeed = aAllFeedItems.length - 1;
            isCurFeedChanged = true;
        }
        if (aAllFeedItems.length === 0) {
            curFeed = -1;
            isCurFeedChanged = true;
        }
        else if (curFeed < 0) {
            curFeed = 0;
            isCurFeedChanged = true;
        }
        AllFeedItemsCount = aAllFeedItems.length;
        AllFeedItems = aAllFeedItems;
        updateUnReadItemCount(false);
        updateSneakPeekHtml();
        if (!(isConfigMode || isSneakPeekMode)) {
            if (isCurFeedChanged) {
                RenderFeedItem();
            }
        }
        isAllFeedsDirty=false;
    }
    function updateLoadingStatus(){
        if(numOfFeedsWaiting>0){
            $(scltrStatus).html('Feeding....'+numOfFeedsWaiting+' more items');
        }else{
            $(scltrStatus).html('');
        }
    }
    function getCallbackForEventFeedReady(index) {
        updateLoadingStatus();
        return function(result) {
            copyMarkAsReadFlag(result, feedResults[index]);
            feedResults[index] = result;
            isAllFeedsDirty=true;
            numOfFeedsWaiting--;
        };
    }

    function isFeedRequiredToUpdate(i) {
        if (feedResults[i] !== undefined && feedResults[i] !== null && feedResults[i].feed.title !== undefined) {
            var j = 0;
            var feedEntries = feedResults[i].feed.entries;
            var count = feedEntries.length;
            for (j = 0; j < count; j++) {
                if (feedEntries[j].IsThisItemRead !== true) {
                    return false;
                }
            }
            return true;
        }
        return true;
    }

    function setDelayedFeedLoader(FeedUrl, FeedPosition, delay) {
        numOfFeedsWaiting++;
        setTimeout(function() {
            try {
                var feed = new google.feeds.Feed(FeedUrl);
                feed.load(getCallbackForEventFeedReady(FeedPosition));
            }
            catch (err) {}
        }, delay);
        console.log('Loading ' + FeedUrl + ' at ' + delay);
    }
/***********************************************
 *              Extrenal Functions
************************************************/    
    function LoadFeed() {
        applyFont();
        applyWidth();
        var subscriptions = Configuration.Configuration.Subscriptions;
        var urlslen = subscriptions.length;
        var i = 0;
        var delay = false;
        var delayfactor = 0;
        for (i = 0; i < urlslen; i++) {
            if (!isFeedRequiredToUpdate(i)) {
                continue;
            }
            if (delay) {
                var feedTiringFactor = 0;
                if (delayfactor > 60) {
                    feedTiringFactor = 200;
                }
                setDelayedFeedLoader(subscriptions[i].url, i, (50 + feedTiringFactor) * delayfactor);
            }
            else {
                try {
                    numOfFeedsWaiting++;
                    var feed = new google.feeds.Feed(subscriptions[i].url);
                    feed.load(getCallbackForEventFeedReady(i));
                }
                catch (err) {}
            }
            delayfactor++;
        }
        setTimeout(feedPopulator,1000);
    }
    function ShareOnTwitter() {
        if (curFeedItem !== null) {
            var link = curFeedItem.link;
            var msg = removeUnicode(curFeedItem.title);
            var baseurl = 'http://twitter.com/share?url=' + escape(link) + '&text=' + escape(msg);
            window.open(baseurl);
        }
        console.log('share on twitter');
    }
    function ShareOnFaceBook() {
        if (curFeedItem !== null) {
            var baseurl = 'http://www.facebook.com/sharer.php?';
            var u = "u=" + escape(curFeedItem.link);
            var t = "t=" + escape(curFeedItem.title);
            window.open(baseurl + u + '&' + t);
        }
        console.log('share on facbook');
    }
    function NextFeed () {
        if (curFeed < AllFeedItemsCount - 1) {
            $('#snkpkID' + curFeed).removeClass('spselected');
            curFeed++;
            if (isSneakPeekMode) {
                RenderSneakPeek();
            }
            else {
                RenderFeedItem();
            }
            $(slctrSideControlPannel).attr('style', '');
        }
        else {
            //bounceSideButton('right');
            setDelayedBounce('right');
        }
        console.log('NextFeed');
    }
    function PrevFeed() {
        if (curFeed > 0) {
            $('#snkpkID' + curFeed).removeClass('spselected');
            curFeed--;
            if (isSneakPeekMode) {
                RenderSneakPeek();
            }
            else {
                RenderFeedItem();
            }
            $(slctrSideControlPannel).attr('style', '');
        }
        else {
            //bounceSideButton('left');
            setDelayedBounce('left');
        }
        console.log('PrevFeed');
    }
     function OpenBlog() {
        if (curFeedItem !== null) {
            window.open(curFeedItem.link);
        }
        console.log('open win' + curFeedItem.link);
    }
    function ToggleConfiguration () {
        if (!isConfigMode) {
            isSneakPeekMode=false;
            RenderConfigItems();
        } else {
            RenderFeedItem();
        }
        isConfigMode = !isConfigMode;
    }
     function ToggleSeekPeek() {
        if (!isSneakPeekMode) {
            isConfigMode=false;
            RenderSneakPeek();
        } else {
            RenderFeedItem();
        }
        isSneakPeekMode = !isSneakPeekMode;
    }
    function Zoom(isOut) {
        var cssattr = ($.browser.webkit) ? 'zoom' : 'font-size';
        var max = ($.browser.webkit) ? 3.5 : 80;
        var min = ($.browser.webkit) ? 0.25 : 10;
        var curSize = parseFloat($('.entry-content').css(cssattr), 10);
        var multiplicant = 1.2;
        if (isOut) {
            curSize = curSize / multiplicant;
            if(curSize<min){
                return;
            }
        } else {
            curSize = curSize * multiplicant;
            if(curSize>max){
                return;
            }
        }
        $('.entry-content').css(cssattr, curSize);
    }
    function configWidth(){
        var curSize = parseFloat($('#doc2').css('width'), 10);
        try{
            Configuration.Configuration.Width=curSize
        }catch(err){
            console.log("width can not be saved!");
        }
    }
    function ChangeWidth(isUp) {
        var cssattr = 'width';
        var curSize = parseFloat($('#doc2').css(cssattr), 10);
        var multiplicant = 1.1;
        if (isUp) {
            curSize = curSize / multiplicant;
            if(curSize<250){
                return;
            }
        } else {
            curSize = curSize * multiplicant;
            if(curSize>2500){
                return;
            }
        }
        $('#doc2').css(cssattr, curSize);
        configWidth();
    }
    pFr.LoadFeed=LoadFeed;
    pFr.ShareOnTwitter=ShareOnTwitter;
    pFr.ShareOnFaceBook=ShareOnFaceBook;
    pFr.NextFeed=NextFeed;
    pFr.PrevFeed=PrevFeed;
    pFr.OpenBlog=OpenBlog;
    pFr.ToggleConfiguration=ToggleConfiguration;
    pFr.ToggleSeekPeek=ToggleSeekPeek;
    pFr.ChangeWidth=ChangeWidth;
    pFr.Zoom=Zoom;
    pFr.ChangeColor = getColorRotator();
    pFr.ChangeFont= getFontRotator();

    function registerArrowKeysEevent() {
    /*
            Do not  handle arrow keys from outside cus arrow  keys are critical and
            should only be handled in very few exceptional cases!!!!
        */
        $(document).keydown(function(e) {
            if (e.keyCode === 37) {
                if (isConfigMode) {
                    return true;
                }
                PrevFeed();
                return false;
            } else if (e.keyCode === 39) {
                if (isConfigMode) {
                    return true;
                }
                NextFeed();
                return false;
            }
            else if (e.keyCode === 13 || e.keyCode === 32) {
                if (isConfigMode) {
                     return true;
                }
                ToggleSeekPeek();
                return false;
            }
            return true;
        });
    }
    
    function registerResize(){
        $(window).resize(function() {
            applyWidth();
            console.log(document.width);
            return true;
            
        });
    }

    /******************
     Do basic initialization right here
     *******************/
    loadFeedsFromStorage();
    loadConfigFromStorage();
    registerArrowKeysEevent();
    registerResize();
    return pFr;
}(window, document));


