
// options and settings
var comment_depth = 4; // How deep to go in nested comment threads
var count_multiple_posts = false;
    // true/false.
    // Whether one user posting in one subreddit multiple times
    // counts those multiple times.
var min_subscribers_count = 3000;
    // minimum number of subscribers a subreddit needs to have to be included
// SCORE = (post_count ** post_count_power) / ((active_users ** active_users_power) * (subscribers ** subscribers_power))
var post_count_power = 2.5;
    // 1 to infinity.
    // How much to weight the post count against the number
    // of subscribers and number of active users of that subreddit.
    // Higher numbers tend to favor default subreddits.
var active_users_power = 0.2;
var subscribers_power = 0.8;
    // Larger numbers tend to favor small subreddits.
    
// variables to store data collected
var subreddit_to_analyze = "";
var all_data = {}; // dict of users and their subreddits
var condensed_subreddit_data = {}; // dict of subreddits
var sorted_subs = [];


var showStage = function(stage) {
    $("#results-stage").html(stage);
}


var analyzeNextButton = function(event) {
    // console.log(event);
    var newsub = event.target.id.substring("analyze-button-".length);
    $("#subreddit-input").val(newsub);
    analyzeBtn();
}
var displayResults = function() {
    for (var i=0; i<sorted_subs.length; i++) {
        var sub = sorted_subs[i];
        if (sub.hits <= 2) {
            break;
        }
        $("#results-table").append($("<tr></tr>")
                                   .addClass("results-data-piece")
                                   .append($("<th></th>")
                                           .html(i+1))
                                   .append($("<th></th>")
                                           .append($("<a></a>")
                                                   .html("/r/"+sub.subreddit_name)
                                                   .attr("href","https://www.reddit.com/r/"+sub.subreddit_name)
                                                   .attr("target","_blank")))
                                   // .append($("<th></th>")
                                           // .html(sub.activity.toFixed(3)))
                                   .append($("<th></th>")
                                           .append($("<button>ANALYZE</button>")
                                                   .addClass("general-analyze-button")
                                                   .attr("id","analyze-button-"+sub.subreddit_name))));
        $("#analyze-button-"+sub.subreddit_name).click(analyzeNextButton)
    }
}


var keepCrunchingNumbers = function() {
    showStage("Sorting data...");
    for (var subreddit in condensed_subreddit_data) {
        if (condensed_subreddit_data[subreddit]["subscribers"] < min_subscribers_count) {
            delete condensed_subreddit_data[subreddit];
        } else {
            var activity = 1.0;
            activity = activity / Math.pow(condensed_subreddit_data[subreddit]["subscribers"], subscribers_power);
            activity = activity / Math.pow(condensed_subreddit_data[subreddit]["active_users"], active_users_power);
            activity = activity * Math.pow(condensed_subreddit_data[subreddit]["count"], post_count_power);
            // console.log(condensed_subreddit_data[subreddit]);
            condensed_subreddit_data[subreddit]["activity"] = activity;
            delete condensed_subreddit_data[subreddit]["post_count"];
            // delete condensed_subreddit_data[subreddit]["active_users"];
        }
    }

    // sort the list of subreddits, just the top 200
    sorted_subs = [];
    for (var i=0; i<200; i++) {
        var highestActivity = 0;
        var highestActivitySubreddit = "";
        var highestActivitySubscribers = 0;
        var highestActivityActiveUsers = 0;
        var highestActivityHits = 0;
        for (var subreddit in condensed_subreddit_data) {
            if (condensed_subreddit_data[subreddit]["subscribers"] < min_subscribers_count) {
                console.error("If you're reading this, then that means I made a mistake when deleting keys while iterating through JavaScript objects. As a result, a few subreddits with <"+min_subscribers_count+" might be in the results.");
            }
            // console.log(condensed_subreddit_data);
            // console.log(subreddit);
            if (condensed_subreddit_data[subreddit]["activity"] > highestActivity) {
                highestActivity = condensed_subreddit_data[subreddit]["activity"];
                highestActivitySubreddit = subreddit;
                highestActivitySubscribers = condensed_subreddit_data[subreddit]["subscribers"];
                highestActivityActiveUsers = condensed_subreddit_data[subreddit]["active_users"];
                highestActivityHits = condensed_subreddit_data[subreddit]["count"];
            }
        }
        // has found the highest ratio now
        sorted_subs.push({
            subreddit_name: highestActivitySubreddit,
            activity: highestActivity,
            subscribers: highestActivitySubscribers,
            active_users: highestActivityActiveUsers,
            hits: highestActivityHits
        });
        delete condensed_subreddit_data[highestActivitySubreddit];
    }

    var numUsersAnalyzed = Object.keys(all_data).length;
    showStage("Done! "+numeral( numUsersAnalyzed ).format('0,0')+" users analyzed.");
    $("#subreddit-input").removeAttr("disabled");
    $("#analyze-button").html("ANALYZE");
    $("#analyze-button").removeAttr("disabled");
    $("#results-table").show();
    displayResults();
}

