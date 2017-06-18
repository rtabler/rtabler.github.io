
var randomAccidentals = false;
var blackKeyColor = "black";
var whiteKeyColor = "ivory";

// Define chords
var notes = ['C', '-', 'D', '-', 'E', 'F', '-', 'G', '-', 'A', '-', 'B'];
var noteNumToLetter = {0:'C',1:'CD',2:'D',3:'DE',4:'E',5:'F',6:'FG',7:'G',8:'GA',9:'A',10:'AB',11:'B'}
var major = [[0, 4, 7],"maj"];
var minor = [[0, 3, 7],"min"];
var dom7 = [[0, 4, 7, 10],"dom7"];
var maj7 = [[0, 4, 7, 11],"maj7"];
var min7 = [[0, 3, 7, 10],"min7"];
var dim7 = [[0, 3, 9],"dim7"]; // also 6
var hdim7 = [[0, 3, 6, 8],"hdim7"];
var chordsTier1 = [major, minor];
var chordsTier2 = [dom7];
var chordsTier3 = [dim7];
var chordsTier4 = [maj7, hdim7];
var chordTiersToTest = [chordsTier1,chordsTier2];
var chordTypesToTest = [];
for (var i=0; i<chordTiersToTest.length; i++) {
    chordTypesToTest = chordTypesToTest.concat(chordTiersToTest[i]);
}

// Create audio
var audioCtx = new (AudioContext || webkitAudioContext)();
var noteFreqs = [261.63, 277.18, 293.66, 311.13, 329.63,
                 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88];

