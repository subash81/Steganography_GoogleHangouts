<script>
function showParticipants() {
  var participants = gapi.hangout.getParticipants();
  var retVal = '<p>Participants: </p><ul>';
  for (var index in participants) {
    var participant = participants[index];
    if (!participant.person) {
      retVal += '<li>A participant not running this app</li>';
    }
    retVal += '<li>' + participant.person.displayName + '</li>';
  }
  retVal += '</ul>';
  var div = document.getElementById('participantsDiv');
  div.innerHTML = retVal;
}

function sendMessage(){
var message = document.getElementById("messageInput").value;
var stenMessage = window.steganography.embedding(message,document.getElementById('img').src);	
var imgMsg = document.getElementById("imgSteg");	
imgMsg.src=stenMessage;
var delay = 5;
  var charSlice = 7500;
  var terminator = "\n";
  var data = stenMessage;
  var dataSent = 0;
  var intervalID = 0;
  var seqNum =0;
while(dataSent<data.length){ 
    var slideEndIndex = dataSent + charSlice;
    if (slideEndIndex > data.length) {
      slideEndIndex = data.length;
    }
   	 gapi.hangout.data.setValue("Key"+seqNum , data.slice(dataSent, slideEndIndex));
	 seqNum++;
    dataSent = slideEndIndex;
    if (dataSent + 1 >= data.length) {     
      gapi.hangout.data.setValue("transfer","true");
	  gapi.hangout.data.setValue("keys" ,"Key"+seqNum);
    }
  }   
}

var transferState;
  
function init() {
 gapi.hangout.data.onStateChanged.add(
  function(StateChangedEvent){
  
  var dataRec=" ";
  var numKey =  gapi.hangout.data.getValue("keys"); 
   var totKey = numKey.substr(3,10);   
  transferState = gapi.hangout.data.getValue("transfer");
  
  if(transferState == "true"){
   var meta =  gapi.hangout.data.getStateMetadata();
   var senderId=meta["transfer"]["lastWriter"];    
   var locPartId = gapi.hangout.getLocalParticipantId();
	if(senderId != locPartId){
  for(i=0;i<=totKey-1;i++)
  {  
  dataRec=dataRec.concat(gapi.hangout.data.getValue("Key"+i)); 
  }
  var dec = window.steganography.extraction(dataRec);
  var div = document.getElementById('messageDiv');
  div.innerHTML = dec;
   gapi.hangout.data.setValue("transfer","false");
   }
  }  
  }
  );

gapi.hangout.data.onMessageReceived.add( 	   function(MessageReceivedEvent){
	   
});
  
  gapi.hangout.onApiReady.add(
      function(eventObj) {
        if (eventObj.isApiReady) {
          document.getElementById('showParticipants')
            .style.visibility = 'visible';
        }				
      });	

	  var clientId = '989443731264-dvm1t58ousjfr080sjvksj5jah3jcs4q.apps.googleusercontent.com';
	  var apiKey = 'AIzaSyDxVGV0-KTxjNFQ3cASXPeVmC7gP6dyI98';
	  var scopes = 'https://www.googleapis.com/auth/hangout.participants';
	  function handleClientLoad() {
	    gapi.client.setApiKey(apiKey);
	    window.setTimeout(checkAuth,1);
	  }

	  function checkAuth() {
	    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
	  }

	  function handleAuthResult(authResult) {	   
	  }
	  }

gadgets.util.registerOnLoadHandler(init);

