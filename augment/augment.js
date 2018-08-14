// Augment
// Copyright © Ryan Tabler


// Settings
var chordQualitiesToTest = ["maj","min","dom7"];
var chordRootsToTest   =      ['Db','Ab','Eb','Bb','F','C','G','D','A','E','B','F#'];
var chordButtonsToShow = ['Gb','Db','Ab','Eb','Bb','F','C','G','D','A','E','B','F#','C#','G#','D#','A#'];
// Settings that won't change much
var bassplatePadding = 4;
var bassBtnSize = 57;
var bassBtnSpacing = 10;

// Global state variables
var begun = false;
var chordIsPlaying = false;
var currentInterval = -1; // nonzero if chord is looping
var currentChord = []; // [root, quality] currently playing chord
var currentGuess = [];
var currentGuessIndex = 0;
var currentChordProgression = [];

// Global data / lookup
var loaded = false;
var qualityToNumberMap = function(q) {
    if      (q==="maj"  ) return [0,4,7];
    else if (q==="min"  ) return [0,3,7];
    else if (q==="dom7" ) return [0,4,7,10];
    else if (q==="maj7" ) return [0,4,7,11];
    else if (q==="min7" ) return [0,3,7,10];
    else if (q==="dim7" ) return [0,3,9]; // also 6
    else if (q==="hdim7") return [0,3,6,8];
}
var letterNoteToNumberNote = function(l) {
    if      (l==="Bs" ) return 0;
    else if (l==="B#" ) return 0;
    else if (l==="C"  ) return 0;
    else if (l==="Cs" ) return 1;
    else if (l==="C#" ) return 1;
    else if (l==="Db" ) return 1;
    else if (l==="D"  ) return 2;
    else if (l==="Ds" ) return 3;
    else if (l==="D#" ) return 3;
    else if (l==="Eb" ) return 3;
    else if (l==="E"  ) return 4;
    else if (l==="Fb" ) return 4;
    else if (l==="Es" ) return 5;
    else if (l==="E#" ) return 5;
    else if (l==="F"  ) return 5;
    else if (l==="Fs" ) return 6;
    else if (l==="F#" ) return 6;
    else if (l==="Gb" ) return 6;
    else if (l==="G"  ) return 7;
    else if (l==="Gs" ) return 8;
    else if (l==="G#" ) return 8;
    else if (l==="Ab" ) return 8;
    else if (l==="A"  ) return 9;
    else if (l==="As" ) return 10;
    else if (l==="A#" ) return 10;
    else if (l==="Bb" ) return 10;
    else if (l==="B"  ) return 11;
    else if (l==="Cb" ) return 11;
}
var numberNoteToLetterNote = function(n,p) {
    if      (n=== 0) return 'C';
    else if (n=== 2) return 'D';
    else if (n=== 4) return 'E';
    else if (n=== 5) return 'F';
    else if (n=== 7) return 'G';
    else if (n=== 9) return 'A';
    else if (n===11) return 'B';
    else if (p==='#') {
        if      (n=== 1) return 'C#';
        else if (n=== 3) return 'D#';
        else if (n=== 6) return 'F#';
        else if (n=== 8) return 'G#';
        else if (n===10) return 'A#';
    }
    else if (p==='b') {
        if      (n=== 1) return 'Db';
        else if (n=== 3) return 'Eb';
        else if (n=== 6) return 'Gb';
        else if (n=== 8) return 'Ab';
        else if (n===10) return 'Bb';
    }
    return 'Z';
}