var pending_async_about_calls = 0;
var asyncTrackerReadAbout = function(change) {
    pending_async_about_calls += change;
    if (pending_async_about_calls === 0) {
        keepCrunchingNumbers();
    }
}
var crunchNumbers = function() {
    showStage("Crunching data...");
    asyncTrackerReadAbout(1);
    for (var user in all_data) {
        for (var subreddit in all_data[user]["subreddits"]) {
            if (!(subreddit in condensed_subreddit_data)) {
                //
                condensed_subreddit_data[subreddit] = {};
                condensed_subreddit_data[subreddit]["count"] = 0;
                // console.log(pending_async_about_calls);
                asyncTrackerReadAbout(1);
                $.ajax({
                    dataType: "json",
                    url: "https://www.reddit.com/r/"+subreddit+"/about.json",
                    data: {},
                    this_subreddit: subreddit,
                    success: function(response) {
                        condensed_subreddit_data[this.this_subreddit]["subscribers"] = response.data.subscribers;
                        condensed_subreddit_data[this.this_subreddit]["active_users"] = response.data.active_user_count + 10; // to fudge the numbers and avoid div-by-zero
                        asyncTrackerReadAbout(-1);
                    },
                    error: function(response) {
                        console.error("Error with subreddit /r/"+this.this_subreddit);
                        asyncTrackerReadAbout(-1);
                    }
                });
            }
            // console.log(all_data[user])
            if (count_multiple_posts) {
                condensed_subreddit_data[subreddit]["count"] += Math.pow(all_data[user]["subreddits"][subreddit], 0.1);
            } else {
                condensed_subreddit_data[subreddit]["count"] += 1;
            }
        }
    }
    asyncTrackerReadAbout(-1);
}
var pending_async_user_calls = 0;
var asyncTrackerReadUsers = function(change) {
    pending_async_user_calls += change;
    // console.log(pending_async_user_calls);
    if (pending_async_user_calls === 0) {
        crunchNumbers();
    }
}
var collectSubreddits = function() {
    // Traverse usernames, scrape their histories for other subreddits
    showStage("Reading users' post and comment histories...");
    for (var user in all_data) {
        if (user === "[deleted]") {
            continue;
        }
        // console.log(user);
        // collect each user's subreddits
        asyncTrackerReadUsers(1); // announce pending async call
        $.ajax({
            dataType: "json",
            url: "https://www.reddit.com/user/"+user+".json",
            data: {
                limit: 50
            },
            this_user: user,
            success: function (response) {
                // console.log("Posts gotten from this user: "+response.data.children.length)
                for (var i in response.data.children) {
                    var comment = response.data.children[i];
                    if (comment.data.subreddit.toLowerCase() != subreddit_to_analyze.toLowerCase() && // the subreddit we're analyzing now
                        comment.data.subreddit.substr(0,2) != "u_") { // user profile page
                        if (!(comment.data.subreddit in all_data[this.this_user]["subreddits"])) {
                            all_data[this.this_user]["subreddits"][comment.data.subreddit] = 0;
                        }
                        all_data[this.this_user]["subreddits"][comment.data.subreddit] += 1;
                    }
                }
                asyncTrackerReadUsers(-1);
            },
            error: function (response) {
                asyncTrackerReadUsers(-1);
                if (response.status == 404) {

                } else {
                    console.error();
                }
            }
        });
    }
}
var pending_async_comment_calls = 0;
var asyncTrackerReadComments = function(change) {
    pending_async_comment_calls += change;
    // console.log(pending_async_comment_calls);
    if (pending_async_comment_calls === 0) {
        collectSubreddits();
    }
}
var collectUsers = function(subreddit) {
    // Traverse subreddit posts, scraping threads for usernames
    showStage("Visiting subreddit to gather usernames from posts and comments...");
    $.ajax({
        dataType: "json",
        url: "https://www.reddit.com/r/"+subreddit+"/hot.json",
        data: {
            limit: 100
        },
        success: function(response) {
            for (var i in response.data.children) {
                var post = response.data.children[i];
                asyncTrackerReadComments(1);
                $.ajax({
                    dataType: "json",
                    url: "https://www.reddit.com"+post.data.permalink+".json",
                    data: {
                        limit: 100
                    },
                    success: function(response) {
                        var top_level_comments = response[1].data.children;
                        // console.log(top_level_comments);
                        for (var j in top_level_comments) {
                            var top_level_comment = top_level_comments[j];
                            readCommentAndReplies(top_level_comment, comment_depth);
                        }
                        asyncTrackerReadComments(-1);
                    },
                    error: function(response) {
                        console.error("Error getting data!\n"+response);
                        asyncTrackerReadComments(-1);
                    }
                });
            }
        },
        error: function(response) {
            console.error("Error getting subreddit data!\n"+response);
        }
    });
}








