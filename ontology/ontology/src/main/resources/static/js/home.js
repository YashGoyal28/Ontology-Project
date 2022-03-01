var nodes_cnt = 0;
var objectProperty_cnt = 0;
var subClassProperty_cnt = 0;
var datatypes_cnt = 0;
const nodes = new Map();
const objectProperty = new Map();
const subClassProperty = new Map();
const allsubClassRelation = new Set();
const datatypes = new Map();
var confirm=0;

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
    $('#modals').append(`
        <div id="deleteModal${className}" class="modal fade">
            <div class="modal-dialog modal-confirm">
                <div class="modal-content">
                    <div class="modal-header flex-column">
                        <div class="icon-box">
                            <i class="material-icons">&#xE5CD;</i>
                        </div>
                        <h4 class="modal-title w-100">Are you sure?</h4>
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Do you really want to delete these records? This process cannot be undone.</p>
                    </div>
                    <div class="modal-footer justify-content-center">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="${className}delete" class="deleteClassbtn" onclick="deleteClassbtn(this);" data-dismiss="modal">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `);
    $('#classes').append(`
        <div class="list_objects" id="${className}">
            ${label}
            <div href="#deleteModal${className}" data-toggle="modal" style="cursor:pointer;">
                <img src="https://img.icons8.com/material/24/ffffff/filled-trash.png"/>
            </div>
        </div>
    `);
    $('#newPropertyDomain').append(`<option id="${className}domain" value="${className}">${label} (${className})</option>`);
    $('#newPropertyRange').append(`<option id="${className}range" value="${className}">${label} (${className})</option>`);
    $('#newDatatypeClass').append(`<option id="${className}datatypeclass" value="${className}">${label} (${className})</option>`);

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
    $('#deleteModal'+className).remove();
    $('#'+className).remove();
    $('#'+className+'domain').remove();
    $('#'+className+'range').remove();
    $('#'+className+'datatypeclass').remove();
    var rem = [];
    for(const [key,value] of objectProperty.entries()){
        if(value.domain==className || value.range==className){
            rem.push(key);
        }
    }
    for(let i of rem){
        let obj = document.getElementById(i+'delete');
        deletePropertybtn(obj,false);
    }
    rem = [];
    for(const [key,value] of subClassProperty.entries()){
        if(value.domain==className || value.range==className){
            rem.push(key);
        }
    }
    for(let i of rem){
        let obj = document.getElementById(i+'delete');
        deleteSubclassbtn(obj,false,false);
    }
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
        $('#modals').append(`
            <div id="deleteModal${propertyName}" class="modal fade">
                <div class="modal-dialog modal-confirm">
                    <div class="modal-content">
                        <div class="modal-header flex-column">
                            <div class="icon-box">
                                <i class="material-icons">&#xE5CD;</i>
                            </div>
                            <h4 class="modal-title w-100">Are you sure?</h4>
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p>Do you really want to delete these records? This process cannot be undone.</p>
                        </div>
                        <div class="modal-footer justify-content-center">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="${propertyName}delete" class="deleteClassbtn" onclick="deletePropertybtn(this,true);" data-dismiss="modal">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        $('#objectProperty').append(`
            <div class="list_objects" id="${propertyName}">
                <div>${nodes.get(domain)} ${label} ${nodes.get(range)}</div>
                <div href="#deleteModal${propertyName}" data-toggle="modal" style="cursor:pointer;">
                    <img src="https://img.icons8.com/material/24/ffffff/filled-trash.png"/>
                </div>
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
        $('#modals').append(`
            <div id="deleteModal${propertyName}" class="modal fade">
                <div class="modal-dialog modal-confirm">
                    <div class="modal-content">
                        <div class="modal-header flex-column">
                            <div class="icon-box">
                                <i class="material-icons">&#xE5CD;</i>
                            </div>
                            <h4 class="modal-title w-100">Are you sure?</h4>
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p>Do you really want to delete these records? This process cannot be undone.</p>
                        </div>
                        <div class="modal-footer justify-content-center">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="${propertyName}delete" class="deleteClassbtn" onclick="deleteSubclassbtn(this,true);" data-dismiss="modal">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        $('#subClassProperty').append(`
            <div class="list_objects" id="${propertyName}">
                <div>${nodes.get(domain)} ${label} ${nodes.get(range)}</div>
                <div href="#deleteModal${propertyName}" data-toggle="modal" style="cursor:pointer;">
                    <img src="https://img.icons8.com/material/24/ffffff/filled-trash.png"/>
                </div>
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

function deletePropertybtn(e,log=true){
    var propertyName = e.id;
    propertyName = propertyName.slice(0, -6);
    $('#deleteModal'+propertyName).remove();
    $('#'+propertyName).remove();
    // console.log(propertyName);
    var prop = objectProperty.get(propertyName);
    var domain = prop.domain;
    var range = prop.range;
    var label = prop.label;
    if(log) $('#logs').prepend(`<div class="red">${nodes.get(domain)} ${label} ${nodes.get(range)} property deleted</div>`);
    objectProperty.delete(propertyName);
    $.ajax({
        type: "POST",
        url: "delete_object_property",
        data: {
            "propertyName" : propertyName,
        },
    });
}

function deleteSubclassbtn(e,log=true,backend=true){
    var propertyName = e.id;
    propertyName = propertyName.slice(0, -6);
    $('#deleteModal'+propertyName).remove();
    $('#'+propertyName).remove();
    var prop = subClassProperty.get(propertyName);
    var domain = prop.domain;
    var range = prop.range;
    var label = prop.label;
    if(log) $('#logs').prepend(`<div class="red">${nodes.get(domain)} ${label} ${nodes.get(range)} property deleted</div>`);
    subClassProperty.delete(propertyName);
    if(backend){
        $.ajax({
            type: "POST",
            url: "delete_sub_class",
            data: {
                "range" : range,
                "domain" : domain,
            },
        });
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


// function deleteDatatypebtn(e){
//     var label = $('#newDatatypeLabel').val().trim();
//     if(label==""){
//         $('#logs').prepend(`<div class="red">Label field can not be empty</div>`);
//         return;
//     }
//     var type = $('#newDatatypeType').val();
//     var className = $('#newDatatypeClass').val();
//     datatypes_cnt++;
//     var datatypeName = "datatypes"+datatypes_cnt.toString();
//     datatypes.set(datatypeName,new datatype(className,type,label));
//     $('#logs').prepend(`<div class="green">${type} datatype with property ${label} added to ${nodes.get(className)}</div>`);
//     $('#datatypes').append(`<div id="${datatypeName}">${className} has ${type} ${label}</div>`);

//     $.ajax({
//         type: "POST",
//         url: "add_datatype",
//         data: {
//             "className" : className,
//             "type" : type,
//             "label" : label,
//             "datatypeName" : datatypeName,
//         },
//     });
// }

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
