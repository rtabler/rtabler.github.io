
var currentInterval = -1;

var qualityToNumberMap = {
    "maj"  : [0,4,7],
    "min"  : [0,3,7],
    "dom7" : [0,4,7,10],
    "maj7" : [0,4,7,11],
    "min7" : [0,3,7,10],
    "dim7" : [0,3,9], // also 6
    "hdim7": [0,3,6,8]
}
var letterNoteToNumberNote = {
    "C"  : 0,
    "C#" : 1, "Db" : 1,
    "D"  : 2,
    "D#" : 3, "Eb" : 3,
    "E"  : 4,
    "F"  : 5,
    "F#" : 6, "Gb" : 6,
    "G"  : 7,
    "G#" : 8, "Ab" : 8,
    "A"  : 9,
    "A#" : 10, "Bb" : 10,
    "B"  : 11
}
console.log($(document));

var chordQualitiesToTest = ["maj","min","dom7"];
var chordRootsToTest = ['Ab','Eb','Bb','F','C','G','D','A','E','B']

var bassBtnSize = 50;
var bassBtnSpacing = 15;

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
var chordIsPlaying = false;


window.onload = function() {
    MIDI.loadPlugin({
        soundfontUrl: "MIDI.js-master/examples/soundfont/",
        instrument: "acoustic_grand_piano",
        onprogress: function(state, progress) {
            console.log(state, progress);
        },
        onsuccess: function() {
            $("#starter").css("visibility","hidden");
            $("#starter").css("opacity","1");
        }
    });
}

var firstChord = function() {
    // Called when "click to begin" is pressed
    if (begun) return;
    begun = true;
    $("#starter").css("opacity","0");
    newChord();
}

var playChordFromNumbers = function(noteNumbers) {
    // Given an array of note numbers, plays all the notes
    var duration = 2.0;
    for (var i=0; i<noteNumbers.length; i++) {
        MIDI.noteOn(0, noteNumbers[i], 127, 0.0);
    }
    for (var i=0; i<noteNumbers.length; i++) {
        MIDI.noteOff(0, noteNumbers[i], duration);
    }
}
var playChordOnLoop = function(root, quality) {
    // Plays a chord for 2 seconds

    // Convert root+quality to numbers
    var rootNumber = letterNoteToNumberNote[root];
    var chordNumbers = qualityToNumberMap[quality];
    for (var i=0; i<chordNumbers.length; i++) {
        chordNumbers[i] += rootNumber;
    }

    // Calculate all the note values that need to be played
    // given the number of octaves
    var lowestC = 36;
    var octavesToPlay = 3;
    var notesToPlay = Array(octavesToPlay*chordNumbers.length);
    var notesToTurnOff = Array(octavesToPlay*chordNumbers.length);
    for (octave=0; octave<octavesToPlay; octave++) {
        for (var i=0; i<chordNumbers.length; i++) {
            cn = chordNumbers[i];
            cn += lowestC + octave * 12;
            notesToPlay[12*octave+i] = cn;
        }
    }

    // Play the chord every 2.1 seconds.
    // Will be stopped when clearInterval(currentInterval) is called.
    currentInterval = setInterval(playChordFromNumbers, 2100, notesToPlay);
}

var chooseChord = function() {
    // Chooses a random chord from the available roots and qualities
    var chosenChord = [
        chordRootsToTest[Math.floor(Math.random()*chordRootsToTest.length)],
        chordQualitiesToTest[Math.floor(Math.random()*chordQualitiesToTest.length)]
    ];
    return chosenChord;
}

var newChord = function() {
    // If a chord is not yet playing, then randomly choose one
    // and begin playing it
    if (chordIsPlaying) {
        return;
    }
    chordIsPlaying = true;
    currentChord = chooseChord();
    playChordOnLoop(currentChord[0],currentChord[1]);
}

var gradeChord = function(root, quality) {
    // Grades the root,quality guess, and displays the feedback
    if (root == currentChord[0] && quality == currentChord[1]) {
        $("#feedback").html("Correct! The chord was "+currentChord[0]+" "+currentChord[1]+".");
        $("#feedback").css("background-color","#ccffcc");
    } else {
        $("#feedback").html("Incorrect. The chord was "+currentChord[0]+" "+currentChord[1]+".");
        $("#feedback").css("background-color","#ffcccc");
    }

    // Shows the button to play the next chord
    $("btNext").css("visibility","visible");
}

var bassBtnOnclick = function(root, quality) {
    // Called when one of the bass buttons is pressed.

    // Nothing to do if no chord is playing yet
    if (!chordIsPlaying) {
        return;
    }

    // Stops the chord from continuing to play
    clearInterval(currentInterval);

    gradeChord(root, quality);
}





