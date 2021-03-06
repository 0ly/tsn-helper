import md5 from './lib/md5.js'
import settings from './lib/settings.js'
import cardData from './MLBTSNCardData.library.js'



function pickHex(weight, temp="hot") {
    var color1, color2;
    if (temp == "hot") {
        color2 = [255,255,0];
        color1 = [255,0,0];
    }
    else if (temp == "warm") {
        color2 = [255,255,255];
        color1 = [255,255,0];
    }
    else {
        color2 = [0,0,255];
        color1 = [255,255,255];
    }
    var p = weight;
    var w = p * 2 - 1;
    var w1 = (w/1+1) / 2;
    var w2 = 1 - w1;
    var rgba = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2),
        0.4];
    return rgba;
}


var notifiedURL = '';

var openTimeout;

var firstTimeSell = {};
var notified = {};
var notifiedSell = {};
var helperFrame;
var tables;
var sort;


function openOrderHelper(specificTarget=''){
    var firstTime = {};
    console.log(specificTarget);
   
    $('.item-name').css('width','20%');

    var cardSelector;
    
        clearTimeout(openTimeout);
        if (specificTarget != ''){
            
            cardSelector = document.querySelectorAll('table tbody tr td:nth-child(1) a[href="'+specificTarget+'"]');
    
        } 
        else {
        cardSelector = document.querySelectorAll('table tbody tr td:nth-child(1) a'); 
        }
    
        var howMany = cardSelector.length;
        var howManyDone = 0;

        cardSelector.forEach(function(v,i){

       var url = v.href;

       if (firstTime[url]) {
          $(v).parent().parent().remove();  
          howManyDone++;
          if (howManyDone == howMany) {
                    
            setRefresh();
            
        }
       }
        else {
            firstTime[url] = true;
        
        

        var thisBuyNowPrice = "";
        var thisSellNowPrice = "";
        var profitMargin = "";
        $.ajax({url:url, context:v}).done(function(b){
            howManyDone++;
            var card = cardData(b, false, url.split('/')[url.split('/').length -1]);
            if (card.errors.length > 1)
            {
                for (var e of card.errors) {
                  toastr["error"](e, "ERROR");
                }

            }
            else
            {
            //console.log(card);
            this.target = 'blank';
            $(this).parent().find('.helperDiv').remove();
            $(this).parent().find('#create-buy-order-form').remove();
            $(this).parent().find('#create-sell-order-form').remove();

            var thisDiv = document.createElement('div');
            thisDiv.className = 'helperDiv';


            $(this).parent().append(thisDiv);
            //$(this).parent().css('display','flex');

            if(isNaN(card.profitMargin)){
               card.profitMargin = -99999;
            }
            if(isNaN(card.minutesPerSale)){
               card.profitMargin = 99999;
            }
            
            $(this).parent().parent().parent().css('background-color','');
            
            // $(this).parent().parent().parent().css('order',1000-(card.profitMargin / (card.minutesPerSale * 2)).toFixed(0));
                if (card[settings.heatFactor] < 0 ) {
                 bgcolor = 'rgba(0,0,255,0.45)';
             }
             else if( card[settings.heatFactor] > settings.hotness ){
                bgcolor = 'rgba(255,0,0,0.45)';
            }
            else if(md5(settings.superSecret) == '2c3005677d594560df2a9724442428d1' ||
                  md5(settings.superSecret) == '68839b25c58e564a33e4bfee94fa4333') {
                var bgcolor = '';

            if ( settings.hotness >= card[settings.heatFactor] && card[settings.heatFactor] > settings.warmness ) {
                bgcolor = 'rgba('+pickHex(parseFloat( ( ( card[settings.heatFactor] - settings.coolness) / ( settings.hotness - settings.coolness ) ).toFixed(2) ), "hot" ).join()+') !important';
            }
            else if ( settings.warmness >= card[settings.heatFactor] && card[settings.heatFactor] > settings.coolness ) {
                bgcolor = 'rgba('+pickHex(parseFloat( ( ( card[settings.heatFactor] - settings.coolness) / ( settings.warmness - settings.coolness ) ).toFixed(2) ), "warm" ).join()+') !important';
            }
                else {
                    bgcolor = 'rgba('+pickHex(parseFloat( ( card[settings.heatFactor] / settings.coolness ).toFixed(2) ) , "cool" ).join()+') !important';
                }


            }
                $(this).parent().parent().css('background-color',bgcolor+' !important');

                var buyTd = $(this).parent().parent().find('td:nth-child(2)');
                buyTd[0].innerHTML = '';
                if (card.sellable > 0) {
                buyTd.append(card.sellForm);
                var sellButton = $(card.sellForm).find("button")[0];
                
                sellButton.innerHTML = "+S";
                sellButton.style.padding = "1px";
                sellButton.style.height = "100%";
                var sellInput = $(card.sellForm).find("input#price")[0];
                sellInput.style.padding = "0px";
                }
                var cancelTd = $(this).parent().parent().find('td:nth-child(3)');
                cancelTd[0].innerHTML = '';
                for ( var cancelButton of card.cancelSellButtons ) {
                    $(cancelTd).append(cancelButton);
                    cancelButton.target = "helperFrame";
                    
                }
                buyTd.append(card.buyForm);
                var buyButton = $(card.buyForm).find('button')[0]
                
                buyButton.innerHTML = "+B";
                buyButton.style.padding = "1px";
                buyButton.style.height = "100%"
                var buyInput = $(card.buyForm).find("input#price")[0];
                buyInput.style.padding = "0px";
                for ( var cancelButton of card.cancelBuyButtons ) {
                    $(cancelTd).append(cancelButton);
                    cancelButton.target = "helperFrame";
                    }

                

                //$(theForm).css('width','50%');
                $(card.buyForm).css('display','flex');
                $($(card.buyForm).find('#price')[0]).val(card.winningBuy ? card.sellNow : card.sellNow+1);
                card.buyForm.target = "helperFrame";


                //$(this).parent().append(card.sellForm);
                //$(theForm).css('width','50%');
                $(card.sellForm).css('display','flex');
                $($(card.sellForm).find('#price')[0]).val(card.winningSell ? card.buyNow : card.buyNow-1);
                card.sellForm.target = "helperFrame";
                //$($(this).parent().parent().children()[1]).append("<div class=\"helperDiv\" style=\"background-color:yellow; color:red\"><span class=\"stubs\"> </span> "+thisSellNowPrice+"</div>");
                
                if (howManyDone == howMany) {
                    
                    setRefresh();
                    
                }
            }
        
        });
    }

    });
}



