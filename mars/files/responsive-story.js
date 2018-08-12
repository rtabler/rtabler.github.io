var landed = false;

var checkLanded = function() {
    var w = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;
    if (landed) {
        // if (w>=1088) {
        //     document.getElementById("end-text-2").style.opacity = "1";
        // }
        return;
    }
    // console.log(w<=512);
    if (w <= 512) {
        document.getElementById("instruction-text").style.display = "none";
        document.getElementById("end-text-1").style.top = "400px";
        document.getElementById("end-text-1").style.opacity = "1";
        document.getElementById("end-text-2").style.top = "380px";
        // document.getElementById("end-text-2").style.opacity = "1";
        document.getElementById("screen").style.background = "url(files/img-26.jpg)";
        landed = true;
    }
}

checkLanded();
setInterval(checkLanded, 100);
