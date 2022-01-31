var nodes_cnt = 0;
var objectProperty_cnt = 0;
var subClassProperty_cnt = 0;
var datatypes_cnt = 0;
const nodes = new Map();
const objectProperty = new Map();
const subClassProperty = new Map();
const allsubClassRelation = new Set();
const datatypes = new Map();

window.onload = function(){
    classClick();
}

class property{
    constructor(from, to, label) {
        this.from = from;
        this.to = to;
        this.label = label;
    }
}

class datatype{
    constructor(className, type, label) {
        this.className = className;
        this.type = type;
        this.label = label;
    }
}

function addClass(){
    var label = $('#newClassLabel').val().trim();
    if(label==""){
        $('#logs').prepend(`<div class="red">Label field can not be empty</div>`);
        return;
    }
    nodes_cnt++;
    var className = "class"+nodes_cnt.toString();
    nodes.set(className,label);
    $('#logs').prepend(`<div class="green">New class labelled ${label} added</div>`);
    $('#classes').append(`<div id="${className}">${label}</div>`);
    $('#newPropertyFrom').append(`<option value="${className}">${label} (${className})</option>`);
    $('#newPropertyTo').append(`<option value="${className}">${label} (${className})</option>`);
    $('#newDatatypeClass').append(`<option value="${className}">${label} (${className})</option>`);
}

function addProperty(){
    var type = $('[name=prpertyType]:checked').val();
    if(type=="1"){
        objectProperty_cnt++;
        var propertyName = "objectProperty"+objectProperty_cnt.toString();
        var label = $('#newPropertyLabel').val().trim();
        var from = $('#newPropertyFrom').val();
        var to = $('#newPropertyTo').val();
        if(label==""){
            $('#logs').prepend(`<div class="red">Label field can not be empty</div>`);
            return;
        }
        if(from==to){
            $('#logs').prepend(`<div class="red">Property can only be added between two different classes</div>`);
            return;
        }
        objectProperty.set(propertyName,new property(from, to, label));
        $('#logs').prepend(`<div class="green">${nodes.get(from)} ${label} ${nodes.get(to)} property added</div>`);
        $('#objectProperty').append(`<div id="${propertyName}">${nodes.get(from)} ${label} ${nodes.get(to)}</div>`);
    }else if(type=="2"){
        subClassProperty_cnt++;
        var propertyName = "subClassProperty"+subClassProperty_cnt.toString();
        var label = "Sub-class of";
        var from = $('#newPropertyFrom').val();
        var to = $('#newPropertyTo').val();
        if(from==to){
            $('#logs').prepend(`<div class="red">Property can only be added between two different classes</div>`);
            return;
        }
        if(allsubClassRelation.has(`${from}->${to}`)){
            $('#logs').prepend(`<div class="yellow">Property ${nodes.get(from)} ${label} ${nodes.get(to)} is already added</div>`);
            return;
        }
        if(allsubClassRelation.has(`${to}->${from}`)){
            $('#logs').prepend(`<div class="red">Property ${nodes.get(from)} ${label} ${nodes.get(to)} cannot be added due to property ${nodes.get(to)} ${label} ${nodes.get(from)}</div>`);
            return;
        }
        subClassProperty.set(propertyName,new property(from, to, label));
        allsubClassRelation.add(`${from}->${to}`);
        $('#logs').prepend(`<div class="green">${nodes.get(from)} ${label} ${nodes.get(to)} property added</div>`);
        $('#subClassProperty').append(`<div id="${propertyName}">${nodes.get(from)} ${label} ${nodes.get(to)}</div>`);
    }else{
        $('#logs').prepend(`<div class="red">Select the type of property</div>`);
        return;
    }
}


function removeDefault(){
    $('#newPropertyLabel').val("");
    $('#newPropertyLabel').prop("readonly", false);
}

function addDefault(){
    $('#newPropertyLabel').val("Sub-class of");
    $('#newPropertyLabel').prop("readonly", true);
}

function addDatatype(){
    var label = $('#newDatatypeLabel').val().trim();
    if(label==""){
        $('#logs').prepend(`<div class="red">Label field can not be empty</div>`);
        return;
    }
    var type = $('#newDatatypeType').val();
    var className = $('#newDatatypeClass').val();
    datatypes_cnt++;
    var datatypeName = "datatypes"+datatypes_cnt.toString();
    datatypes.set(datatypeName,new datatype(className,type,label));
    $('#logs').prepend(`<div class="green">${type} datatype with property ${label} added to ${nodes.get(className)}</div>`);
    $('#datatypes').append(`<div id="${datatypeName}">${className} has ${type} ${label}</div>`);
}

function classClick(){
    $('#addClass').show();
    $('#addProperty').hide();
    $('#addDatatype').hide();
}

function propertyClick(){
    if(nodes.size < 2){
        $('#logs').prepend(`<div class="red">Atleast 2 classes are needed to add property</div>`);
        return;
    }
    $('#addClass').hide();
    $('#addProperty').show();
    $('#addDatatype').hide();
}

function dataClick(){
    if(nodes.size < 1){
        $('#logs').prepend(`<div class="red">Atleast 1 class is needed to add property</div>`);
        return;
    }
    $('#addClass').hide();
    $('#addProperty').hide();
    $('#addDatatype').show();
}
