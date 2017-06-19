
// Define chords
// var notes = ['C', '-', 'D', '-', 'E', 'F', '-', 'G', '-', 'A', '-', 'B'];
// var noteNumToLetter = {0:'C',1:'CD',2:'D',3:'DE',4:'E',5:'F',6:'FG',7:'G',8:'GA',9:'A',10:'AB',11:'B'}
// var major = [[0, 4, 7],"maj"];
// var minor = [[0, 3, 7],"min"];
// var dom7 = [[0, 4, 7, 10],"dom7"];
// var maj7 = [[0, 4, 7, 11],"maj7"];
// var min7 = [[0, 3, 7, 10],"min7"];
// var dim7 = [[0, 3, 9],"dim7"]; // also 6
// var hdim7 = [[0, 3, 6, 8],"hdim7"];
// var chordsTier1 = [major, minor];
// var chordsTier2 = [dom7];
// var chordsTier3 = [dim7];
// var chordsTier4 = [maj7, hdim7];
// var chordTiersToTest = [chordsTier1,chordsTier2];
// var chordTypesToTest = [];
// for (var i=0; i<chordTiersToTest.length; i++) {
//     chordTypesToTest = chordTypesToTest.concat(chordTiersToTest[i]);
// }

// console.log($("test"));

console.log($(document));

var chordQualitiesToTest = ["maj","min","dom7"];
var chordRootsToTest = ['Ab','Eb','Bb','F','C','G','D','A','E','B']
var bassBtnSize = 50;
var bassBtnSpacing = 15;


$("#bassplate").css("background-color", "yellow");
// Create bassplate and bass buttons
$("#bassplate").css("box-sizing","border-box");
$("#bassplate").height(chordQualitiesToTest.length*(bassBtnSize+bassBtnSpacing)+bassBtnSpacing+"px");
$("#bassplate").width(chordRootsToTest.length*(bassBtnSize+bassBtnSpacing)+bassBtnSpacing+"px");
// $("#bassplate").width(bassBtnSize+"px")
$("#bassplate").css("position","relative");
for (i=0; i<chordQualitiesToTest.length; i++) {
    for (j=0; j<chordRootsToTest.length; j++) {
        var newButtonId = "bass-btn-"+chordRootsToTest[j]+"-"+chordQualitiesToTest[i]+"";
        var newButtonOnclick = "bassBtnOnclick(\'"+chordRootsToTest[j]+"\',\'"+chordQualitiesToTest[i]+"\')";
        $("#bassplate").append("<button id=\""+newButtonId+"\" class=\"bass-btn\" onclick=\""+newButtonOnclick+"\">"+chordRootsToTest[j]+chordQualitiesToTest[i]+"</button>");
        $("#"+newButtonId).css("background-color","red");
        // $("#"+newButtonId).text("con");
        $("#"+newButtonId).css("display","block");
        $("#"+newButtonId).css("position","absolute");
        $("#"+newButtonId).css("top",(i*(bassBtnSize+bassBtnSpacing)+bassBtnSpacing)+"px");
        $("#"+newButtonId).css("left",(j*(bassBtnSize+bassBtnSpacing)+bassBtnSpacing)+"px");
    }
}
$(".bass-btn").css("width",bassBtnSize+"px");
$(".bass-btn").css("height",bassBtnSize+"px");
$(".bass-btn").css("border-radius","100px");
// $("#bassplate").append("<button>But</button>");


// $(document).ready(function(){
// });
var begun = false;
var playingChord = false;


window.onload = function() {
    MIDI.loadPlugin({
        soundfontUrl: "MIDI.js-master/examples/soundfont/",
        instrument: "acoustic_grand_piano",
        onprogress: function(state, progress) {
            console.log(state, progress);
        },
        onsuccess: function() {
            var delay = 0; // play one note every quarter second
            var note = 50; // the MIDI note
            var velocity = 127; // how hard the note hits
            // play the note
            MIDI.setVolume(0, 127);
            MIDI.noteOn(0, note, velocity, delay);
            MIDI.noteOff(0, note, delay + 0.75);
        }
    });
}

var firstChord = function() {
    if (begun) return;
    begun = true;
    $("#starter").css("opacity","0");
    newChord();
}
var newChord = function() {
    if (playingChord) {
        return;
    }
    MIDI.setVolume(0,127);
    MIDI.noteOn(0, 48, 127, 0);
    MIDI.noteOff(0, 48, 1.0);
}
var bassBtnOnclick = function(root, quality) {
    if (!playingChord) {
        return;
    }
    
}