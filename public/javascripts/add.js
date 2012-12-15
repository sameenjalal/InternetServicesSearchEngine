$(function() {
	$("#new_search").focus();

  $("#submit_form").submit(function(form) {
    form.preventDefault();
		start = new Date().getTime();
		$("#metadata").remove();
		metadata = $("<li id='metadata'>Searching for: \"" + $("#new_search").val() + "\"...</li>");
		metadata.prependTo($("#result_list"));
    $.ajax({
      url: "/add",
      type: "POST",
      data: $(this).serialize(),
      success: function(response) {
				$("#result_list li").remove();

				if (response.urls.length == 0) {
					end = new Date().getTime();
					li = $("<li id='result_item' >Sorry empty search. Working on making our search more comprehensive. Stay tuned! Took " + String(end - start) + " milliseconds!</li>");
					li.appendTo("#result_list");
				} else {
					for (index in response.urls) {
						url = response.urls[index];
						url_title = url.title;
						if (url_title === "none") {
							url_title = url_link;
						}
						url_link = url.link;
						li = $("<li id='result_item' ><h3>" + url_title + "</h3><span id='url_link'><a id='result_href' target='_blank' href=\"" + url_link + "\">" + url_link + "</span></a></li>");

						li.appendTo("#result_list");
					}

					end = new Date().getTime();
					li = $("<li id='metadata'>Finished searching for: \"" + $("#new_search").val() + "\" and took " + String(end - start) + " milliseconds!</li>");
					li.prependTo($("#result_list"));
				}
      },
      failure: function() {
        console.log("Failed");
      }
    });
  });
});