var generateNewChord = function() {
    console.log("GENERATE NEW CHORD");
    // Generate chord
    var rootNoteIndex = Math.floor(Math.random() * notes.length);
    // console.log("rootNoteIndex: "+rootNoteIndex);
    // console.log("chordTypesToTest: "+chordTypesToTest);
    var chosenChord = chordTypesToTest[Math.floor(Math.random() * chordTypesToTest.length)];
    // console.log("chosenChord: "+chosenChord);
    var relativeChordPattern = chosenChord[0];
    // console.log("relativeChordPattern: "+relativeChordPattern);
    var absoluteChordPattern = [];
    for (var i=0; i<relativeChordPattern.length; i++) {
        // console.log(relativeChordPattern[i])
        absoluteChordPattern.push(relativeChordPattern[i] + rootNoteIndex);
    }
    // console.log("absoluteChordPattern: "+absoluteChordPattern);
    for (var i=0; i<absoluteChordPattern.length; i++) {
        while (absoluteChordPattern[i] >= notes.length) {
            absoluteChordPattern[i] -= notes.length;
        }
    }
    // console.log("absoluteChordPattern: "+absoluteChordPattern);

    // Determine string notations of chords
    var orderedChordWithSharps = [];
    var orderedChordWithFlats = [];
    for (var i=0; i<absoluteChordPattern.length; i++) {
        var n = absoluteChordPattern[i];
        if (notes[n] == "-") {
            var nAdj = n - 1;
            while (nAdj < 0) {
                nAdj += notes.length;
            }
            orderedChordWithSharps.push(notes[nAdj]+'#');
            nAdj = n + 1;
            while (nAdj >= notes.length) {
                nAdj -= notes.length;
            }
            orderedChordWithFlats.push(notes[nAdj]+'b');
        } else {
            orderedChordWithSharps.push(notes[n]);
            orderedChordWithFlats.push(notes[n]);
        }
    }
    var rootNotes = [orderedChordWithSharps[0], orderedChordWithFlats[0]];

    // Randomize string notes for quizzing
    var randomizedChordWithSharps = [];
    var randomizedChordWithFlats = [];
    while (orderedChordWithSharps.length > 0) {
        var randNote = Math.floor(Math.random() * orderedChordWithSharps.length);
        var n = orderedChordWithSharps.pop(randNote);
        randomizedChordWithSharps.push(n);
        n = orderedChordWithFlats.pop(randNote);
        randomizedChordWithFlats.push(n);
    }
    var accidentalSway = -1;
    if (randomAccidentals) {
        accidentalSway = Math.floor(Math.random() * 2);
    } else {
        // Cmin is basically Amaj, and should show C Eb G instead of C D# G
        var keySignature = -1;
        if (chosenChord[1] == "maj") {
            keySignature = rootNoteIndex;
        } else if (chosenChord[1] == "min") {
            keySignature = rootNoteIndex + 3;
            while (keySignature >= notes.length) {
                keySignature -= notes.length;
            }
        } else {
            keySignature = rootNoteIndex;
        }
        // Determine to show flats or sharps for the given key signature
        if ([0,7,2,9,4,11].indexOf(keySignature) >= 0) { // C  G  D  A  E  B
            accidentalSway = 0;
        } else if ([5,10,3,8,1].indexOf(keySignature) >= 0) { // F  Bb Eb Ab
            accidentalSway = 1;
        } else { // F#/Gb C#/Db
            accidentalSway = Math.floor(Math.random() * 2);
        }
    }
    var randomizedChordToShow = [randomizedChordWithSharps,randomizedChordWithFlats][accidentalSway];
    var chordStringToShow = "";
    for (var i=0; i<randomizedChordToShow.length; i++) {
        chordStringToShow += randomizedChordToShow[i] + "  ";
    }

    // Determine acceptable answers
    var acceptableAnswers = [];
    var mostAcceptableAnswer = "";
    if (chosenChord[1] == "maj") {
        mostAcceptableAnswer = rootNotes[accidentalSway];
        for (var i=0; i<rootNotes.length; i++) {
            var n = rootNotes[i];
            acceptableAnswers = acceptableAnswers.concat([n, n+"maj"]);
        }
    } else if (chosenChord[1] == "min") {
        mostAcceptableAnswer = rootNotes[accidentalSway]+"min";
        for (var i=0; i<rootNotes.length; i++) {
            var n = rootNotes[i];
            acceptableAnswers = acceptableAnswers.concat([n.toLowerCase(), n+"min", n+"-"])
        }
    } else if (chosenChord[1] == "dom7") {
        mostAcceptableAnswer = rootNotes[accidentalSway]+"7";
        for (var i=0; i<rootNotes.length; i++) {
            var n = rootNotes[i];
            acceptableAnswers = acceptableAnswers.concat([n+"7", n+"dom7"]);
        }
    } else if (chosenChord[1] == "maj7") {
        mostAcceptableAnswer = rootNotes[accidentalSway]+"maj7";
        for (var i=0; i<rootNotes.length; i++) {
            var n = rootNotes[i];
            acceptableAnswers = acceptableAnswers.concat([n+"7", n+"dom7"]);
        }
    } else if (chosenChord[1] == "dim7") {
        mostAcceptableAnswer = rootNotes[accidentalSway]+"dim7";
        for (var i=0; i<rootNotes.length; i++) {
            var n = rootNotes[i];
            acceptableAnswers = acceptableAnswers.concat([n+"o7", n+"dim7"]);
        }
    } else {
        console.log("Selected chord type is not yet supported");
        mostAcceptableAnswer = "";
        acceptableAnswers = [""];
    }

    // console.log("absoluteChordPattern:");
    // console.log(absoluteChordPattern);
    // console.log("rootNoteIndex:");
    // console.log(rootNoteIndex);
    // console.log("chosenChord:");
    // console.log(chosenChord);
    // console.log([absoluteChordPattern,rootNoteIndex,chosenChord]);

    return [absoluteChordPattern,rootNoteIndex,chosenChord,mostAcceptableAnswer];
    // Get answer
    // var ans = input().strip()
    // Grade answer
    // if ans in acceptableAnswers:
    //     print("Correct!")
    // else:
    //     print("Incorrect: the answer is "+mostAcceptableAnswer)
}

var begun = false;
var guessedNote = -1;
var guessedChord = "";
var chordData;
var randomizedNotes = [];
var playing = false;
var keepPlaying = false;

