//jQuery scripts
function setupJquery(svg){
    var elementMap = svg.getElementMap();
    var elementSet = svg.getElementSet();

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

    $(".close").click(function(){
        $('.drawer').drawer('hide');
    });

    $(".filter-add").click(function(){
        //console.log($(this).parent()[0]);
        $(".filter-box").append("<div class='filter-item'><input type='filter-name' placeholder='Object/group...' /></div>");
    });

    $(".do-search").click(function(){
        var from = $("#search-from").val();
        var to = $("#search-to").val();
        var message = $("#search-message").val();
        var query = "messages?message[from]=" + from + "&message[to]=" + to + "&message[message]=" + message;
        var urlSearch = "http://localhost:3000/searchMessage/" + query;

        $("#search-result").empty();

        d3.json(urlSearch, function(err, data){
            var totalPageNum = Math.ceil(data.length / 10)
            var result = "Find " + data.length + " messages. Display 1/" + totalPageNum + " page. "
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
            var messageId = $($(this).children()[0]).text();
            var success = svg.locate(messageId);
            if(success){
                $('.drawer').drawer('hide');
            }
            else{
                console.log("This message is hidden by grouping");
            }
        });
    }

    function useDotIfNameTooLong(name){
        if(name.length > 42){
            return name.substring(0, 42) + "...";
        }
        else{
            return name;
        }
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

var urlObj = "http://localhost:3000/fetchObject";
var urlGrp = "http://localhost:3000/fetchGroup";
var urlMsg = "http://localhost:3000/fetchMessage/" + 0;
var objects;
var groups;
var messages;
d3.json(urlObj, function(err, data) {
    if(err){
        console.log("Error while loading objects");
        console.log(err);
    }
    else{
        objects = data;
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
                        svg = new sd.SDViewer(objects, groups, messages);
                        setupJquery(svg);
                    }
                });
            }
        });
    }
});
