

/**
 * Save it all
 */
$('.submit').click(function (ev) {

  ev.preventDefault();

  // Save the inputs based on their values
  $(inputs).each(function () {

    var val = $(this).val(),
        key = 'cntp.op.' + $(this).attr('name'),
        placeholder = $(this).attr('placeholder');

    if( val !== placeholder ) {
      if( val === '' ) val = placeholder;
      localStorage.setItem(key, val);
    }

  });

  // Indicate to the user that things went well
  $(this).text('Saved').addClass("saved");

});

/**
 * Reset the save button
 */
$('input').on('keyup click', function () {
  $('.submit').text('Save').removeClass("saved");
});