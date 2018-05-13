<template>
  <div id="app">
    <div id="top-bar">
      <h1 class="noselect">Social Media Something</h1>
      <h2 v-if="!quizActive" class="subtitle">
        Do you know what social media doing to you?
        <br>
        Take this quiz to find out!
      </h2>
    </div>
    <button class="big-button" v-if="!quizActive" v-on:click="beginQuiz()">BEGIN QUIZ</button>
    <quiz v-if="quizActive"></quiz>
    <a href="./resources.html" class="resources-link">Browse all resources</a>
    <share-screen></share-screen>
    <!-- <test></test> -->
  </div>
</template>

<script>
import Test from './components/Test'
import Quiz from './components/Quiz'
import ShareScreen from './components/ShareScreen'

export default {
  name: 'App',
  components: {
    Test,
    Quiz,
    ShareScreen
  },
  data: function() {
    return {
      quizActive: false
    };
  },
  computed: {

  },
  methods: {
    beginQuiz: function() {
      this.quizActive = true;
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /*background-color: ;*/
  /*margin-top: 60px;*/
}
#top-bar {
  /*background-color: red;*/
  /*height: 90px;*/
}
.big-button {
  display: block;
  box-sizing: border-box;
  /*background-color: green;*/
  margin: auto;
  margin-top: 8px;
  margin-bottom: 8px;
  border-style: solid;
  border-width: 1px;
  border-radius: 10px;
  padding: 10px;
  color: black;
  font-family: "Avenir";
  text-decoration: none;
  font-size: 16pt;
  font-weight: bold;
  width: 90%;
}
.resources-link {
  display: block;
  box-sizing: border-box;
  background-color: green;
  padding: 10px;
  color: black;
  font-family: "Avenir";
  text-decoration: none;
}
.subtitle {
  background-color: rgb(255,219,109);
  color: black;
  margin: 0px;
  padding: 6px;
  font-size: 12pt;
}

</style>
