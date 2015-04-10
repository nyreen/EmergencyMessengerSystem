// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    $("#searched").hide();
    // Populate the user table on initial page load
    populateTable();

    // Add User button click
    $('#btnAddAgency').on('click', addUser);

    // Search User button click
    $('#searchbtn').on('click', searchUser);

    //Verify Admin Log-in
    $('#loginbtn').on('click', verify);

});

// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/contacts', function( data ) {

        display(data);

    });
};


// Add User
function addUser(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addAgency input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newAgency = {
            'a_name': $('#addAgency fieldset input#aName').val(),
            'contact_num': $('#addAgency fieldset input#contactnum').val(),
            'a_street': $('#addAgency fieldset input#street').val(),
            'a_brgy': $('#addAgency fieldset input#brgy').val(),
            'a_town': $('#addAgency fieldset input#town').val(),
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newAgency,
            url: '/users/contacts',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addAgency fieldset input').val('');

                // Update the table
                populateTable();

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        window.location.href = '\addagency';
        return false;
    }
};

// Delete User
function deleteUser(event) {

    //event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

}

// Search User
function searchUser(event) {

    $(document).ready(function()
    {
        var tableContent = '';

        // Super basic validation - increase errorCount variable if any fields are blank
        var errorCount = 0;

        if($('#searchField').val() == ''){
            errorCount++;
        }

        // Check and make sure errorCount's still at zero
        if(errorCount === 0) {
            $("#list").hide();
            $("#searched").show();

            var toSearch = $('#searchField').val();
            var match = 0;

            // jQuery AJAX call for JSON
            $.getJSON( '/users/contacts', function( data ) {
                $.each(data, function(){
                    var tempName = (this.a_name).toLowerCase();
                    var tempSearch = toSearch.toLowerCase();
                    if(tempName.indexOf(tempSearch) >=0){
                        //alert('Found');
                        tableContent += '<tr>';
                        tableContent += '<td>' + this.a_name + '</td>';
                        tableContent += '<td>' + this.contact_num + '</td>';
                        tableContent += '<td>' + this.a_street + ' Street' + ' Brgy. ' + this.a_brgy + ' ' + this.a_town + ', Quezon' + '</td>';
                        tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
                        tableContent += '</tr>';
                        match++;
                    }
                });

                if(match == 0){
                    alert('No results found');
                }

                // Inject the whole content string into our existing HTML table
                $('#userList table tbody').html(tableContent);

                 // Delete User link click
                $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
            });
        }

        else {
            // If errorCount is more than 0, error out
            alert('Please fill in the search field');
            window.location.href = '\agencies';
            return false;
        }
    });
}

var nameClickCount = 0;

function sortByName(event){
    nameClickCount = nameClickCount + 1;

    var id = 'a_name';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/contacts', function( data ) {
        if(nameClickCount%2 == 1){
            data.sort(sortByProperty(id));
        }
        else{
            data.sort(sortByProperty(id));
            data.reverse();
        }

        display(data);

    });
}

var numClickCount = 0;

function sortByNumber(event){
    numClickCount = numClickCount + 1;

    var id = 'contact_num';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/contacts', function( data ) {
        if(numClickCount%2 == 1){
            data.sort(sortByProperty(id));
        }
        else{
            data.sort(sortByProperty(id));
            data.reverse();
        }

        display(data);

    });
}

var brgyClickCount = 0;

function sortByBrgy(event){
    brgyClickCount = brgyClickCount + 1;

    var id = 'a_brgy';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/contacts', function( data ) {
        if(brgyClickCount%2 == 1){
            data.sort(sortByProperty(id));
        }
        else{
            data.sort(sortByProperty(id));
            data.reverse();
        }

        display(data);

    });
}

var sortByProperty = function (property) {
    return function (x, y) {
        return ((x[property].toLowerCase() === y[property].toLowerCase()) ? 0 : ((x[property].toLowerCase() > y[property].toLowerCase()) ? 1 : -1));
    };
};

function display(data){

    // Empty content string
    var tableContent = '';

    // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td>' + this.a_name + '</td>';
            tableContent += '<td>' + this.contact_num + '</td>';
            tableContent += '<td>' + this.a_street + ' Street' + ' Brgy. ' + this.a_brgy + ' ' + this.a_town + ', Quezon' + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);

         // Delete User link click
        $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

}

function verify(event){
    $(document).ready(function()
    {
        // Super basic validation - increase errorCount variable if any fields are blank
        var errorCount = 0;
        var match = 0;

        if($('#username').val() == '' || $('#password').val() == ''){
            errorCount++;
        }

        // Check and make sure errorCount's still at zero
        if(errorCount === 0) {
            var uname = $('#username').val();
            var pword = $('#password').val();

            // jQuery AJAX call for JSON
            $.getJSON( '/users/adminaccount', function( data ) {
                $.each(data, function(){
                    var tempUname = (this.username);
                    var tempPword = (this.password);

                    if(tempUname.indexOf(uname) >=0 && tempPword.indexOf(pword) >=0){
                        match++;
                        window.location.href = '\adminhome';
                    }
                });

                if(match == 0){
                    alert('Invalid account');
                    window.location.href = '/';
                }
            });
        }

        else {
            // If errorCount is more than 0, error out
            alert('Please fill in the login field');
            window.location.href = '/';
            return false;
        }
    });
}