// Load MIDI resources
window.onload = function() {
    // $("#visualizer").css("opacity","1");
    // return;
    MIDI.loadPlugin({
        soundfontUrl: "MIDI.js-master/examples/soundfont/",
        instrument: "acoustic_grand_piano",
        onprogress: function(state, progress) {
            // console.log(state, progress);
            return;
        },
        onsuccess: function() {
            // $("#visualizer").css("visibility","visible");
            setTimeout(function(){
                $('#starter').html('Click to begin guessing the chords that play.');
                loaded = true;
            }, 5000);
        }
    });
}





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
var playChordProgressionFromNumbers = function(chordNumbers) {
    console.log("Hit playChordProgressionFromNumbers()");
    // Plays a sequence of chords
    var duration = 1.0; // for each chord
    for (var i=0; i<chordNumbers.length; i++) {
        var noteNumbers = chordNumbers[i];
        for (var j=0; j<noteNumbers.length; j++) {
            MIDI.noteOn(0, noteNumbers[j], 127, 0.001+i*duration);
        }
        for (var j=0; j<noteNumbers.length; j++) {
            MIDI.noteOff(0, noteNumbers[j], 0.001+(i+1)*duration);
        }
    }
}
var beginPlayingChordProgressionFromNumbers = function(chordNumbers) {
    console.log("Hit beginPlayingChordProgressionFromNumbers()");
    playChordProgressionFromNumbers(chordNumbers);
    currentInterval = setInterval(playChordProgressionFromNumbers, 6000, chordNumbers);
}
var chord2numbers = function(root, quality) {
    // Converts ['C','maj'] into [0,4,7]
    var rootNumber = letterNoteToNumberNote(root);
    var chordNumbers = qualityToNumberMap(quality);
    for (var i=0; i<chordNumbers.length; i++) {
        chordNumbers[i] += rootNumber;
        chordNumbers[i] = chordNumbers[i] % 12; // So that lowest note != root note
    }
    return chordNumbers;
}
var expandNumbersAcrossOctaves = function(chordNumbers, lowestC, octaves) {
    // Given chord numbers 0 to 11, calculates every note that needs to be
    // played when playing over multiple octaves
    var notesToPlay = Array(octaves*chordNumbers.length);
    for (octave=0; octave<octaves; octave++) {
        for (var i=0; i<chordNumbers.length; i++) {
            var cn = chordNumbers[i];
            cn += lowestC + octave * 12;
            notesToPlay[chordNumbers.length*octave+i] = cn;
        }
    }
    return notesToPlay;
}
var playChord = function(root, quality, loop) {
    // Plays a chord for 2 seconds. Loops optionally.

    // Convert [root,quality] to numbers
    var chordNumbers = chord2numbers(root, quality);

    // Calculate all the note values that need to be played
    // given the number of octaves
    var notesToPlay = expandNumbersAcrossOctaves(chordNumbers, 48, 3);

    // Play the chord every 2.1 seconds.
    // Will be stopped when clearInterval(currentInterval) is called.
    if (loop) {
        currentInterval = setInterval(playChordFromNumbers, 2100, notesToPlay);
    } else {
        playChordFromNumbers(notesToPlay);
    }
}
var playChordProgression = function(chordProgression, loop) {
    // Play a chord progression on a loop

    // Convert root+quality into numbers
    var chordProgressionNumbers = [];
    for (var i=0; i<chordProgression.length; i++) {
        var chord = chordProgression[i];
        var numbers = chord2numbers(chord[0],chord[1]);
        chordProgressionNumbers.push(numbers);
    }

    // Calculate all the note values that need to be played
    // given the number of octaves
    var noteSetSet = [];
    for (var i=0; i<chordProgressionNumbers.length; i++) {
        noteSetSet.push(expandNumbersAcrossOctaves(chordProgressionNumbers[i], 48, 3));
    }

    // Play chord progression every 6 seconds.
    // Will be stopped when clearInterval(currentInterval) is called.
    if (loop) {
        // console.log("Triggered setTimeout()");
        setTimeout(beginPlayingChordProgressionFromNumbers, 1000, noteSetSet);
        // beginPlayingChordProgressionFromNumbers(noteSetSet);
    } else {
        playChordProgressionFromNumbers(noteSetSet);
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
var getDerivativeChords = function(baseChord) {
    // Determine all available derivative chords

    var root = baseChord[0];
    var quality = baseChord[1];

    // Find the root number of the equivalent major chord
    var rootNumber = letterNoteToNumberNote(root);
    if      (quality == 'maj' ) { rootNumber += 0; }
    else if (quality == 'min' ) { rootNumber += 3; }
    else if (quality == 'dom7') { rootNumber += 5; }
    else { conosle.log("Chosen chord quality must be (maj/min/dom7) to derive chords."); }

    // Calculate the derivative chords of that equivalent major chord
    var derivativeChords = [[5,'maj'],[0,'maj'],[7,'maj'],[7,'dom7'],
                            [2,'min'],[9,'min'],[4,'min']];
    var accidentalPreference;
    if (rootNumber===7 || rootNumber===2  || rootNumber===9 ||
        rootNumber===4 || rootNumber===11 || rootNumber===6 ) {
        accidentalPreference = '#';
    } else {
        accidentalPreference = 'b';
    }
    for (var i=0; i<derivativeChords.length; i++) {
        derivativeChords[i][0] = (derivativeChords[i][0] + rootNumber) % 12;
        derivativeChords[i][0] = numberNoteToLetterNote(derivativeChords[i][0], accidentalPreference);
    }

    return derivativeChords;
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
var newChordProgression = function() {
    // Choose, calculate, and start playing a new chord progression

    // Do nothing is a chord is already playing
    if (chordIsPlaying) {
        return;
    }
    chordIsPlaying = true;

    // Choose a chord, find derivative chords, then randomly pick 4
    var baseChord = chooseChord();
    var derivativeChords = getDerivativeChords(baseChord);
    var chordsToPlay = [];
    for (var i=0; i<4; i++) {
        chordsToPlay.push(derivativeChords[Math.floor(Math.random()*derivativeChords.length)]);
    }

    console.log(chordsToPlay);

    // Play those 4 chords on loop
    currentChordProgression = chordsToPlay;
    playChordProgression(currentChordProgression,true); // loops
}
var firstChord = function() {
    // Called when #starter is pressed
    if (!loaded) return;
    if (begun) return;
    begun = true;
    $("#starter").css("opacity","0");
    newChordProgression();
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
    $("#btRepeat").css("visibility,","visible");
    $("#btNext").css("visibility","visible");

    $("#feedback").css("visibility","visible");
}
var gradeChordProgressionAndDoFeedback = function() {
    for (var i=0; i<4; i++) {
        var guessRoot = letterNoteToNumberNote(currentGuess[i][0]);
        // console.log("guessRoot: "+guessRoot);
        var guessQuality = currentGuess[i][1];
        // console.log("guessQuality: "+guessQuality);
        var correctRootLetter = currentChordProgression[i][0];
        var correctRoot = letterNoteToNumberNote(correctRootLetter);
        // console.log("correctRoot: "+correctRoot);
        var correctQuality = currentChordProgression[i][1];
        // console.log("correctQuality: "+correctQuality);
        if (guessRoot===correctRoot && guessQuality===correctQuality) {
            $("#vs-"+i).css("background-color","#ccffcc");
        } else {
            $("#vs-"+i).css("background-color","#ffcccc");
            $("#vs-"+i+"-ans").html(""+correctRootLetter+correctQuality);
        }
    }
    // Shows the button to play the next chord
    $("#btRepeat").css("visibility,","visible");
    $("#btNext").css("visibility","visible");
}

// Button functions
var _bassBtnOnclick = function(root, quality) {
    // Called when one of the bass buttons is pressed.

    // If nothing is playing yet, then play the chord for the button pressed
    if (!chordIsPlaying) {
        playChord(root,quality,false); // doesn't loop
        return;
    }

    // Stops the chord from continuing to play
    clearInterval(currentInterval);
    chordIsPlaying = false;

    gradeChordAndDoFeedback(root, quality);
}
var bassBtnOnclick = function( e ) {
    // Called when one of the bass buttons is pressed.

    var root = e.data.root;
    var quality = e.data.quality;

    // If nothing is playing yet, then play the chord for the button pressed
    if (!chordIsPlaying) {
        playChord( root, quality, false ); // doesn't loop
        return;
    }

    currentGuess.push([root,quality]);
    $("#vs-"+currentGuessIndex+"-guess").html(""+root+quality);
    currentGuessIndex++;

    if (currentGuessIndex > 3) {
        // Stops the chord from continuing to play
        clearInterval(currentInterval);
        chordIsPlaying = false;
    
        gradeChordProgressionAndDoFeedback();
        currentGuess = [];
        currentGuessIndex = 0;
    }
}
var btRepeatOnclick = function() {
    // Called when the repeat chord button is pressed on the feedback panel.
    // playChord(currentChord[0],currentChord[1],false); // doesn't loop
    playChordProgression(currentChordProgression,false); // doesn't loop
}
var btNextOnclick = function() {
    // Called when the next chord button is pressed on the feedback panel.
    $("#feedback").css("visibility","hidden");
    // newChord();
    for (var i=0; i<4; i++) {
        $("#vs-"+i+"-guess").html("");
        $("#vs-"+i+"-ans").html("");
        $("#vs-"+i).css("background-color","white");
    }
    newChordProgression();
}





for (var i=0; i<4; i++) {
    $("#vs-"+i).css("background-color","white");
    $("#vs-"+i).css("left",(i*140)+"px");
}
// Draw the parts of the UI that depend on settings
// Create bassplate and bass buttons
$("#bassplate").height(
    bassplatePadding+bassplatePadding
    + chordQualitiesToTest.length * (bassBtnSize+bassBtnSpacing)
    + bassBtnSpacing+"px"
);
$("#bassplate").width(
    bassplatePadding+bassplatePadding
    + chordButtonsToShow.length * (bassBtnSize+bassBtnSpacing)
    + bassBtnSpacing+"px"
);
for (i=0; i<chordQualitiesToTest.length; i++) {
    for (j=0; j<chordButtonsToShow.length; j++) {
        var cssFriendlyRootNote = (chordButtonsToShow[j].substr(-1)=='#')? chordButtonsToShow[j].substr(0,1)+'s' : chordButtonsToShow[j];
        var newButtonId = "bass-btn-"+cssFriendlyRootNote+"-"+chordQualitiesToTest[i]+"";
        var bassBtnOnclickData = {
            root: chordButtonsToShow[j],
            quality: chordQualitiesToTest[i]
        };
        $('#bassplate').append(
            $('<button>')
            .attr('id', newButtonId)
            .addClass('bass-btn')
            .on('click', bassBtnOnclickData, bassBtnOnclick)
            .html( chordButtonsToShow[j]+chordQualitiesToTest[i] )
        );
        $("#"+newButtonId).css("top",(bassplatePadding+i*(bassBtnSize+bassBtnSpacing)+bassBtnSpacing)+"px");
        $("#"+newButtonId).css("left",(bassplatePadding+j*(bassBtnSize+bassBtnSpacing)+bassBtnSpacing)+"px");
    }
}
$(".bass-btn").css("width",bassBtnSize+"px");
$(".bass-btn").css("height",bassBtnSize+"px");
$("#bass-btn-C-maj").css("border-style","solid");
$("#bass-btn-C-maj").css("border-color","gold");
$("#bass-btn-C-maj").css("border-width","6px");
// $("#bassplate").append("<button>But</button>");