var recordUser = function(username) {
    if (!(username in all_data)) {
        // create dictionary to store user's subreddits
        all_data[username] = {
            count:0, // # of posts in this subreddit
            subreddits:{}
        };
    }
    all_data[username]["count"] += 1;
}
var readCommentAndReplies = function(comment,depth) {
    if (depth === 0) {
        return;
    }
    recordUser(comment.data.author);
    // console.log(comment);
    if (comment.kind === "t1" && comment.data.replies != "") { // t1 for comment kind, replies for if it has children
        for (var i in comment.data.replies.data.children) {
            var reply = comment.data.replies.data.children[i];
            readCommentAndReplies(reply, depth-1);
        }
    }
}



var analyzeSubreddit = function(subreddit) {
    subreddit_to_analyze = subreddit;

    // Display
    $("#info-area").show();
    $("#info-link")
    .html("/r/"+subreddit_to_analyze)
    .attr("href","https://www.reddit.com/r/"+subreddit_to_analyze)
    .attr("target","_blank");
    $("#results-header").show();
    showStage("Analyzing subreddit...");

    // Calculate
    $.ajax({
        dataType: "json",
        url: "https://www.reddit.com/r/"+subreddit+"/about.json",
        data: {},
        success: function(response) {
            if (response.data.subscribers < 3000) {
                console.log("Sorry, that subreddit is not big enough to analyze!")
            } else {
                // launch into analysis:
                // Visit a subreddit, collect usernames
                // (this will indirectly call the other processing stages,
                // which are collectSubreddits() and crunchNumbers)
                // $("#info-header").show();
                // console.log(response.data.subscribers); // subs range from 0 to ~20m
                $("#info-header-subs").html(" ("+numeral( response.data.subscribers ).format('0,0')+" subscribers)");
                collectUsers(subreddit);
            }
        },
        error: function(response) {
            alert("Sorry, could not reach that subreddit.");
            $("#subreddit-input").removeAttr("disabled");
            $("#analyze-button").html("ANALYZE");
            $("#analyze-button").removeAttr("disabled");
            $("#results-table").show();
            preAnalysisUIClean();
        }
    });
}

var preAnalysisUIClean = function() {
    $("#results-header").hide();
    $("#results-table").hide();
    $("#info-area").hide();
    $(".results-data-piece").remove();
}


var analyzeBtn = function() {
    $("#subreddit-input").attr("disabled","disabled");
    $("#analyze-button").html("ANALYZING...");
    $("#analyze-button").attr("disabled","disabled");
    preAnalysisUIClean();
    all_data = {};
    condensed_subreddit_data = {};
    sorted_subs = [];
    pending_async_comment_calls = pending_async_user_calls = pending_async_about_calls = 0;
    analyzeSubreddit($("#subreddit-input").val());
}
$(document).ready(function() {
    preAnalysisUIClean();
    $("#analyze-button").click(analyzeBtn);
});