var grade = function() {
    keepPlaying = false;
    var feedback = document.getElementById("feedback");
    if (guessedNote == chordData[1] && guessedChord == chordData[2][1]) {
        feedback.innerHTML = "Correct! The chord was "+chordData[3]+".";
        feedback.style.backgroundColor = "#ccffcc";
    } else {
        feedback.innerHTML = "Incorrect. The chord was "+chordData[3]+".";
        feedback.style.backgroundColor = "#ffcccc";
    }
    document.getElementById("btNext").style.visibility = "visible";
}
var checkAnswered = function() {
    if (guessedNote != -1 && guessedChord != "") {
        grade();
    }
}
var iveStoppedPlaying = function() {
    playing = false;
    keepPlaying = false;
}
var playChord = function(notesToPlay) {
    console.log("playChord()");
    var noteIterator = 0;
    var previousOscillator = undefined;
    var playNextNote = function() {
        if (previousOscillator != undefined) {
            previousOscillator.stop();
        }
        var osc = audioCtx.createOscillator();
        osc.connect(audioCtx.destination);
        osc.type = "triangle";
        osc.frequency.value = noteFreqs[notesToPlay[noteIterator]];
        // console.log(osc.frequency.value);
        osc.start(0);
        noteIterator = (noteIterator + 1) % notesToPlay.length;
        previousOscillator = osc;

        if (keepPlaying) {
            setTimeout(playNextNote, 200);
        } else {
            osc.stop();
            iveStoppedPlaying();
        }
    }
    playNextNote();
}
var resetFeedback = function() {
    var feedback = document.getElementById("feedback");
    feedback.innerHTML = "";
    feedback.style.backgroundColor = "rgba(0,0,0,0)";
    document.getElementById("btNext").style.visibility = "hidden";
}
var newChord = function() {
    if (playing) {
        keepPlaying = false;
        return;
    }
    playing = true;
    keepPlaying = true;
    guessedNote = -1;
    guessedChord = "";
    resetFeedback();
    for (var i=0; i<notes.length; i++) {
        var noteLetter = noteNumToLetter[i];
        var keyColor = (noteLetter.length > 1)? blackKeyColor : whiteKeyColor;
        document.getElementById("note-"+noteLetter).style.backgroundColor = keyColor;
    }
    for (var i=0; i<chordTypesToTest.length; i++) {
        document.getElementById("chord-"+chordTypesToTest[i][1]).style.backgroundColor = whiteKeyColor;
    }
    chordData = generateNewChord();
    var notesToPlay = chordData[0];
    randomizedNotes = [];
    while (notesToPlay.length > 0) {
        var splicedNote = notesToPlay.splice(Math.floor(Math.random()*notesToPlay.length), 1);
        randomizedNotes.push(splicedNote);
    }
    playChord(randomizedNotes);
}
var firstChord = function() {
    if (begun) return;
    begun = true;
    document.getElementById("starter").style.opacity = "0";
    newChord();
}


var btAnswer = function(ans) {
    if (keepPlaying) {
        if (typeof(ans) == typeof("")) {
            if (guessedChord != "") {
                document.getElementById("chord-"+guessedChord).style.backgroundColor = whiteKeyColor;
            }
            guessedChord = ans;
            document.getElementById("chord-"+ans).style.backgroundColor = "#cccccc";
        } else {
            if (guessedNote >= 0) {
                console.log(guessedNote);
                var noteLetter = noteNumToLetter[guessedNote];
                console.log(noteLetter.length > 1);
                var keyColor = (noteLetter.length > 1)? blackKeyColor : whiteKeyColor;
                document.getElementById("note-"+noteLetter).style.backgroundColor = keyColor;
            }
            guessedNote = ans;
            document.getElementById("note-"+noteNumToLetter[ans]).style.backgroundColor = "#cccccc";
        }
        if (guessedChord != "" && guessedNote >= 0) {
            grade();
        }
    }
}
var chordMaj  = function() { btAnswer("maj");  }
var chordMin  = function() { btAnswer("min");  }
var chordDom7 = function() { btAnswer("dom7"); }
var chordDim7 = function() { btAnswer("dim7"); }
var noteC     = function() { btAnswer(0);      }
var noteCD    = function() { btAnswer(1);      }
var noteD     = function() { btAnswer(2);      }
var noteDE    = function() { btAnswer(3);      }
var noteE     = function() { btAnswer(4);      }
var noteF     = function() { btAnswer(5);      }
var noteFG    = function() { btAnswer(6);      }
var noteG     = function() { btAnswer(7);      }
var noteGA    = function() { btAnswer(8);      }
var noteA     = function() { btAnswer(9);      }
var noteAB    = function() { btAnswer(10);     }
var noteB     = function() { btAnswer(11);     }








