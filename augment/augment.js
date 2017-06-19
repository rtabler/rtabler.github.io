// Augment
// Copyright © Ryan Tabler


// Settings
var chordQualitiesToTest = ["maj","min","dom7"];
var chordRootsToTest = ['Ab','Eb','Bb','F','C','G','D','A','E','B']
// Settings that won't change much
var bassBtnSize = 50;
var bassBtnSpacing = 15;

// Global state variables
var begun = false;
var chordIsPlaying = false;
var currentInterval = -1; // nonzero if chord is looping
var currentChord = []; // [root, quality] currently playing chord

// Global data / lookup
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
    "C#" : 1,  "Db" : 1,
    "D"  : 2,
    "D#" : 3,  "Eb" : 3,
    "E"  : 4,
    "F"  : 5,
    "F#" : 6,  "Gb" : 6,
    "G"  : 7,
    "G#" : 8,  "Ab" : 8,
    "A"  : 9,
    "A#" : 10, "Bb" : 10,
    "B"  : 11
}



// Load MIDI resources
window.onload = function() {
    MIDI.loadPlugin({
        soundfontUrl: "MIDI.js-master/examples/soundfont/",
        instrument: "acoustic_grand_piano",
        onprogress: function(state, progress) {
            // console.log(state, progress);
            return;
        },
        onsuccess: function() {
            $("#starter").css("visibility","visible");
            $("#starter").css("opacity","1");
        }
    });
}



// Draw the parts of the UI that depend on settings
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



// Functions for playing chords
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
var playChord = function(root, quality, loop) {
    // Plays a chord for 2 seconds. Loops optionally.
    console.log("Inside playChord()");
    console.log(root+" "+quality);

    // Convert root+quality to numbers
    var rootNumber = letterNoteToNumberNote[root];
    console.log(rootNumber);
    var chordNumbers = qualityToNumberMap[quality];
    console.log(chordNumbers);
    for (var i=0; i<chordNumbers.length; i++) {
        chordNumbers[i] += rootNumber;
        chordNumbers[i] = chordNumbers[i] % 12; // So that lowest note != root note
    }

    console.log(chordNumbers);

    // Calculate all the note values that need to be played
    // given the number of octaves
    var lowestC = 36;
    var octavesToPlay = 3;
    var notesToPlay = Array(octavesToPlay*chordNumbers.length);
    for (octave=0; octave<octavesToPlay; octave++) {
        for (var i=0; i<chordNumbers.length; i++) {
            cn = chordNumbers[i];
            cn += lowestC + octave * 12;
            notesToPlay[chordNumbers.length*octave+i] = cn;
        }
    }

    // Play the chord every 2.1 seconds.
    // Will be stopped when clearInterval(currentInterval) is called.
    if (loop) {
        currentInterval = setInterval(playChordFromNumbers, 2100, notesToPlay);
    } else {
        playChordFromNumbers(notesToPlay);
    }
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
    playChord(currentChord[0],currentChord[1],true); // loops
}
var firstChord = function() {
    // Called when "click to begin" is pressed
    if (begun) return;
    begun = true;
    $("#starter").css("opacity","0");
    newChord();
}

// Functions for user feedback
var gradeChordAndDoFeedback = function(root, quality) {
    // Grades the root,quality guess, and displays the feedback
    if (root == currentChord[0] && quality == currentChord[1]) {
        $("#inner-feedback").html("Correct! The chord was "+currentChord[0]+" "+currentChord[1]+".");
        $("#feedback").css("background-color","#ccffcc");
    } else {
        $("#inner-feedback").html("Incorrect. The chord was "+currentChord[0]+" "+currentChord[1]+".");
        $("#feedback").css("background-color","#ffcccc");
    }

    // Shows the button to play the next chord
    // $("#btRepeat").css("visibility,","visible");
    // $("#btNext").css("visibility","visible");

    $("#feedback").css("visibility","visible");
}

// Button functions
var bassBtnOnclick = function(root, quality) {
    // Called when one of the bass buttons is pressed.

    // Nothing to do if no chord is playing yet
    if (!chordIsPlaying) {
        return;
    }

    // Stops the chord from continuing to play
    clearInterval(currentInterval);
    chordIsPlaying = false;

    gradeChordAndDoFeedback(root, quality);
}
var btRepeatOnclick = function() {
    console.log(currentChord);
    // Called when the repeat chord button is pressed on the feedback panel.
    playChord(currentChord[0],currentChord[1],false); // doesn't loop
}
var btNextOnclick = function() {
    // Called when the next chord button is pressed on the feedback panel.
    $("#feedback").css("visibility","hidden");
    newChord();
}




