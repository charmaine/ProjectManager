'use strict';
// client side JavaScript
// This file is included in every page.
var count = 0; // global variable used in $(function()
var countPos = 0; // global counter stored in local storage

//handles add new field (card) + delete cards function
$(document).ready(function() {
var max_fields      = 7;
var wrapper         = $(".container1");
var add_button      = $(".add_form_field");
var x = 1;

$(add_button).click(function(e){
  e.preventDefault();
  if(x < max_fields){
    x++;
    $(wrapper).append('<div><input id="addCard' + count + '" placeholder="Add card..." type="text"><a href="#" class="delete">Delete</a></div>'); //add input box
    count ++;
  } else {
    alert('Maximum card limit reached')
  }
});

$(wrapper).on("click",".delete", function(e){
  e.preventDefault(); $(this).parent('div').remove(); x--;
})
});

// edit: creates new list (& cards) that deletes and replaces current list
function edit (id) {
$.get( '/api/lists/' + id, function( data ) {
  $('#addEdit').submit(function() {
    data.name = $('#addLists').val();
    data.cards = [$('#addCard').val(), $('#addCard0').val(), $('#addCard1').val(), $('#addCard2').val(), $('#addCard3').val(),$('#addCard4').val(), $('#addCard5').val()];
    data.pos= id;
    var elem = document.getElementById('list-item' + id);
    delList(id);
    createList(data.name, data.pos, data.cards);
  });
})}

// delList: deletes current list
function delList(id) {
  $.ajax({
    url: '/api/lists/' + id,
    type: 'delete',
    success: function(result) {
      var elem = document.getElementById('list-item' + id);
      elem.parentNode.removeChild(elem);
      return false;
    }
  });
}

// creates new list with inputted cards on submit
// if list inputted but no cards inputted: leaves bullet point in list to prompt users to add cards
// if card is inputted but list is not: nothing happens
$('#addForm').submit(function() {
  createList($('#addLists').val(), localStorage.getItem("countPos"), [$('#addCard').val(), $('#addCard0').val(), $('#addCard1').val(), $('#addCard2').val(), $('#addCard3').val(),$('#addCard4').val(), $('#addCard5').val()]);
  localStorage.setItem("countPos", parseInt(localStorage.getItem("countPos"))+1);
});

// create a list on the server
function createList(name, pos, cards) {
  return $.ajax('/api/lists', {
    type: 'POST',
    data: {
      name: name,
      pos: pos,
      cards: cards
    }
  });
}

// get all `list`s from server
function loadLists() {
  return $.ajax('/api/lists');
}

// display lists in the browser
function displayLists(lists) {
  // Lists should be ordered based on their 'pos' field
  lists.rows = _.sortBy(lists.rows, 'pos');
  lists.rows.forEach(function(list) {
    var curElem = $('<li id="list-item'+ list.id + '">').text(list.name);
    var innerUl = $('<ul>');
    if (list.cards) {
      list.cards.forEach(function(card) {
        innerUl.append($('<li class="card">').text(card));
      });
      curElem.append(innerUl);
    }
    curElem.append(innerUl);
    innerUl.append($('<button onclick="edit('+list.id+')">Edit</button> <button onclick="delList('+list.id+')">Delete</button> '));
    $('#lists').append(curElem);
  });
}

loadLists()
.then(function(data) {
  console.log('Lists', data.rows);
  if (data.rows.length) {
    // If some lists are found display them
    displayLists(data);
  } else {
    // If no lists are found, create sample list
    // and re-display.
    console.log('No lists found, creating one.');
    createList('Hello', 0, ['Card 1', 'Card 2'])
    .then(function(list) {
      console.log('Created list', list);
      return loadLists();
    })
    .then(function(lists) {
      displayLists(lists);
    })
  }

});

// Comment out the whole file except the following and run to reset local storage (could have also used cookies)
// Position of lists is dependent on this so please reset or else the positions will be off!
// (used local storage to store a counter that shouldn't reset after page reloads (ie. after onClick etc))
// localStorage.clear();
// localStorage.setItem("countPos", 1);
