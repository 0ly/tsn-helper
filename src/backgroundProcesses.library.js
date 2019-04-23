import md5 from './lib/md5.js'
import settings from './lib/settings.js'
import showUpdates from './lib/showUpdates.js'
import cardData from './MLBTSNCardData.library.js'
import moment from './lib/moment.js'


var topOrderHashPageOne = '';

function completedOrdersCheck(page=1) {
    if(md5(settings.superSecret) == '2c3005677d594560df2a9724442428d1' || md5(settings.superSecret) == '68839b25c58e564a33e4bfee94fa4333') {
    if ( typeof $ !== "undefined" && typeof toastr !== "undefined") {
var url = 'https://mlb19.theshownation.com/community_market/orders/completed';
if ( page > 1 ) {
    url += '?page='+page;
}
var foundLast = false;

let lastCompletedOrderHash = '';

if(localStorage.hasOwnProperty('tsn-completedHash')){
    lastCompletedOrderHash = localStorage.getItem('tsn-completedHash');
    }
    else{
        lastCompletedOrderHash =  md5('');
        localStorage.setItem('tsn-completedHash', lastCompletedOrderHash );
    }
            var localDataBuys = {};
                if(localStorage.hasOwnProperty('tsn-purchaseHistory')){
                    localDataBuys = JSON.parse(localStorage.getItem('tsn-purchaseHistory'));
                    }
                 
                 localStorage.setItem('tsn-purchaseHistory',JSON.stringify(localDataBuys));

        // console.log(url);

        $.ajax({url:url}).done(function(b){
            b = b.replace(/<img([^>]*)\ssrc=(['"])([^'"]+)\2/gi, "<img$1 src=$2data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7$2 data-src=$2$3$2");
           // console.log(b);
            b = b.replace(/<script>[^<]+<\/script>/gi, "");
            // b = b.replace('https://s3.amazonaws.com/mlb-theshownation/tsn18/4/img/logos/logo2_wsh.png','https://s3.amazonaws.com/mlb17-shared/dist/7/img_teams/cap/logo2_wsh.png');
            // b = b.replace('https://s3.amazonaws.com/mlb-theshownation/tsn18/4/img/actionshots/3785374b5e5df43203dc02054105cf58.jpg','https://s3.amazonaws.com/mlb-theshownation/tsn18/3/img/shared/default-actionshot.jpg');
            b = $.parseHTML(b);

            

            var topOrder = $(b).find('.completed-orders-table tbody tr')[0];
            const topOrderHash = md5(topOrder.innerHTML);
            
            console.log(topOrderHash, lastCompletedOrderHash);

            if (topOrderHash != lastCompletedOrderHash)
            {
                if(page == 1) { topOrderHashPageOne = topOrderHash;  }

                console.log("new order");

                var foundLast = false;

            $(b).find('.completed-orders-table tbody tr').each(function(i){
                if (md5(this.innerHTML) == lastCompletedOrderHash ) {
                    foundLast = true;
                    localStorage.setItem('tsn-completedHash', topOrderHashPageOne );
                }
                if (!foundLast) {
                    var item = $(this).find('a')[0];
                    var itemName = item.text;
                    var itemId = item.href.match(/[^\/]+$/g);

                    var itemBuyOrSell = $(this).find('td')[1].innerText.match(/([^\s]+)\sfor/)[1];
                    var itemPrice = parseInt($(this).find('td')[1].innerText.replace(/,/,'').match(/\d+/)[0]);

                    var saleDateTd = $(this).find('td')[2];
                    var dateStringTemplate = "M/D/YYYY h:mmA Z";
                    var thisDate = moment(saleDateTd.textContent.replace(/PDT/g,"-0700"), dateStringTemplate);

                    

                    if (itemBuyOrSell != 'Sold'){
                    
                        if(!localDataBuys[itemId]){
                            localDataBuys[itemId] = {'date': thisDate, 'amount': itemPrice };
                        }
                        else if (moment(localDataBuys[itemId]['date']).isBefore(thisDate) ) {
                            localDataBuys[itemId] = {'date': thisDate, 'amount': itemPrice };
                        }
                        
                    }
                    if ( thisDate.isSame(moment(), 'day') ) {
                        if(settings.chromeNotifications) {
                        chrome.runtime.sendMessage(extensionId, {"itemName": itemName, "itemBuyOrSell": itemBuyOrSell, "itemPrice": itemPrice, "itemId": itemId}, function(response) {
                            console.log(response.msg);
                        });
                        }
                        if(settings.webNotifications) {
                        toastr.info(`${itemName} ${itemBuyOrSell} for ${itemPrice}||${itemId}`);
                        }
                    }
                }

                //var sellable = parseInt($($(this).parent().parent().find('.owned')[1]).text().match(/\d+/g));
                //links.push({'team': team, 'sellable': sellable, 'url': $(this).attr('href'), 'name':$($(this).parent().parent().find('.name')[0]).text(), 'rating':$($(this).parent().parent().find('.overall')[0]).text()});
                });
                localStorage.setItem('tsn-purchaseHistory',JSON.stringify(localDataBuys));
                if(!foundLast &&  lastCompletedOrderHash !=  md5('') && page <= 10) {
                    completedOrdersCheck(page+1);
                }
                else {
                    localStorage.setItem('tsn-completedHash', topOrderHashPageOne );
                    openOrdersInterval = setInterval(openOrdersCheck,5000);
                }

            }
            else
            {
                console.log("No new order")
                openOrdersInterval = setInterval(openOrdersCheck,5000);
            }

            
            

        });
        }
        else {
            setTimeout(completedOrdersCheck, 200);
        }
    }
}

var buyAmount = 0;
var sellAmount = 0;
var balanceAmt = 0;
var balancePlusBuysAmt = 0;

function openOrdersCheck() {
    clearInterval(openOrdersInterval);
    // https://mlb19.theshownation.com/community_market/orders/open
    if ( typeof $ !== "undefined" && $('#helperStubsDiv2').length > 0) {
        
        var url = 'https://mlb19.theshownation.com/community_market/orders/open';
        $.ajax({url:url}).done(function(b){
            b = b.replace(/<img([^>]*)\ssrc=(['"])([^'"]+)\2/gi, "<img$1 src=$2data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7$2 data-src=$2$3$2");
           // console.log(b);
            b = b.replace(/<script>[^<]+<\/script>/gi, "");
            // b = b.replace('https://s3.amazonaws.com/mlb-theshownation/tsn18/4/img/logos/logo2_wsh.png','https://s3.amazonaws.com/mlb17-shared/dist/7/img_teams/cap/logo2_wsh.png');
            // b = b.replace('https://s3.amazonaws.com/mlb-theshownation/tsn18/4/img/actionshots/3785374b5e5df43203dc02054105cf58.jpg','https://s3.amazonaws.com/mlb-theshownation/tsn18/3/img/shared/default-actionshot.jpg');
            b = $.parseHTML(b);
            var numBuys = $(b).find('.buy-orders-table tbody tr').length;
            var numSells = $(b).find('.sell-orders-table tbody tr').length;
            buyAmount = 0;
            sellAmount = 0;

            if ( numBuys > 0 ) {
                $(b).find('.buy-orders-table tbody tr td:nth-child(2)').each( function(i) {
                    
                    buyAmount = buyAmount + parseInt($(this)[0].textContent.replace(/[^\d]/gi, ''));
                });
                
            }
            if ( numSells > 0 ) {
                $(b).find('.sell-orders-table tbody tr td:nth-child(2)').each( function(i) {
                    sellAmount = sellAmount + parseInt($(this)[0].textContent.replace(/[^\d]/gi, ''));
                });
                
            }

            completedOrdersCheck();
            initialStubsCheck();

            chrome.runtime.sendMessage(extensionId, {"openBuys": numBuys, "openSells": numSells, "buyAmount": buyAmount, "sellAmount": sellAmount}, function(response) {
                console.log(response.msg);
             });
        });

    }
    else{
        setTimeout(openOrdersCheck, 200)
    }

}
var openOrdersInterval = setInterval(openOrdersCheck,20000);

var doneInitial = false;
function initialStubsCheck() {
    if (typeof $ !== "undefined" && $('#helperStubsDiv').length > 0) {
        var url = 'https://mlb19.theshownation.com/dashboard';
        $.ajax({url:url}).done(function(b){
            b = b.replace(/<img([^>]*)\ssrc=(['"])([^'"]+)\2/gi, "<img$1 src=$2data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7$2 data-src=$2$3$2");
           // console.log(b);
            b = b.replace(/<script>[^<]+<\/script>/gi, "");
            // b = b.replace('https://s3.amazonaws.com/mlb-theshownation/tsn18/4/img/logos/logo2_wsh.png','https://s3.amazonaws.com/mlb17-shared/dist/7/img_teams/cap/logo2_wsh.png');
            // b = b.replace('https://s3.amazonaws.com/mlb-theshownation/tsn18/4/img/actionshots/3785374b5e5df43203dc02054105cf58.jpg','https://s3.amazonaws.com/mlb-theshownation/tsn18/3/img/shared/default-actionshot.jpg');
            b = $.parseHTML(b);
            balanceAmt = parseInt($(b).find('.currency-widget-amount')[0].textContent.replace(/[^\d]/gi,''));
            balancePlusBuysAmt = balanceAmt + buyAmount;
            chrome.runtime.sendMessage(extensionId, {"balanceAmt": balanceAmt, "balancePlusBuysAmt": balancePlusBuysAmt}, function(response) {
                console.log(response.msg);
             });
        });
        if(!doneInitial){
            doneInitial = true;
            openOrdersCheck();
        }

    }
    else {
        setTimeout(initialStubsCheck, 200)
    }

}
initialStubsCheck();