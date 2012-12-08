$(function() {
  $("#submit_form").submit(function(form) {
    form.preventDefault();
    $.ajax({
      url: "/add",
      type: "POST",
      data: $(this).serialize(),
      success: function(response) {
        if (response.item.length > 0) {
          $("<li>" + response.item + "</li>").hide().prependTo("#result_list").fadeIn(50);
        }
      },
      failure: function() {
        console.log("Failed");
      }
    });
  });
});
