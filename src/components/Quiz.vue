<template>
  <div class="quiz">
    <!-- <question></question> -->
    <!-- <p>{{ questionsData[currentQuestionCategory] }}</p> -->
    <form v-if="!quizFinished">
      <div class="progress-bar">
        <div class="progress-bar-bar" v-bind:style="{ width: (progress*100)+'%' }"></div>
      </div>
      <p class="question-prompt">{{ currentQuestion }}</p>
      <div class="answers">
        <div v-for="(answer,i) in currentAnswers" v-on:click="passSelect(i)" class="answer noselect">
          <input v-if="isCheckbox(i)" type="checkbox" v-model="chosenCheckboxes[i]" v-bind:id="optionIdValue(i)" v-on:click="preventDefault">
          <input v-else type="radio" v-bind:value="i" v-model="chosenRadio" v-bind:id="optionIdValue(i)" v-on:click="preventDefault">
          {{ answer.disp }}
        </div>
      </div>
      <div class="noselect">
        <button v-on:click="nextQuestion(false)" class="proceed-button noselect" type="button">Skip Question</button>
        <button :disabled="nextQuestionDisabled()" v-on:click="nextQuestion(true)" class="proceed-button noselect" type="button">Next Question</button>
      </div>
    </form>
    <div v-if="quizFinished" class="results">
      <h2>Results</h2>
      <p id="results-text">This is where results would be. Sorry.</p>
    </div>
  </div>
</template>

<script>

import Question from './Question'
import Answers from './Answers'

