$(function() {
  $("#submit_form").submit(function(form) {
    form.preventDefault();
    $.ajax({
      url: "/add",
      type: "POST",
      data: $(this).serialize(),
      success: function(response) {
				$("#result_list li").remove();

				for (index in response.urls) {
					url_text = response.urls[index];
					li = $("<li><a href=\"" + url_text + "\">" + url_text + "</a></li>");

					li.appendTo("#result_list");
				}
      },
      failure: function() {
        console.log("Failed");
      }
    });
  });
});
