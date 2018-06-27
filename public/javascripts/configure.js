//jQuery scripts
var MAX_STR_LENGTH = 38;
var PAGE_NUM = 5000;

var logger_flag = true;

function setupJquery(svg){
    var elementMap = svg.getElementMap();
    var elements = svg.getElements();

    $("#search-btn").click(function(){
        $('#search-contents').show();
        $('#info-contents').hide();
        $('#filter-contents').hide();
        $('.drawer').drawer('show');
    });

    $("#filter-btn").click(function(){
        $('#search-contents').hide();
        $('#info-contents').hide();
        $('#filter-contents').show();
        $('.drawer').drawer('show');
    });

    $("#info-btn").click(function(){
        $('#search-contents').hide();
        $('#info-contents').show();
        $('#filter-contents').hide();
        $('.drawer').drawer('show');
    });

    $("#nearby-btn").click(function(){
      showNearBy(svg);
    })

    var compressed = false;
    $("#compress-btn").click(function(){
      var top = getTopMessageInViewerWindow(svg);
      var param = svg.getContext();
      if(!compressed){
        svg.compress();
        compressed = true;
      }
      else{
        svg.decompress();
        compressed = false;
      }
      if(svg.isMessageDisplayed(top)){
        svg.locate(top.id, param[4], param[5]);
      }
      else{
        var messages = svg.getMessages();
        var flag = false;
        for(var i = 0; i < messages.length; i++){
          if(messages[i].count > top.count){
            svg.locate(messages[i].id, param[4], param[5]);
            flag = true;
            break;
          }
        }
        if(!flag){
          svg.locate(messages[messages.length - 1].id, param[4], param[5]);
        }
      }
    });

    $(".close").click(function(){
        $('.drawer').drawer('hide');
    });

    var filterCount = 0;
    $("#filter-add").click(function(){
        filterCount ++;
        $(".filter-box").append("<input class='typeahead' id='filter-" + filterCount + "' placeholder='Object/group...' />");
        $('#filter-' + filterCount).typeahead({
            hint: false,
            highlight: true,
            minLength: 1
        },
        {
            name: 'objects',
            source: substringMatcher(objectVocabulary)
        });
    });

    $("#filter-remove").click(function(){
        if(filterCount > 0){
            $("#filter-" + filterCount).parent().remove();
            filterCount --;
        }
    });

    $(".do-filter").click(function(){
        var filterSet = new Set();
        filterSet.add(objectMap.get("external[Mainthread]:"));
        for(var i = 0; i <= filterCount; i++){
            var object = objectMap.get($("#filter-" + i).val());
            if(object != undefined){
                filterSet.add(object);
            }
        }

        var filterList = Array.from(filterSet);
        if(logger_flag){
          var time = new Date();
          $.post( urlLog, {
            time: time,
            type: "Filter",
            param: filterList
          });
        }
        svg = new sd.SDViewer({
          objects: filterList,
          messages: messages,
          groups: [],
          loops: [],
          drawAreaId: "drawArea"
        });
    })

    var substringMatcher = function(strs) {
        return function findMatches(q, cb) {
            var matches, substrRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function(i, str) {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
            });

            cb(matches);
        };
    };

    $('.typeahead').typeahead({
        hint: false,
        highlight: true,
        minLength: 1
    },
    {
        name: 'objects',
        source: substringMatcher(objectVocabulary)
    });

    $(".do-search").click(function(){
        var from = $("#search-from").val();
        if(from.length != 0){
            from = objectMap.get($("#search-from").val()).id;
        }
        var to = $("#search-to").val();
        if(to.length != 0){
            to = objectMap.get($("#search-to").val()).id;
        }
        var message = $("#search-message").val();
        var query = "messages?message[from]=" + from + "&message[to]=" + to + "&message[message]=" + message;
        var urlSearch = "http://localhost:3000/searchMessage/" + query;

        $("#search-result").empty();
        $("#search-result").append("<div class='loader'></div>")

        if(logger_flag){
          var time = new Date();
          $.post( urlLog, {
            time: time,
            type: "Search",
            param: [from, to, message]
          });
        }

        d3.json(urlSearch, function(err, data){
            var temp = [];
            searchResultMap = new Map();
            for(var i = 0; i < data.length; i++){
                if(svg.isMessageDisplayed(data[i])){
                    temp.push(data[i]);
                    searchResultMap.set(data[i].id, data[i].count);
                }
            }
            data = temp;
            var totalPageNum = Math.ceil(data.length / 10)
            var result = "Find " + data.length + " messages. Display 1/" + totalPageNum + " page. "

            $("#search-result").empty();

            $("#search-result").append($("<li role='presentation'></li>").text(result)
                                .append("<input id='search-result-goto'/>")
                                .append("<button id='do-search-result-goto'>Goto</button>"));

            $("#do-search-result-goto").click(function(){
                var page = parseInt($("#search-result-goto").val())
                if(page > 0 && page <= totalPageNum){
                    displaySearchResult(page, 10, data);
                }
            });

            displaySearchResult(1, 10, data);
        });
    });

    function displaySearchResult(pageNum, pageSize, data){
        $(".search-result-content").remove();
        var start = pageSize * (pageNum - 1);
        for(var i = start; i < start + pageSize; i++){
            if(i >= data.length){
                break;
            }
            generateSearchItem(data[i]);
        }
        $(".search-result-item").click(function(){
            var messageId = parseInt($($(this).children()[0]).text());
            if(logger_flag){
              var time = new Date();
              $.post( urlLog, {
                time: time,
                type: "Search-warp",
                param: [messageId]
              });
            }
            var param = svg.getContext();
            var success = svg.locate(messageId, param[4], param[5]);
            if(success){
                $('.drawer').drawer('hide');
            }
            else{
                switchPage(messageId, svg);
            }
        });
    }

    function generateSearchItem(item){
        var from = useDotIfNameTooLong(elementMap.get(item.from).displayName);
        var to = useDotIfNameTooLong(elementMap.get(item.to).displayName);
        var message = useDotIfNameTooLong(item.message);
        $("#search-result").append($("<li role='presentation' class='search-result-content'></li>")
                                    .append($("<button class='search-result-item'></button>")
                                        .append($("<div class='message-id'></div>").text(item.id))
                                        .append($("<div class='message-from'></div>").text(from))
                                        .append($("<div class='message-to'></div>").text(to))
                                        .append($("<div class='message-content'></div>").text(message))
                                    )
                                  );
    }
}

