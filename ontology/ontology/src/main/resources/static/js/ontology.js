// window.location.href = window.location.href
// window.location.replace(window.location.href)

var frame = document.getElementById('ontology');
// window.onload = function() {
//     if(!window.location.hash) {
//         window.location = window.location + '#final';
//         window.location.reload();
//     }
// }
// $(window).on("load", function() {
//     // alert(1);
//     // var iframe = $("iframe").attr("src","/ontology/ont.txt");
//     $("#onto").append('<iframe id="ontology" style="height: 100%;width: 100%;border: none;" src="/ontology/ont.txt"></iframe>');
//     var frame = document.getElementById('ontology');
//     var body = frame.contentWindow.document.querySelector('body');
//     body.style.color = 'white';
// })

frame.onload = function () {
    var body = frame.contentWindow.document.querySelector('body');
    body.style.color = 'white';
};

// $(window).ready(function() {
//     frame.src = frame.src;
//     frame.src = frame.src;
//     frame.src = frame.src;
//     frame.src = frame.src;
//     frame.src = frame.src;
//     frame.src = frame.src;
// });