function setRefresh(interval=undefined) {
    // console.log("Debug3");
    

        var refreshInterval = interval ? interval : settings.refreshMarketIntervalOpen * 1000 ;
            if (refreshInterval > 0){
                openTimeout = setTimeout(openOrderHelper,refreshInterval);
            }
    
}


function go() {
    'use strict';
    if( typeof $ !== 'undefined'  && ( $('.buy-orders-table thead').length > 0 || $('.sell-orders-table thead').length > 0 ) ){

    //$('.marketplace-main-heading').children()[0].append(" ("+$('.order').length+")");
    //$('.marketplace-main-heading').append('<div style="float:right">Refresh interval: <input id="refresh-interval" size="5" value=".5"></input></div>');


    //favoritesTimeout = setTimeout(orderHelper,60000);



    helperFrame = document.createElement('iframe');
    helperFrame.id = 'helperFrame';
    helperFrame.style.webkitTransform = 'scale(1.5)';
    helperFrame.style.transformOrigin = '0 0';
    helperFrame.style.height ='300px';
    helperFrame.style.width = '500px';
    helperFrame.style.zIndex = '99999';
    helperFrame.style.position = 'fixed';
    helperFrame.style.bottom = '1px';


    helperFrame.name = 'helperFrame';
    // helperFrame.sandbox = 'allow-same-origin';
    if (!settings.showBuyFrame ) {
        helperFrame.style.height ='1px';
    }
    $('.sidebar-section-top-inner').append(helperFrame);
    helperFrame.onload = function(){
                      //  toastr["success"]("Order created","Done!");
                      
                      openOrderHelper(this.contentDocument.location.href);


                        }

    openOrderHelper();

    window.addEventListener('message', receiver, false);
    function receiver(e) {
        if(e.data.hasOwnProperty('itemName'))
         {
            if(settings.webNotifications) {
                var url = `https://mlb19.theshownation.com/community_market/listings/${e.data.itemId}`
                fetch(url).
                then( function(response) {
                if (response.ok) {
                    return response.text()
                  } else {
                    var error = new Error(response.statusText)
                    error.response = response
                    throw error
                  }
            } ).
            then( function (text) {
                text = text.replace(/<img([^>]*)\ssrc=(['"])([^'"]+)\2/gi, "<img$1 src=$2data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7$2 data-src=$2$3$2");
                text = text.replace(/<script>[^<]+<\/script>/gi, "");
                text = text.replace(/<link[^>]+>/gi, "");
                var card = cardData(text, false, e.data.itemId);
                $(card.buyForm).css('display','flex');
                card.buyForm.target = "helperFrame";


                //$(this).parent().append(card.sellForm);
                //$(theForm).css('width','50%');
                $(card.sellForm).css('display','flex');
                card.sellForm.target = "helperFrame";

                toastr.info(`${card.buyForm.outerHTML.replace(/data-value/g,'value')} ${card.sellForm.outerHTML.replace(/data-value/g,'value')}`, `${e.data.itemName} ${e.data.itemBuyOrSell} for ${e.data.itemPrice}`);
            }).catch(function(e) { console.log(e)});

              
                
                }
               
             // <a href="/community_market/listings/58972dceed371780056fb58a04f7ce7e" target="blank">Rival</a>
             openOrderHelper(`https://mlb19.theshownation.com/community_market/listings/${e.data.itemId}`);
             // console.log(e.data)
         }
        
        return Promise.resolve("Dummy response to keep the console quiet");
    }

} else {
    console.log("Waiting ... ");
    setTimeout(go, 200);
}

    //setTimeout(completedOrders,(1000*15));



}
go();