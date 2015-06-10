// Generated by CoffeeScript 1.8.0

/*
 * ObjEmbedder is a temporary image and map embedder for bots development
 * @param {Object} msg - The message object
 * to be replaced by proper implementation in 1.0
 */
var ObjEmbedder;

ObjEmbedder = (function() {
  function ObjEmbedder(message) {
    var mapmatch, msg, picmatch;
    console.log("in obj embedded");
    if (_.trim(message.html)) {
      console.log("trim okay");
      msg = message.html;
      picmatch = msg.match(/^https?:\/\/(?:[a-z0-9\-]+\.)+[a-z0-9]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png)$/i);
      if (picmatch != null) {
        console.log("match pic");
        msg = "<img style='width:400px;height:auto;' src='" + msg + "'></img>";
        return msg;
      }
      mapmatch = msg.match(/^https?\:\/\/maps\.(google|googleapis)\.[a-z]+\/maps\/api.*format=png$/i);
      if (mapmatch != null) {
        console.log("match map");
        msg = "<img style='width:400px;height:auto;' src='" + msg + "'></img>";
        return msg;
      }
    }
    return message;
  }

  return ObjEmbedder;

})();

RocketChat.callbacks.add('renderMessage', ObjEmbedder, RocketChat.callbacks.priority.HIGH);
