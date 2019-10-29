const botToken = "<telegram bot token>"; 
const ssId = "https://docs.google.com/spreadsheets/d/<YOUR SSID IS HERE>";
const webAppUrl = "<Current web app URL> from Deploy as web app";

const telegramUrl = "https://api.telegram.org/bot" + botToken;

function setWebhook() {
  UrlFetchApp.fetch(telegramUrl + "/setWebhook?url=" + webAppUrl);
}

function sendResponse(id, text) {
  UrlFetchApp.fetch(telegramUrl + "/sendMessage?chat_id=" + id + "&text=" + encodeURI(text));
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  respond(data.message.chat.id, data.message.text);
  return HtmlService.createHtmlOutput();
}

function getOverview() {
  const sheet = SpreadsheetApp.openById(ssId).getSheets()[0];
  const expenses = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var overview = {};
  var total = 0;
  for (var i in expenses){
    if(isCurrentMonth(expenses[i][0])) {
      if(overview[expenses[i][1]] == undefined) {
        overview[expenses[i][1]] = 0;
      }
      total = +(total + expenses[i][2]).toFixed(2);
      overview[expenses[i][1]] = +(overview[expenses[i][1]] + expenses[i][2]).toFixed(2);
    }
  }   
  return {total : total, overview: JSON.stringify(overview)};
}

function isCurrentMonth(date) {
  const parts = date.split(".");
  const currentDate = new Date();  
  return (currentDate.getMonth() + 1 == parts[1] && parts[2] == currentDate.getFullYear());
}

function respond(id, text) {
  switch (text) {
    case "/overview":
      const overview = getOverview();
      sendResponse(id, "Overview for " + Utilities.formatDate(new Date(), "GMT", "MMMM") + "\n" + "Total " + overview.total + "\n" + overview.overview);
      break;
    default:
      const textParts = text.split(" ");
      const category = textParts[0].charAt(1).toUpperCase() + textParts[0].slice(2);
      const amount = textParts[1];      
      if(amount == undefined) {
        sendResponse(id, "Invalid amount");
        return;
      }
      SpreadsheetApp.openById(ssId).getSheets()[0].appendRow([Utilities.formatDate(new Date(), "GMT", "dd.MM.yyyy"), category, amount]);
      sendResponse(id, "Added " + amount + " to " + category);
      break;        
   }
}