(function(s) {  
  
  function Cover() {};
  
  var reUse = {
   
    "getNextPrime" : function(inNum) {
      for(var sVal=inNum; true; sVal+=1)
        if(reUse.CheckPrime(sVal)) return sVal;
    },
    "getSum" : function(arrVal, end, choice) {
      var getSum = 0;
      choice = choice || {};
      for(var inNum = choice.start || 0; inNum < end; inNum+=(choice.inc||1))
        getSum += arrVal(inNum) || 0;

      return (getSum === 0 && choice.defValue ? choice.defValue : getSum);
    },
	 "createSubArrayFromArgs" : function(args,indx,threshold) {
      var retArr = new Array(threshold-1);
      for(var inNum = 0; inNum < threshold; inNum+=1)
        retArr[inNum] = args(inNum >= indx ? inNum+1:inNum);

      return retArr;
    },
    "productOf" : function(arrVal, end,choice ) {
      var prod = 1;
      choice = choice || {};
      for(var inNum = choice.start || 0; inNum < end; inNum+=(choice.inc||1))
        prod *= arrVal(inNum) || 1;

      return (prod === 1 && choice.defValue ? choice.defValue : prod);
    },
	 "CheckPrime" : function(inNum) {
      if (isNaN(inNum) || !isFinite(inNum) || inNum%1 || inNum<2) return false;
      if (inNum%2==0) return (inNum==2);
      if (inNum%3==0) return (inNum==3);
      var sqroot=Math.sqrt(inNum);
      for (var sVal=5;sVal<=sqroot;sVal+=6) {
        if (inNum%sVal==0) return false;
        if (inNum%(sVal+2)==0) return false;
      }
      return true;
    }
   
  };

  Cover.prototype = {
    "configuration": {      
      "threshold": 1,
      "unitCodeSize": 16,
	  "t": 3,
      "args": function(i) { return i+1; },
	  "completedMsg": function(data, i, threshold) {
                var f = true;
                for(var inNums = 0; inNums < 16 && f; inNums+=1) {
                  f = f && (data[i+inNums*4] === 255);
                }
                return f;
              },
      "delimiterMsg": function(modMessage,threshold) {
                var delimiter = new Array(threshold*3);
                for(var inNum = 0; inNum < delimiter.length; inNum+=1)
                  delimiter[inNum] = 255;
                
                return delimiter;
              }
      
    },
    "embedding": function(msg, pict, choice) {
      choice = choice || {};
      var configuration = this.configuration;

      var sCanvas = document.createElement('canvas'),
        sCtx = sCanvas.getContext('2d');

      sCanvas.style.display = 'none';

      if(pict.length) {
        var imageURL = pict;
        pict = new Image();
        pict.src = imageURL;
      }
      sCanvas.width = choice.width || pict.width;
      sCanvas.height = choice.height || pict.height;
      if(choice.height && choice.width) {
        sCtx.drawImage(pict, 0, 0, choice.width, choice.height );
      } else {
        sCtx.drawImage(pict, 0, 0);
      }
      

      var imageInfo = sCtx.getImageData(0, 0, sCanvas.width, sCanvas.height),
        data = imageInfo.data;
   
      var t = choice.t || configuration.t,
        threshold = choice.threshold || configuration.threshold,
        unitCodeSize = choice.unitCodeSize || configuration.unitCodeSize,
        bundleCount = unitCodeSize/t >> 0,
        ovrlapBitCount = unitCodeSize%t,
        delimiterMsg = choice.delimiterMsg || configuration.delimiterMsg,
        args = choice.args || configuration.args,
        primeNum = reUse.getNextPrime(Math.pow(2,t)),
        decNum, oldDecNum, oldMaskNum, modMsg = [], left, right;

      for(var inNum=0; inNum<=msg.length; inNum+=1) {
      
        var curDec = msg.charCodeAt(inNum) || 0, curOvrlapBitCount = (ovrlapBitCount*inNum)%t, initialMask;
        if(curOvrlapBitCount > 0 && oldDecNum) {
          initialMask = Math.pow(2,t-curOvrlapBitCount) - 1;
          oldMaskNum = Math.pow(2, unitCodeSize) * (1 - Math.pow(2, -curOvrlapBitCount));
          left = (curDec & initialMask) << curOvrlapBitCount;
          right = (oldDecNum & oldMaskNum) >> (unitCodeSize - curOvrlapBitCount);
          modMsg.push(left+right);

          if(inNum<msg.length) {
            initialMask = Math.pow(2,2*t-curOvrlapBitCount) * (1 - Math.pow(2, -t));
            for(var j=1; j<bundleCount; j+=1) {
              decNum = curDec & initialMask;
              modMsg.push(decNum >> (((j-1)*t)+(t-curOvrlapBitCount)));
              initialMask <<= t;
            }
            if((ovrlapBitCount*(inNum+1))%t === 0) {
              initialMask = Math.pow(2, unitCodeSize) * (1 - Math.pow(2,-t));
              decNum = curDec & initialMask;
              modMsg.push(decNum >> (unitCodeSize-t));
            }
            else if(((((ovrlapBitCount*(inNum+1))%t) + (t-curOvrlapBitCount)) <= t)) {
              decNum = curDec & initialMask;
              modMsg.push(decNum >> (((bundleCount-1)*t)+(t-curOvrlapBitCount)));
            }
          }
        }
        else if(inNum<msg.length) {
          initialMask = Math.pow(2,t) - 1;
          for(var j=0; j<bundleCount; j+=1) {
            decNum = curDec & initialMask;
            modMsg.push(decNum >> (j*t));
            initialMask <<= t;
          }
        }
        oldDecNum = curDec;
      }
      
      var start, indx, subStart, dlmtr = delimiterMsg(modMsg,threshold);
      for(start = 0; (start+threshold)*4 <= data.length && (start+threshold) <= modMsg.length; start += threshold) {
        var p, pS=[];
        for(var inNum=0; inNum<threshold && inNum+start < modMsg.length; inNum+=1) {
          p = 0;
          for(var j=start; j<threshold+start && j<modMsg.length; j+=1)
            p+=modMsg[j]*Math.pow(args(inNum),j-start);
          pS[inNum] = (255-primeNum+1)+(p%primeNum);
        }
        for(var inNum=start*4; inNum<(start+pS.length)*4 && inNum<data.length; inNum+=4)
          data[inNum+3] = pS[(inNum/4)%threshold];
        
        subStart = pS.length;
      }
     
      for(indx = (start+subStart); indx-(start+subStart)<dlmtr.length && (start+dlmtr.length)*4<data.length; indx+=1)
        data[(indx*4)+3]=dlmtr[indx-(start+subStart)];
    
      for(var inNum=((indx+1)*4)+3; inNum<data.length; inNum+=4) data[inNum] = 255;

      imageInfo.data = data;
      sCtx.putImageData(imageInfo, 0, 0);

      return sCanvas.toDataURL();
    },
    "extraction": function(pict, choice) {
      choice = choice || {};
      var configuration = this.configuration;
      
      var t = choice.t || configuration.t, threshold = choice.threshold || configuration.threshold,
        unitCodeSize = choice.unitCodeSize || configuration.unitCodeSize, primeNum = reUse.getNextPrime(Math.pow(2, t)),
        imageInfo, data, q, args = choice.args || configuration.args, modMessage = [], 
        completedMsg = choice.completedMsg || configuration.completedMsg;

      if((t < 1 && t > 7) || !t) throw "Error: Set value t = " + t + " is not in valid range: 0 < t < 8";
        
      var sCanvas = document.createElement('canvas'),
        sCtx = sCanvas.getContext('2d');

      sCanvas.style.display = 'none';
      document.body.appendChild(sCanvas);

      if(pict.length) {
        var dataURL = pict;
        pict = new Image();
        pict.src = dataURL;
      }
      sCanvas.width = choice.width || pict.width;
      sCanvas.height = choice.width || pict.height;
      if(choice.height && choice.width) {
        sCtx.drawImage(pict, 0, 0, choice.width, choice.height );
      } else {
        sCtx.drawImage(pict, 0, 0);
      }

      imageInfo = sCtx.getImageData(0, 0, sCanvas.width, sCanvas.height);
      data = imageInfo.data;

      if (threshold === 1) {
        for(var inNum=3, finish=false; !finish && inNum<data.length && !finish; inNum+=4) {
          finish = completedMsg(data, inNum, threshold);
          if(!finish) modMessage.push(data[inNum]-(255-primeNum+1));
        }
      } else {
        for(var a = 0, finish=false; !finish; a+=1) {
          p = [];
          for(var inNum=(a*threshold*4)+3; inNum<(a+1)*threshold*4 && inNum<data.length && !finish; inNum+=4) {
            finish = completedMsg(data,inNum,threshold);
            if(!finish) p.push(data[inNum]-(255-primeNum+1)); 
          }
          if(p.length === 0) continue;
         
          var coeffVar = (function(inNum) {
            if(inNum >= p.length) return [];
            return [p[inNum]*
            reUse.productOf(function(j) {
            if(j != inNum) {
              return reUse.productOf(function(l) {
              if(l != j) return (args(j) - args(l));
              }, p.length);
            }
            }, p.length)].concat(arguments.callee(inNum+1));
          }(0));
          
          var coeffVarOrdr = function(ordr, varIndx) {
            var workArgs = reUse.createSubArrayFromArgs(args,varIndex,p.length), maxRecLen = p.length - (ordr+1);
            return (function(firstIndx, lastIndx, recDepthLen) {
            var recall = arguments.callee;
            return reUse.getSum(function(inNum) {
              if(recDepthLen < maxRecLen)
              return workArgs[inNum]*recall(inNum+1,firstIndx+ordr+2,recDepthLen+1);
            }, lastIndx, {"start": firstIndx, "defValue": 1});
            }(0,ordr+1,0));
          };
        
          var commDeno = reUse.productOf(function(inNum) {
            return reUse.productOf(function(j) {
            if(j != inNum) return (args(inNum) - args(j));
            }, p.length);
          }, p.length);

          for(var inNum = 0; inNum < p.length; inNum+=1) {
            modMessage.push((((Math.pow(-1,p.length-(inNum+1))*reUse.getSum(function(j) {
            return coeffVarOrdr(inNum,j)*
            coeffVar[j];
            }, p.length))%primeNum)+primeNum)%primeNum); 
          }
        }
      }

      var msg = "", charCodeVal = 0, bitCntVal = 0, maskVal = Math.pow(2, unitCodeSize)-1;
      for(var inNum = 0; inNum < modMessage.length; inNum+=1) {
        charCodeVal += modMessage[inNum] << bitCntVal;
        bitCntVal += t;
        if(bitCntVal >= unitCodeSize) {
          msg += String.fromCharCode(charCodeVal & maskVal);
          bitCntVal %= unitCodeSize;
          charCodeVal = modMessage[inNum] >> (t-bitCntVal);
        }
      }
      if(charCodeVal !== 0) msg += String.fromCharCode(charCodeVal & maskVal);

      return msg;
    },
    "getHidCap" : function(pict, choice) {
      choice = choice || {};
      var configuration = this.configuration;
    
      var widthImg = choice.width || pict.width,
        heightImg = choice.height || pict.height,
        t = choice.t || configuration.t,
        unitCodeSize = choice.unitCodeSize || configuration.unitCodeSize;
      return t*widthImg*heightImg/unitCodeSize >> 0;
    }
  };
  s.steganography = s.steg = new Cover();
})(window);
</script>