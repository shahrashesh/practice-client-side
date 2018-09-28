$( function() {

var  cards =[], toDoCardsIds = [], doingCardsIds = [], doneCardsIds = [], editCardId, 
localStorageData = {cards, toDoCardsIds, doingCardsIds, doneCardsIds},
cardState = {toDo: "toDo", doing : "doing", done : "done"};//cardstates matching the ids of sortable wrapper divs;

//Retrieve the template data from the HTML .
var cardTemplate = $('#card-handlebars').html();

//Compile the template data into a function
var cardTemplateScript = Handlebars.compile(cardTemplate);

//click add button on uping enter in text area
$("#addCardText").keyup (function (e) {
  var code = (e.keyCode ? e.keyCode : e.which);
  if (code == 13) { //Enter keycode
      $("#addCardBtn").click();
      event.preventDefault();
  }
});

$("#cardEditorArea").keyup (function (e) {
  var code = (e.keyCode ? e.keyCode : e.which);
  if (code == 13) { //Enter keycode
      $("#saveBtn").click();
      event.preventDefault();
  } else if (code == 27) { //Enter keycode
    $("#closeIcon").click();
    event.preventDefault();
}
});

//default focus on text area
$("#addCardText").focus();

$("#addCardBtn").click(addCard);

$("#saveBtn").click(updateAndSaveCard);

$("#closeIcon").click(function()
{
  $("#cardEditorModal").css('display','none');
});

checkLocalSorageandRenderCards();

//on page load check for data in local storage and populate cards

function checkLocalSorageandRenderCards()
{
  if(JSON.parse(localStorage.getItem("localStorageData")) != null)
  {
    localStorageData = JSON.parse(localStorage.getItem("localStorageData"));
    
      toDoCardsIds = localStorageData.toDoCardsIds;

      doingCardsIds = localStorageData.doingCardsIds;
  
      doneCardsIds = localStorageData.doneCardsIds;

      if(localStorageData.cards != null){
        cards = localStorageData.cards;
        toDoCardsIds.forEach(function(cardId){
          renderCard(getCardData(cardId));
        });
        doingCardsIds.forEach(function(cardId){
          renderCard(getCardData(cardId));
        });
        doneCardsIds.forEach(function(cardId){
          renderCard(getCardData(cardId));
        });
      }
  }
}

function getCardData(cardId)
{
  return cards[getCardIndex(cardId)];
}

function getCardIndex(cardId)
{
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].id == cardId) {
      return i;
    }
  }
}

function updateLocalStorage()
{
  localStorage.setItem("localStorageData", JSON.stringify(localStorageData));
}

function renderCard(cardData)
{
  var cardHtml = cardTemplateScript({ "cardId" : cardData.id, "cardText" :cardData.text});
  $("#"+cardData.state).append(cardHtml);
  $("#"+cardData.state + " #"+ cardData.id + " .editIcon").click( function(){
    showCardEditor(cardData);
  });
  $("#"+cardData.state + " #"+ cardData.id + " .deleteIcon").click(function(){
    deleteCard(cardData);
  });
}

function addCard()
{
  var cardData = {};
  cardData.text = $("#addCardText").val();
  cardData.id = Math.floor(Math.random() * 26) + Date.now().toString();
  cardData.state = cardState.toDo;
  saveCard(cardData);
  renderCard(cardData);
  $("#addCardText").val('');
}

function saveCard(cardData)
{
  cards.push(cardData);
  localStorageData.cards = cards;
  switch(cardData.state)
    {
      case cardState.toDo : toDoCardsIds.push(cardData.id.toString());   
      localStorageData.toDoCardsIds = toDoCardsIds;    
      break;
      case cardState.doing : doingCardsIds.push(cardData.id.toString()); 
      localStorageData.doingCardsIds = doingCardsIds;
      break;
      case cardState.done : doneCardsIds.push(cardData.id.toString()); 
      localStorageData.doneCardsIds = doneCardsIds;
      break;
    }
  updateLocalStorage()
}


function showCardEditor(cardData)
{
  var position = $("#"+cardData.id).position();
  $("#cardEditorArea").val(cardData.text);
  $("#cardEditor").css({ "top": position.top, "left": position.left});
  $("#cardEditorModal").css('display','block');
  $("#cardEditorArea").focus();
  editCardId = cardData.id;
}

function updateAndSaveCard()
{
  var updatedText = $("#cardEditorArea").val();
  $("#cardEditorModal").css('display','none');
  cards[getCardIndex(editCardId)].text = updatedText;
  $("#"+editCardId + " .cardTitle").text(updatedText); 
  editCardId = "";
  localStorageData.cards = cards;
  updateLocalStorage();
}


function deleteCard(cardData)
{
  cards.forEach(function(card, index){
    if(card.id == cardData.id)
    {
      switch(cardData.state)
      {
        case cardState.toDo : toDoCardsIds = removeCardIdFromList(toDoCardsIds, cardData.id);   
        localStorageData.toDoCardsIds = toDoCardsIds;    
        break;
        case cardState.doing : doingCardsIds = removeCardIdFromList(doingCardsIds, cardData.id); 
        localStorageData.doingCardsIds = doingCardsIds;
        break;
        case cardState.done : doneCardsIds = removeCardIdFromList(doneCardsIds, cardData.id); 
        localStorageData.doneCardsIds = doneCardsIds;
        break;
      }
      cards.splice(index, 1);
      localStorageData.cards = cards;
      updateLocalStorage();
      $("#"+cardData.id).remove();
      return;
    }
  });
}


function removeCardIdFromList(arrayToUpdate, cardId)
{
    var index = arrayToUpdate.indexOf(cardId.toString());
    if (index > -1) {
      arrayToUpdate.splice(index, 1);
    }
  return arrayToUpdate;
}

//enables jquery ui sorting 
$('.sortable').sortable({
  connectWith: '.sortable',
  placeholder: "ui-state-highlight",

  //update position in local storage on drop of a card
  update: function(event, ui) {
    var sortables = $('.sortable'), order;
    for (var ulIndex = 0; ulIndex < sortables.length; ulIndex++)
    {
      order = $("#"+sortables[ulIndex].id).sortable('toArray');
      
      order.forEach(function(position) {
        if(!isNaN(position))
        {
           for (var i = 0; i < cards.length; i++) {
            if (cards[i].id == position) {
              cards[i].state = sortables[ulIndex].id;
              break;
            }
          } 
        }
      });
      switch(sortables[ulIndex].id)
      {
        case cardState.toDo : toDoCardsIds = order;   
        localStorageData.toDoCardsIds = toDoCardsIds;    
        break;
        case cardState.doing : doingCardsIds = order; 
        localStorageData.doingCardsIds = doingCardsIds;
        break;
        case cardState.done : doneCardsIds = order; 
        localStorageData.doneCardsIds = doneCardsIds;
        break;
      }
    }
    localStorageData.cards = cards;
    updateLocalStorage();
  }

}).disableSelection();

});