$(document).ready(function() {
    var table = $('#regis').DataTable();
 
    $('#regis tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
    } );
	    $('#delete').click( function () {
		var data = table.row('.selected').data()
		alert( 'Deleting '+data[0]+'\'s row' );
		this.value = data[0];
    } );
} );