var searchResultMap; // message id => message count
function switchPage(messageId, svg){
    var page = Math.floor(searchResultMap.get(messageId) / PAGE_NUM);
    var urlMsg = "http://localhost:3000/fetchMessage/" + page;
    d3.json(urlMsg, function(err, data) {
        messages = data;
        var param = svg.getContext();
        svg = new sd.SDViewer({
          objects: objects,
          messages: messages,
          groups: groups,
          loops: [],
          drawAreaId: "drawArea"
        });
        var success = svg.locate(messageId, param[4], param[5]);
        if(success){
            $('.drawer').drawer('hide');
        }
        else{
            console.log("error!");
        }
    });
}

function getTopMessageInViewerWindow(svg){
  var viewBoxY = svg.getContext()[3];
  var messages = svg.getMessages();
  for(var i = 0; i < messages.length; i++){
    if(messages[i].position > (viewBoxY + 50)){
      return messages[i];
    }
  }
}

function showNearBy(svg){
  var top = getTopMessageInViewerWindow(svg);
  var hint = svg.getHint();
  if(hint != undefined){
    svg.nearby(hint);
    svg.addHint(hint);
  } else {
    svg.nearby(top);
  }

  var begin = hint != undefined ? hint : top;
  var type = hint != undefined ? "hint" : "top";
  if(logger_flag){
    var time = new Date();
    $.post( urlLog, {
      time: time,
      type: "Nearby",
      param: [begin, type]
    });
  }
}

function useDotIfNameTooLong(name){
    if(name.length > MAX_STR_LENGTH){
        return name.substring(0, MAX_STR_LENGTH) + "...";
    }
    else{
        return name;
    }
}

var t;
var lastScale;
var lastPos;
var width = window.innerWidth;
var height = window.innerHeight - 100;

function reportViewBox(){
  var viewBox = d3.select("svg").attr("viewBox");
  var tokens = viewBox.split(" ");
  var pos = tokens[0] + tokens[1];
  var scale = tokens[2] + tokens[3];
  if(scale != lastScale){
    // usually a zoom operation will modify the position
    lastScale = scale;
    lastPos = pos;
    var time = Date();
    $.post( urlLog, {
      time: time,
      type: "Zoom",
      param: [tokens[0], tokens[1], tokens[2] / width, tokens[3] / height]
    });
  }
  else if(pos != lastPos){
    lastPos = pos;
    var time = Date();
    $.post( urlLog, {
      time: time,
      type: "Move",
      param: [tokens[0], tokens[1]]
    });
  }

  t = setTimeout("reportViewBox()", 1000);
}

var urlObj = "http://localhost:3000/fetchObject";
var urlGrp = "http://localhost:3000/fetchGroup";
var urlMsg = "http://localhost:3000/fetchMessage/" + 0;
var urlLog = "http://localhost:3000/sendLogToDB";
var objects;
var groups;
var messages;
var objectVocabulary;
var objectMap;
var objectMap_id;
d3.json(urlObj, function(err, data) {
    if(err){
        console.log("Error while loading objects");
        console.log(err);
    }
    else{
        objects = data;
        objectVocabulary = [];
        objectMap = new Map();
        objectMap_id = new Map();
        for(let object of objects){
            objectVocabulary.push(object.name + ":" + object.type);
            objectMap.set(object.name + ":" + object.type, object);
            objectMap_id.set(object.id, object);
        }
        d3.json(urlGrp, function(err, data) {
            if(err){
                console.log("Error while loading objects");
                console.log(err);
            }
            else{
                groups = data;
                d3.json(urlMsg, function(err, data){
                    if(err){
                        console.log("Error while loading objects");
                        console.log(err);
                    }
                    else{
                        messages = data;
                        console.log( { "objects" : objects,
                                 "groups" : groups,
                                 "messages" : messages
                             });
                        svg = new sd.SDViewer({
                          objects: objects,
                          messages: messages,
                          groups: groups,
                          loops: [],
                          drawAreaId: "drawArea"
                        });
                        // add log function
                        if(logger_flag){
                          // Initial window size
                          var time = Date();
                          $.post( urlLog, {
                            time: time,
                            type: "InitSize",
                            param: [width, height]
                          });
                          svg.logger.output = function(log){
                            $.post(urlLog, log);
                          };
                          reportViewBox();
                        }
                        setupJquery(svg);
                    }
                });
            }
        });
    }
});
