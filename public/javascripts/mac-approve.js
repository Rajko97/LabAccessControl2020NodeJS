socket.on("newMacRequest", (data) => {
    let escapedUsername = data.username.replace(/(:|\.|\[|\]|,|=)/g, "\\$1");
    $(`#${escapedUsername}`).remove();
    $("#macChangeList").prepend(
        `<li id="${data.username}">
            <span>${data.username} - ${data.newMACAddress}</span>
            <button class="approveBtn">Approve</button>
            <button class="rejectBtn">Reject</button>
        </li>`
    );
})

$(document).ready(function () {
    //Approve Button clicked
    $('#macChangeList').on('click', ".approveBtn", function() {
      let parentNode = $(this).parent()
      let text = parentNode.find("span").text()
      let username = text.slice(0, text.indexOf(" "));
      
      $.ajax({
        type: "POST",
        url: "users/approve",
        data: { username: username},
        success: data => {
          parentNode.remove(); 
          loginResElement.innerText = JSON.stringify(data, undefined, 2);
        },
        error: data => 
        {
          loginResElement.innerText = JSON.stringify(data, undefined, 2);
        }
      });
    });
    //Reject Button clicked
    $('#macChangeList').on('click', '.rejectBtn', function() {
      let parentNode = $(this).parent()
      let text = parentNode.find("span").text()
      let username = text.slice(0, text.indexOf(" "));
      
      $.ajax({
        type: "POST",
        url: "users/reject",
        data: { username: username},
        success: data => {
          parentNode.remove(); 
          loginResElement.innerText = JSON.stringify(data, undefined, 2);
        },
        error: data => 
        {
          loginResElement.innerText = JSON.stringify(data, undefined, 2);
        }
      });
    });
  });