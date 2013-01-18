(function($) {
  $(function() {
    
      var socket = io.connect('http://192.168.88.169:3000');
      socket.emit('test', {title:'hell'} );
      socket.on('news', function(data) {
        console.log(data);
      });
    
  });
})(jQuery);
