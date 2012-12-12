$(function() {
	$("#new_search").focus();

  $("#submit_form").submit(function(form) {
    form.preventDefault();
    $.ajax({
      url: "/add",
      type: "POST",
      data: $(this).serialize(),
      success: function(response) {
				$("#result_list li").remove();

				if (response.urls.length == 0) {
					li = $("<li id='result_item' >Sorry empty search. Working on making our search more comprehensive. Stay tuned!</li>");
					li.appendTo("#result_list");
				}

				for (index in response.urls) {
					url_text = response.urls[index];
					li = $("<li id='result_item' ><a id='result_href' target='_blank' href=\"" + url_text + "\">" + url_text + "</a></li>");

					li.appendTo("#result_list");
				}
      },
      failure: function() {
        console.log("Failed");
      }
    });
  });
});