import allQuestionData from '../all-quiz-questions.json';
var questionsData = allQuestionData["allQuestions"];
var quizResults = {
  WHY_BAD   : 0,
  WHY_GOOD  : 0,

  USE_FB    : 0,
  USE_TWT   : 0,

  ADDIC     : 0,
  ANXI      : 0,
  HOST      : 0,
  MISINF    : 0
};
// var currentCategoryIndex = 0;
// var currentQuestionIndex = 0;
// console.log(questionsData);
// console.log(Object.keys(questionsData));

  export default {
    name: 'quiz',
    components: {
      Question,
      Answers
    },
    // props: ['questionsData'],
    data: function() {
      return {
        quizFinished: false,
        overallQuestionIndex: 0,
        questionsData: questionsData,
        currentCategoryIndex: 0,
        currentQuestionIndex: 0,
        chosenCheckboxes: [],
        chosenRadio: -1
      }
    },
    computed: {
      progress: function() {
        return this.overallQuestionIndex / 20.0;
      },
      currentQuestionObject: function() {
        return this.questionsData[Object.keys(this.questionsData)[this.currentCategoryIndex]][this.currentQuestionIndex];
      },
      currentType: function() {
        return this.currentQuestionObject["type"];
      },
      currentQuestion: function() {
        return this.currentQuestionObject["question"];
      },
      currentAnswers: function() {
        // console.log(this.currentQuestionObject["answers"])
        return this.currentQuestionObject["answers"];
      }
    },
    methods: {
      passSelect: function(i) {
        if ( this.currentType == "checkbox" ) {
          this.chosenCheckboxes[i] = !this.chosenCheckboxes[i];
          this.$forceUpdate();
        } else if ( this.currentType == "radio" ) {
          this.chosenRadio = i;

        } else {

        }
      },
      preventDefault: function(e) {
        // console.log("didn't prevent default");
        return;
        var inp = document.getElementById(this.optionIdValue(0));
        // console.log(inp.checked);
        // console.log("preventing default");
        e.preventDefault();
      },
      isCheckbox: function(i) {
        return this.currentType == "checkbox";
      },
      optionIdValue: function(i) {
        return "option-"+i;
      },
      _finishQuiz: function(i) {
        this.quizFinished = true;
        this.currentCategoryIndex = 0;
        this.currentQuestionIndex = 0;

      },
      _incrementQuestion: function() {
        // console.log("In incrementquestion");
        // Do the model logic of moving to the next question

        // Increment the question index
        this.overallQuestionIndex += 1;
        this.currentQuestionIndex += 1;
        // Check if the quiz needs to move to the next section
        if (this.currentQuestionIndex >= this.questionsData[Object.keys(this.questionsData)[this.currentCategoryIndex]].length) {
          this.currentCategoryIndex += 1;
          this.currentQuestionIndex = 0;
          // Check to see if the quiz is over
          if (this.currentCategoryIndex >= Object.keys(this.questionsData).length) {
            // alert("end of quiz");
            // restarting for now...
            this._finishQuiz();
            return;
          }
        }
        // Set up chosenCheckboxes to record answers to the next question
        this._clearAnswersData();
      },
      _clearAnswersData: function() {
        // Clear the selection data
        // console.log(this.currentType);
        if ( this.currentType == "checkbox" ) {
          this.chosenCheckboxes = [];
          var a = 0;
          while ( a < this.currentQuestionObject["answers"].count ) {
            chosenCheckboxes[a] = false;
            a += 1;
          }
        } else if ( this.currentType == "radio" ) {
          this.chosenRadio = -1;
        } else {
          console.log("Could not determine question type");
        }
        // console.log(this.chosenCheckboxes);
        // console.log(this.chosenRadio);
      },
      _doMathForAnswer: function( questionIndex ) {
        // console.log("DoMathOpen");
        // do the math for that bubbled answer
        // console.log(questionIndex);
        // console.log(this.currentAnswers);
        var mathOps = this.currentAnswers[questionIndex]["math"];
        for (var opI=0; opI<mathOps.length; opI++) {
          var op = mathOps[opI];
          // Update the dict of our variables
          var factorToAdd = 1.0; // by default, may be changed by math
          var multIndex = op.indexOf("*");
          if ( multIndex < 0 ) {
            // use the default factorToAdd of 1.0
          } else {
            factorToAdd = parseInt( op.slice( multIndex+1 ) );
            op = op.slice( 0, multIndex );
          }

          // apply the math to the main data storage
          quizResults[op] += factorToAdd;
        }
        // console.log("DoMathClose");
      },
      nextQuestionDisabled: function() {
        return ( this.currentType == "radio"
          && this.chosenRadio < 0 );
      },
      nextQuestion: function( countAnswers ) {
        // console.log("NEXT");
        // Grade / record this question's answers
        //    (unless countAnswers is false)
        if (countAnswers) {

          if ( this.currentType == "checkbox" ) {
            // console.log(this.chosenCheckboxes);
            // iterate through the available answers
            for (var i=0; i<this.currentAnswers.length; i++) {
              if ( this.chosenCheckboxes[i] == true ) {
                // does the math operation specified in the json
                this._doMathForAnswer(i);
              }
            }
          } else if ( this.currentType == "radio" ) {
            if ( !(this.chosenRadio>=0 && this.chosenRadio<this.currentAnswers.length) ) {
              // none selected, so do nothing
            } else {
              // does the math operation specified in the json
              this._doMathForAnswer(this.chosenRadio);
            }
          } else {
            console.log("currentType is neither checkbox nor radio...")
          }
        }

        this._incrementQuestion();
        return false;
      }
    }
  }
</script>

<style scoped>

.proceed-button {
  margin-left: 6px;
  margin-right: 6px;
  margin-top: 16px;
  margin-bottom: 16px;
  font-size: 10pt;
}
.quiz {
  /*padding: 8px;*/
  /*background-color: blue;*/
}
.question-prompt {
  /*margin: 0;*/
  font-weight: bold;
}
.answers {
  text-align: left;
}
.results {
  margin: 16px;
  font-size: 12pt;
  text-align: left;
  /*margin-bottom: 200px;*/
}
.results h2 {
  font-size: 16pt;
}
.results p {
  /*background-color: red;*/
  /*margin-bottom: 100px;*/
}
</style>