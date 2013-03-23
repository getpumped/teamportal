function openSignForm() {

  $('#signin-modal').modal({
        backdrop: true,
        keyboard: true
    }).on('shown', function () {
      $('#signin-modal').find("input:first").focus();
    });
}

function openRegisterForm() {

  $('#register-modal').modal({
        backdrop: true,
        keyboard: true
    }).on('shown', function () {
      $('#register-modal').find("input:first").focus();
    });
}