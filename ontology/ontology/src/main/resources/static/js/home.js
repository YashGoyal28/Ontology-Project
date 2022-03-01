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
    constructor(domain, range, label) {
        this.domain = domain;
        this.range = range;
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



$("#addClassbtn").click( function(e){
    e.preventDefault();
    var label = $('#newClassLabel').val().trim();
    if(label==""){
        $('#logs').prepend(`<div class="red">Label field can not be empty</div>`);
        return;
    }
    nodes_cnt++;
    var className = "class"+nodes_cnt.toString();
    nodes.set(className,label);
    $('#logs').prepend(`<div class="green">New class labelled ${label} added</div>`);
    $('#classes').append(`
        <div class="list_objects" id="${className}">
            ${label}
            <div style="cursor:pointer;" id="${className}delete" class="deleteClassbtn" onclick="deleteClassbtn(this);"><img src="https://img.icons8.com/material/24/ffffff/filled-trash.png"/></div>
        </div>
    `);
    $('#newPropertyDomain').append(`<option value="${className}">${label} (${className})</option>`);
    $('#newPropertyRange').append(`<option value="${className}">${label} (${className})</option>`);
    $('#newDatatypeClass').append(`<option value="${className}">${label} (${className})</option>`);

    $.ajax({
        type: "POST",
        url: "add_class",
        data: {
            "className" : className,
            "label" : label,
        },
    });
});

function deleteClassbtn(e){
    var className = e.id;
    className = className.slice(0, -6);
    $('#'+className).remove();
    $('#logs').prepend(`<div class="red">Class labelled ${nodes.get(className)} deleted</div>`);
    nodes.delete(className);
    $.ajax({
        type: "POST",
        url: "delete_class",
        data: {
            "className" : className,
        },
    });
}



$("#addPropertybtn").click( function(e){
    e.preventDefault();
    var type = $('[name=prpertyType]:checked').val();
    if(type=="1"){
        objectProperty_cnt++;
        var propertyName = "objectProperty"+objectProperty_cnt.toString();
        var label = $('#newPropertyLabel').val().trim();
        var domain = $('#newPropertyDomain').val();
        var range = $('#newPropertyRange').val();
        if(label==""){
            $('#logs').prepend(`<div class="red">Label field can not be empty</div>`);
            return;
        }
        if(domain==range){
            $('#logs').prepend(`<div class="red">Property can only be added between two different classes</div>`);
            return;
        }
        objectProperty.set(propertyName,new property(domain, range, label));
        $('#logs').prepend(`<div class="green">${nodes.get(domain)} ${label} ${nodes.get(range)} property added</div>`);
        $('#objectProperty').append(`
            <div class="list_objects" id="${propertyName}">
                <div>${nodes.get(domain)} ${label} ${nodes.get(range)}</div>
                <div style="cursor:pointer;"><img src="https://img.icons8.com/material/24/ffffff/filled-trash.png"/></div>
            </div>
        `);

        $.ajax({
            type: "POST",
            url: "add_object_property",
            data: {
                "domain" : domain,
                "range" : range,
                "label" : label,
                "propertyName" : propertyName,
            },
        });
    }else if(type=="2"){
        subClassProperty_cnt++;
        var propertyName = "subClassProperty"+subClassProperty_cnt.toString();
        var label = "Sub-class of";
        var domain = $('#newPropertyDomain').val();
        var range = $('#newPropertyRange').val();
        if(domain==range){
            $('#logs').prepend(`<div class="red">Property can only be added between two different classes</div>`);
            return;
        }
        if(allsubClassRelation.has(`${domain}->${range}`)){
            $('#logs').prepend(`<div class="yellow">Property ${nodes.get(domain)} ${label} ${nodes.get(range)} is already added</div>`);
            return;
        }
        if(allsubClassRelation.has(`${range}->${domain}`)){
            $('#logs').prepend(`<div class="red">Property ${nodes.get(domain)} ${label} ${nodes.get(range)} cannot be added due to property ${nodes.get(range)} ${label} ${nodes.get(domain)}</div>`);
            return;
        }
        subClassProperty.set(propertyName,new property(domain, range, label));
        allsubClassRelation.add(`${domain}->${range}`);
        $('#logs').prepend(`<div class="green">${nodes.get(domain)} ${label} ${nodes.get(range)} property added</div>`);
        $('#subClassProperty').append(`
            <div class="list_objects" id="${propertyName}">
                <div>${nodes.get(domain)} ${label} ${nodes.get(range)}</div>
                <div style="cursor:pointer;"><img src="https://img.icons8.com/material/24/ffffff/filled-trash.png"/></div>
            </div>
        `);

        $.ajax({
            type: "POST",
            url: "add_sub_class",
            data: {
                "domain" : domain,
                "range" : range,
                "label" : label,
                "propertyName" : propertyName,
            },
        });
    }else{
        $('#logs').prepend(`<div class="red">Select the type of property</div>`);
        return;
    }
});


function removeDefault(){
    $('#newPropertyLabel').val("");
    $('#newPropertyLabel').prop("readonly", false);
}

function addDefault(){
    $('#newPropertyLabel').val("Sub-class of");
    $('#newPropertyLabel').prop("readonly", true);
}

$("#addDatatypebtn").click( function(e){
    e.preventDefault();
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

    $.ajax({
        type: "POST",
        url: "add_datatype",
        data: {
            "className" : className,
            "type" : type,
            "label" : label,
            "datatypeName" : datatypeName,
        },
    });
});

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
