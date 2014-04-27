/**
 * Load current settings from localStorage
 */
var backgroundSrc = localStorage.getItem('cntp.op.background');

if (backgroundSrc)
{
    setBackgroundImage(backgroundSrc);
}


/**
 * Save settings to localStorage
 */
$('#saveButton').click(function (ev)
{

    ev.preventDefault();

    //save background setting
    var val = "";

    if ($('#backgroundPreviewImg').length)
    {
        val = $('#backgroundPreviewImg')[0].src;
    }

    localStorage.setItem('cntp.op.background', val);

    // Indicate to the user that things went well
    $(this).text('Saved').addClass("saved");
});

/**
 * Reset the save button
 */
$('input').on('keyup click', function ()
{
    $('#saveButton').text('Save').removeClass("saved");
});


/**
 * Handle background select
 */

$('#backgroundInput').on('change', function ()
{
    var file = $('#backgroundInput')[0].files[0];
    var imageType = /image.*/;

    if (file.type.match(imageType))
    {
        var reader = new FileReader();

        reader.onload = function ()
        {
            setBackgroundImage(reader.result);
        }

        reader.readAsDataURL(file);
    }
    else
    {
        $('#backgroundError')[0].innerHTML = "File not supported!"

        $('#backgroundError').show();
    }

});

$('#clearButton').click(function ()
{
    $('#backgroundCurrent').hide();
    $('#backgroundPreviewImg').remove();
    $('#backgroundInput')[0].value = "";
    $('#backgroundInput').show();
    $('#saveButton').text('Save').removeClass("saved");
});


function setBackgroundImage(imageSrc)
{
    $('#backgroundPreview')[0].innerHTML = "";

    var img = new Image();
    img.id = "backgroundPreviewImg";
    img.src = imageSrc;
    img.width = 211;
    img.height = 119;


    $('#backgroundPreview')[0].appendChild(img);

    $('#backgroundError').hide();
    $('#backgroundInput').hide();
    $('#backgroundCurrent').show();
}