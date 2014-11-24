$(function() {
  var traduction = new Traduction();
  $.ajax({
    url: "traduction.json",
    type: "GET",
    dataType: "json",
    success: function(response) {
      traduction.load(response);
      traduction.init("en");
      var lang = navigator.language || navigator.userLanguage;
      lang = lang.substr(0, 2);

      traduction.update(lang);
    },
    error: function(jqxhr, status) {
      alert("Cannot load text content : " + status);
    },
    complete: function (status) {
      $(".hide-on-load").removeClass("hide-on-load");
    }
  });

  $('.page-scroll a.language-selector').bind('click', function(e) {
    var lang = $(this).attr('data-language');

    if (lang !== undefined) {
      traduction.update(lang);
    }
    e.preventDefault();
  });
});