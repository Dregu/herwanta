$(function() {
  var from = -1,
    move = 0,
    colors = ['#111', 'rgb(77,167,77)', '#fefefe', 'rgb(203,75,75)'];
  $.fn.disableSelection = function() {
    return this
      .attr('unselectable', 'on')
      .css('user-select', 'none')
      .on('selectstart', false);
  };
  for (var i = 0; i < score.length; i++) {
    var text = score[i].toString();
    text = text.replace(/\.5/g, '½');
    text = text.replace(/\-0½/g, '-½');
    text = text.replace(/^0½$/, '½');
    $('#board').append('<div class="player" data-i="' + i +
      '" style="background: ' + colors[i] + '">' + text + '</div>');
    $('#board').append('<div class="fail" data-i="' + i + '">½</div>');
  }

  function updateScore() {
    for (var i = 0; i < $('.player').length; i++) {
      var color = '#efef66';
      if (parseInt($($('.player')[i]).text()) < score[i]) {
        $($('.player')[i]).css({ color: 'limegreen' }).stop().animate({ color: '#efef66' },
          3000);
      } else if (parseInt($($('.player')[i]).text()) > score[i]) {
        $($('.player')[i]).css({ color: 'orangered' }).stop().animate({ color: '#efef66' },
          3000);
      }
      var text = score[i].toString();
      text = text.replace(/\.5/g, '½');
      text = text.replace(/\-0½/g, '-½');
      text = text.replace(/^0½$/, '½');
      $($('.player')[i]).html(text);
      $('.kela').html('');
      $('.cancel').hide();
      move = 0;
      from = -1;
    }
  }
  $('#board').on('touchstart click', '.player', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.handled !== true) {
      var i = $(this).data('i');
      if (move == 0) {
        from = i;
      }
      if (from == i) {
        move++;
        from = i;
        var text = score[i] + '-' + move;
        text = text.replace(/\.5/g, '½');
        text = text.replace(/\-0½/g, '-½');
        $('.player[data-i=' + i + ']').html(text);
        $('.cancel').show();
      } else {
        score[i] += move;
        if (from >= 0) score[from] -= move;
        from = -1;
        move = 0;
        $('.kela').html('');
        socket.send(JSON.stringify(score));
        //updateScore();
      }
      e.handled = true;
    } else {
      return false;
    }
  });
  $('#board').on('touchstart click', '.kela', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.handled !== true) {
      if (from == -1) {
        move++;
        $('.kela').html(move);
        $('.cancel').show();
      } else {
        score[from] -= move;
        $('.kela').html('');
        from = -1;
        move = 0;
        socket.send(JSON.stringify(score));
        //updateScore();
      }
      e.handled = true;
    } else {
      return false;
    }
  });
  $('#board').on('touchstart click', '.cancel', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.handled !== true) {
      updateScore();
    } else {
      return false;
    }
  });
  $('#board').on('touchstart click', '.fail', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.handled !== true) {
      var i = $(this).data('i');
      if (move == 0) {
        from = i;
      }
      if (from == i) {
        move += 0.5;
        from = i;
        var text = score[i] + '-' + move;
        text = text.replace(/\.5/g, '½');
        text = text.replace(/\-0½/g, '-½');
        $('.player[data-i=' + i + ']').html(text);
        $('.cancel').show();
      } else {
        score[i] += move;
        if (from >= 0) score[from] -= move;
        from = -1;
        move = 0;
        $('.kela').html('');
        socket.send(JSON.stringify(score));
        //updateScore();
      }
      e.handled = true;
    } else {
      return false;
    }
  });
  var socket = new ReconnectingWebSocket('ws://' + window.location.host +
    window.location.pathname);
  socket.onmessage = function(e) {
    score = JSON.parse(e.data);
    updateScore();
  };

  function rez() {
    var font = $(window).height() / 4;
    if (font > $(window).width() / 4) {
      font = $(window).width() / 4;
    }
    $('.player, .kela').css('font-size', font + 'px');
    $('.player').css('line-height', ($(window).height() / 2) + 'px');
    $('.kela').css('width', $('.kela').css('height'));
    $('.kela').css('margin-left', '-' + ($('.kela').width() / 2) +
      'px');
    $('.kela').css('margin-top', '-' + ($('.kela').height() / 2) +
      'px');
    $('.kela').css('line-height', $('.kela').height() + 'px');
  }
  $(window).resize(function() {
    rez();
  });
  rez();
  $('.player, #board, .fail').disableSelection();
  if (window.location.hash != '#½') {
    $('.fail').hide();
  }
  $(window).on('hashchange', function() {
    if (window.location.hash != '#½') {
      $('.fail').hide();
    } else {
      $('.fail').show();
    }
  })
});
